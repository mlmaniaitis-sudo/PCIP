from typing import List, Optional
from uuid import UUID

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, Path, status, Query

from core.database import db
from core.security import get_current_chc_staff
from db.schemas import CHCCreate, CHCResponse, MachineCreate, MachineResponse, LocationPoint, BookingResponse, BookingUpdate

from websocket.manager import websocket_manager

router = APIRouter(prefix="/chc", tags=["CHC Management"])


@router.post("/", response_model=CHCResponse)
async def create_chc(
    payload: CHCCreate,
    current_user: dict = Depends(get_current_chc_staff),
):
    """Create a CHC owned by the current CHC staff user."""
    try:
        point_wkt = f"POINT({payload.location.longitude} {payload.location.latitude})"
        row = await db.fetch_one(
            """
            INSERT INTO chcs (owner_user_id, name, contact_phone, location)
            VALUES ($1, $2, $3, ST_GeogFromText($4))
            RETURNING chc_id, owner_user_id, name, contact_phone,
                     ST_Y(location::geometry) as latitude,
                     ST_X(location::geometry) as longitude,
                     created_at
            """,
            current_user["user_id"], payload.name, payload.contact_phone, point_wkt,
        )
        if not row:
            raise HTTPException(status_code=500, detail="Failed to create CHC")

        return CHCResponse(
            chc_id=row["chc_id"],
            owner_user_id=row["owner_user_id"],
            name=row["name"],
            contact_phone=row["contact_phone"],
            location=LocationPoint(latitude=row["latitude"], longitude=row["longitude"]),
            created_at=row["created_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def _assert_user_owns_chc(chc_id: UUID, user_id: UUID):
    chc = await db.fetch_one("SELECT owner_user_id FROM chcs WHERE chc_id = $1", chc_id)
    if not chc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CHC not found")
    if chc["owner_user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this CHC")


@router.get("/{chc_id}/machines", response_model=List[MachineResponse])
async def list_machines(
    chc_id: UUID = Path(..., description="CHC ID"),
    current_user: dict = Depends(get_current_chc_staff),
):
    """List machines for a CHC (only by its owner)."""
    await _assert_user_owns_chc(chc_id, current_user["user_id"])

    rows = await db.fetch_all(
        """
        SELECT m.machine_id, m.chc_id, m.name, m.type, m.device_id, m.status, m.last_seen, m.created_at,
               ST_Y(m.last_location::geometry) as latitude,
               ST_X(m.last_location::geometry) as longitude
        FROM machines m
        WHERE m.chc_id = $1
        ORDER BY m.created_at DESC
        """,
        chc_id,
    )

    results: List[MachineResponse] = []
    for r in rows:
        last_location: Optional[LocationPoint] = None
        if r.get("latitude") is not None and r.get("longitude") is not None:
            last_location = LocationPoint(latitude=r["latitude"], longitude=r["longitude"])
        results.append(
            MachineResponse(
                machine_id=r["machine_id"],
                chc_id=r["chc_id"],
                name=r.get("name"),
                type=r["type"],
                device_id=r.get("device_id"),
                status=r["status"],
                last_seen=r.get("last_seen"),
                last_location=last_location,
                created_at=r["created_at"],
            )
        )
    return results


@router.post("/{chc_id}/machines", response_model=MachineResponse)
async def add_machine(
    chc_id: UUID = Path(..., description="CHC ID"),
    payload: MachineCreate = ...,
    current_user: dict = Depends(get_current_chc_staff),
):
    """Add a machine to a CHC (only by its owner)."""
    await _assert_user_owns_chc(chc_id, current_user["user_id"])

    try:
        row = await db.fetch_one(
            """
            INSERT INTO machines (chc_id, name, type, device_id)
            VALUES ($1, $2, $3, $4)
            RETURNING machine_id, chc_id, name, type, device_id, status, last_seen, created_at,
                      ST_Y(last_location::geometry) as latitude,
                      ST_X(last_location::geometry) as longitude
            """,
            chc_id, payload.name, payload.type, payload.device_id,
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="device_id already exists")

    last_location: Optional[LocationPoint] = None
    if row.get("latitude") is not None and row.get("longitude") is not None:
        last_location = LocationPoint(latitude=row["latitude"], longitude=row["longitude"])

    return MachineResponse(
        machine_id=row["machine_id"],
        chc_id=row["chc_id"],
        name=row.get("name"),
        type=row["type"],
        device_id=row.get("device_id"),
        status=row["status"],
        last_seen=row.get("last_seen"),
        last_location=last_location,
        created_at=row["created_at"],
    )


@router.get("/bookings", response_model=List[BookingResponse])
async def list_chc_bookings(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        pattern=r"^(pending|accepted|rejected|in_progress|completed|cancelled)$",
    ),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_chc_staff),
):
    owner_user_id = current_user["user_id"]

    chc = await db.fetch_one("SELECT chc_id FROM chcs WHERE owner_user_id = $1", owner_user_id)
    if not chc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No CHC associated with this user.")
    chc_id = chc["chc_id"]

    base_query = (
        """
        SELECT
            booking_id, farmer_id, chc_id, machine_id, machine_type_requested,
            parcel_id, requested_time, scheduled_time, status, created_at,
            final_amount, notes
        FROM bookings
        WHERE chc_id = $1
        """
    )
    params = [chc_id]

    if status_filter:
        base_query += f" AND status = ${len(params) + 1}"
        params.append(status_filter)

    base_query += f" ORDER BY created_at DESC LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
    params.extend([limit, offset])

    try:
        bookings = await db.fetch_all(base_query, *params)
        return [BookingResponse(**b) for b in bookings]
    except Exception as e:
        print(f"❌ Error fetching CHC bookings: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve bookings.")


