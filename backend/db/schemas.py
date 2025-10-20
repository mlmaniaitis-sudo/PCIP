from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

# Base schemas
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# User schemas
class UserBase(BaseSchema):
    phone_number: str = Field(..., regex=r"^\+?[\d\s\-()]+$")
    full_name: Optional[str] = None
    role: str = Field(..., regex=r"^(farmer|chc_staff|gov_admin)$")

class UserCreate(UserBase):
    password: Optional[str] = None  # Only for CHC/Gov users

class UserLogin(BaseSchema):
    phone_number: str
    password: str

class UserResponse(UserBase):
    user_id: UUID
    created_at: datetime

# OTP schemas
class OTPSendRequest(BaseSchema):
    phone_number: str

class OTPVerifyRequest(BaseSchema):
    phone_number: str
    otp_code: str = Field(..., min_length=6, max_length=6)

# Location schemas
class LocationPoint(BaseSchema):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

# CHC schemas
class CHCBase(BaseSchema):
    name: str
    contact_phone: Optional[str] = None
    location: LocationPoint

class CHCCreate(CHCBase):
    pass

class CHCResponse(CHCBase):
    chc_id: UUID
    owner_user_id: Optional[UUID] = None
    created_at: datetime

# Machine schemas
class MachineBase(BaseSchema):
    name: Optional[str] = None
    type: str
    device_id: Optional[str] = None

class MachineCreate(MachineBase):
    chc_id: UUID

class MachineUpdate(BaseSchema):
    name: Optional[str] = None
    status: Optional[str] = Field(None, regex=r"^(offline|idle|running|maintenance)$")

class MachineResponse(MachineBase):
    machine_id: UUID
    chc_id: UUID
    status: str
    last_seen: Optional[datetime] = None
    last_location: Optional[LocationPoint] = None
    created_at: datetime

# Telemetry schemas
class TelemetryPayload(BaseSchema):
    device_id: str
    location: Optional[LocationPoint] = None
    engine_on: Optional[bool] = None
    rpm: Optional[int] = Field(None, ge=0)
    vibration: Optional[float] = Field(None, ge=0)
    battery: Optional[int] = Field(None, ge=0, le=100)
    timestamp: Optional[datetime] = None

class TelemetryResponse(TelemetryPayload):
    ts: datetime
    machine_id: Optional[UUID] = None

# Farmer schemas
class FarmerProfileCreate(BaseSchema):
    pm_kisan_id: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class FarmerProfileResponse(FarmerProfileCreate):
    farmer_id: UUID
    created_at: datetime

# Parcel schemas
class ParcelCreate(BaseSchema):
    # GeoJSON-like geometry representation
    geometry: dict  # Should be a valid GeoJSON polygon
    crop: Optional[str] = None
    expected_harvest_date: Optional[date] = None
    area_hectares: Optional[float] = Field(None, gt=0)

class ParcelResponse(ParcelCreate):
    parcel_id: UUID
    farmer_id: UUID
    created_at: datetime

# Booking schemas
class BookingCreate(BaseSchema):
    machine_type_requested: str
    parcel_id: UUID
    requested_time: Optional[datetime] = None

class BookingUpdate(BaseSchema):
    status: Optional[str] = Field(None, regex=r"^(pending|accepted|rejected|in_progress|completed|cancelled)$")
    scheduled_time: Optional[datetime] = None
    final_amount: Optional[Decimal] = None
    notes: Optional[str] = None

class BookingResponse(BaseSchema):
    booking_id: UUID
    farmer_id: UUID
    chc_id: Optional[UUID] = None
    machine_id: Optional[UUID] = None
    machine_type_requested: str
    parcel_id: UUID
    requested_time: Optional[datetime] = None
    scheduled_time: Optional[datetime] = None
    status: str
    created_at: datetime
    final_amount: Optional[Decimal] = None
    notes: Optional[str] = None

# Satellite event schemas
class SatelliteEventCreate(BaseSchema):
    parcel_id: UUID
    image_date: date
    ndvi: Optional[float] = None
    sindri: Optional[float] = None
    nbr: Optional[float] = None
    burn_flag: bool = False
    confidence: Optional[float] = Field(None, ge=0, le=1)
    source: Optional[str] = None

class SatelliteEventResponse(SatelliteEventCreate):
    event_id: UUID
    created_at: datetime

# Green credit schemas
class GreenCreditResponse(BaseSchema):
    credit_id: UUID
    farmer_id: UUID
    source_booking_id: Optional[UUID] = None
    amount: Decimal
    status: str
    awarded_on: datetime
    redeemed_on: Optional[datetime] = None
    notes: Optional[str] = None

# Dashboard schemas
class CHCDashboardResponse(BaseSchema):
    machines_online: int
    machines_idle: int
    machines_running: int
    machines_maintenance: int
    pending_bookings: int
    completed_bookings_today: int
    total_utilization_hours_today: float

class GovDashboardResponse(BaseSchema):
    total_machines: int
    total_machines_online: int
    total_farmers: int
    total_bookings: int
    completed_bookings: int
    total_green_credits_awarded: Decimal
    avg_system_utilization: float

# API response wrappers
class APIResponse(BaseSchema):
    success: bool
    message: str
    data: Optional[dict] = None

class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse