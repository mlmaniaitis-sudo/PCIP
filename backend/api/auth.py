# api/auth.py (Updated for Option A)
import secrets # Keep for other potential uses if needed, but not OTP
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm

# --- Add/Ensure Twilio imports ---
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
# --- End Twilio imports ---

from core.config import settings
from core.database import db
from core.security import (
    hash_password,      # Keep
    verify_password,    # Keep
    # generate_otp,     # REMOVE
    create_access_token,# Keep
    # store_otp,        # REMOVE
    # verify_otp,       # REMOVE
    get_current_user,   # Keep
)
from db.schemas import (
    OTPSendRequest,
    OTPVerifyRequest,
    UserResponse,
    TokenResponse,
    APIResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/otp/send", response_model=APIResponse)
async def send_otp(request_body: OTPSendRequest = Body(...)):
    phone_number = request_body.phone_number

    # Check if Twilio Verify settings are configured
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_VERIFY_SERVICE_SID]):
        print("⚠️ Twilio Verify credentials not fully configured in .env file. Cannot send OTP.")
        # In production, you might want to raise an error here
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SMS service not configured."
        )

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Trigger Twilio Verify to send *its* OTP
        verification = client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID) \
            .verifications \
            .create(to=phone_number, channel='sms')

        print(f"Twilio Verify SMS triggered for {phone_number}, SID: {verification.sid}")
        # Check verification status if needed, though usually just sending is enough here
        # print(f"Verification status: {verification.status}")

        return APIResponse(success=True, message=f"OTP sent successfully via Twilio Verify to {phone_number[-4:]}")

    except TwilioRestException as e:
        print(f"❌ Failed to send Twilio Verify SMS: {e}")
        # Provide a more specific error detail if possible, masking sensitive info
        error_detail = f"Could not send OTP. Error code: {e.code}" if hasattr(e, 'code') else "Could not send OTP."
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_detail)
    except Exception as e:
        print(f"❌ Unexpected error sending SMS via Twilio Verify: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while sending OTP.")


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp_and_login(request_body: OTPVerifyRequest = Body(...)):
    phone_number = request_body.phone_number
    otp_code = request_body.otp_code # Code entered by the user

    # Check if Twilio Verify settings are configured
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_VERIFY_SERVICE_SID]):
        print("⚠️ Twilio Verify credentials not fully configured in .env file. Cannot verify OTP.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification service not configured."
        )

    # --- Verify the code using Twilio Verify API ---
    is_valid = False
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        verification_check = client.verify.v2.services(settings.TWILIO_VERIFY_SERVICE_SID) \
            .verification_checks \
            .create(to=phone_number, code=otp_code) # Send user's code to Twilio for checking

        is_valid = verification_check.status == 'approved'
        print(f"Twilio Verify check for {phone_number} status: {verification_check.status}")

    except TwilioRestException as e:
        # Handle specific Twilio errors, e.g., code expired or max attempts reached
        print(f"❌ Twilio Verify check failed for {phone_number}: {e}")
        # A 404 status from Twilio often means the code didn't match or expired
        if e.status == 404:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP code.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during OTP verification with provider."
            )
    except Exception as e:
         print(f"❌ Unexpected error during Twilio check: {e}")
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not verify OTP.")
    # --- End Twilio Verification ---

    if not is_valid:
        # This case might be hit if Twilio check status wasn't 'approved' but didn't raise 404
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP verification failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --- Find or create farmer user logic remains the same ---
    user = await db.fetch_one(
        """
        SELECT user_id, phone_number, role, full_name, created_at
        FROM users
        WHERE phone_number = $1 AND role = 'farmer'
        """,
        phone_number,
    )

    if not user:
        try:
            user = await db.fetch_one(
                """
                INSERT INTO users (phone_number, role)
                VALUES ($1, 'farmer')
                RETURNING user_id, phone_number, role, full_name, created_at
                """,
                phone_number,
            )
            if not user:
                raise Exception("Failed to create user record")
            # Ensure farmer profile exists
            await db.execute(
                "INSERT INTO farmer_profiles (farmer_id) VALUES ($1) ON CONFLICT (farmer_id) DO NOTHING",
                user["user_id"],
            )
            print(f"✅ New farmer registered: {phone_number}")
        except Exception as e:
            print(f"❌ Error creating farmer user: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not register user.")
    else:
        print(f"✅ Farmer logged in: {phone_number}")

    # --- Token creation logic remains the same ---
    access_token_expires = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(data={"sub": str(user["user_id"])}, expires_delta=access_token_expires)

    user_response = UserResponse(
        user_id=user["user_id"],
        phone_number=user["phone_number"],
        role=user["role"],
        full_name=user.get("full_name"), # Use get() for safety
        created_at=user["created_at"],
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=int(access_token_expires.total_seconds()),
        user=user_response,
    )


# --- No changes needed for /login or /users/me endpoints ---
@router.post("/login", response_model=TokenResponse)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    phone_number = form_data.username
    password = form_data.password

    user = await db.fetch_one(
        """
        SELECT user_id, phone_number, role, full_name, created_at, hashed_password
        FROM users
        WHERE phone_number = $1 AND role != 'farmer'
        """,
        phone_number,
    )

    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(data={"sub": str(user["user_id"])}, expires_delta=access_token_expires)

    user_response = UserResponse(
        user_id=user["user_id"],
        phone_number=user["phone_number"],
        role=user["role"],
        full_name=user.get("full_name"),
        created_at=user["created_at"],
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=int(access_token_expires.total_seconds()),
        user=user_response,
    )


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
     # Convert dict from get_current_user to UserResponse Pydantic model
    return UserResponse(
        user_id=current_user["user_id"],
        phone_number=current_user["phone_number"],
        role=current_user["role"],
        full_name=current_user.get("full_name"),
        created_at=current_user["created_at"],
    )