@router.patch("/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking_status(
    booking_id: UUID,
    update_data: BookingUpdate,
    current_user: dict = Depends(get_current_chc_staff),
):
    owner_user_id = current_user["user_id"]

    chc = await db.fetch_one("SELECT chc_id FROM chcs WHERE owner_user_id = $1", owner_user_id)
    if not chc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No CHC associated with this user.")
    chc_id = chc["chc_id"]

    booking = await db.fetch_one("SELECT * FROM bookings WHERE booking_id = $1", booking_id)
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    if booking["status"] != "pending" and booking.get("chc_id") != chc_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this booking.")

    update_fields = []
    params = []

    # Assign CHC on accept
    if booking["status"] == "pending" and update_data.status == "accepted":
        update_fields.append(f"chc_id = ${len(params) + 1}")
        params.append(chc_id)

    if update_data.status is not None:
        update_fields.append(f"status = ${len(params) + 1}")
        params.append(update_data.status)
    if update_data.scheduled_time is not None:
        update_fields.append(f"scheduled_time = ${len(params) + 1}")
        params.append(update_data.scheduled_time)
    if update_data.final_amount is not None:
        update_fields.append(f"final_amount = ${len(params) + 1}")
        params.append(update_data.final_amount)
    if update_data.notes is not None:
        update_fields.append(f"notes = ${len(params) + 1}")
        params.append(update_data.notes)

    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided.")

    update_fields.append("updated_at = NOW()")

    query = f"UPDATE bookings SET {', '.join(update_fields)} WHERE booking_id = ${len(params) + 1} RETURNING *"
    params.append(booking_id)

    try:
        updated = await db.fetch_one(query, *params)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking update failed.")

        farmer_user_id = str(updated["farmer_id"])  # UUID -> str
        notification_message = {
            "type": "booking_update",
            "booking_id": str(updated["booking_id"]),
            "status": updated["status"],
            "message": f"Your booking status has been updated to {updated['status']}",
        }
        await websocket_manager.send_to_user(farmer_user_id, notification_message)
        return BookingResponse(**updated)
    except Exception as e:
        print(f"❌ Error updating booking: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not update booking: {e}")
