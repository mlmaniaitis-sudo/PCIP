from typing import List, Optional
from uuid import UUID
import json
import asyncpg

from fastapi import APIRouter, HTTPException, status, Depends, Body, Query, Path

from core.config import settings
from core.database import db
from core.security import get_current_farmer
from db.schemas import (
    MachineResponse,
    LocationPoint,
    BookingCreate,
    BookingResponse,
    FarmerProfileCreate,
    FarmerProfileResponse,
    ParcelCreate,
    ParcelResponse,
)


def point_to_geography_text(point: LocationPoint) -> str:
    return f"POINT({point.longitude} {point.latitude})"


router = APIRouter(prefix="/farmer", tags=["Farmer Operations"])


@router.get("/machines/available", response_model=List[MachineResponse])
async def find_available_machines(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    machine_type: str = Query(...),
    radius_km: int = Query(settings.MAX_BOOKING_RADIUS_KM, gt=0, le=200),
    current_user: dict = Depends(get_current_farmer),
):
    farmer_location_text = f"POINT({longitude} {latitude})"
    radius_meters = radius_km * 1000

    try:
        rows = await db.fetch_all(
            """
            SELECT
                m.machine_id, m.chc_id, m.device_id, m.name, m.type, m.status, m.last_seen,
                ST_X(m.last_location::geometry) as longitude,
                ST_Y(m.last_location::geometry) as latitude,
                m.created_at,
                ST_Distance(m.last_location, ST_GeogFromText($1)) / 1000.0 as distance_km
            FROM machines m
            JOIN chcs c ON m.chc_id = c.chc_id
            WHERE m.type = $2
              AND m.status = 'idle'
              AND m.last_location IS NOT NULL
              AND ST_DWithin(m.last_location, ST_GeogFromText($1), $3)
            ORDER BY distance_km ASC
            LIMIT 50
            """,
            farmer_location_text,
            machine_type,
            radius_meters,
        )

        results: List[MachineResponse] = []
        for r in rows:
            loc: Optional[LocationPoint] = None
            if r.get("latitude") is not None and r.get("longitude") is not None:
                loc = LocationPoint(latitude=r["latitude"], longitude=r["longitude"])
            results.append(
                MachineResponse(
                    machine_id=r["machine_id"],
                    chc_id=r["chc_id"],
                    device_id=r.get("device_id"),
                    name=r.get("name"),
                    type=r["type"],
                    status=r["status"],
                    last_seen=r.get("last_seen"),
                    last_location=loc,
                    created_at=r["created_at"],
                )
            )
        return results
    except Exception as e:
        print(f"❌ Error finding available machines: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve available machines.")


@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking_request(
    booking_data: BookingCreate = Body(...),
    current_user: dict = Depends(get_current_farmer),
):
    farmer_id = current_user["user_id"]
    parcel_id = booking_data.parcel_id

    # Validate parcel ownership
    parcel = await db.fetch_one("SELECT farmer_id FROM parcels WHERE parcel_id = $1", parcel_id)
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found.")
    if parcel["farmer_id"] != farmer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this parcel.")

    try:
        new_booking = await db.fetch_one(
            """
            INSERT INTO bookings (farmer_id, parcel_id, machine_type_requested, requested_time, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING booking_id, farmer_id, chc_id, machine_id, machine_type_requested, parcel_id,
                      requested_time, scheduled_time, status, created_at, final_amount, notes
            """,
            farmer_id,
            parcel_id,
            booking_data.machine_type_requested,
            booking_data.requested_time,
        )
        if not new_booking:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create booking request.")

        # --- Notify relevant CHCs via WebSocket ---
        try:
            parcel_geom = await db.fetch_one(
                "SELECT ST_AsText(ST_Centroid(geom)) as centroid FROM parcels WHERE parcel_id = $1",
                parcel_id,
            )
            if parcel_geom and parcel_geom.get("centroid"):
                parcel_location_text = parcel_geom["centroid"]
                nearby_chcs = await db.fetch_all(
                    """
                    SELECT DISTINCT c.chc_id
                    FROM chcs c
                    JOIN machines m ON c.chc_id = m.chc_id
                    WHERE m.type = $1
                      AND ST_DWithin(c.location, ST_GeogFromText($2), $3)
                    LIMIT 10
                    """,
                    booking_data.machine_type_requested,
                    parcel_location_text,
                    settings.MAX_BOOKING_RADIUS_KM * 1000,
                )
                notification_message = {
                    "type": "new_booking_request",
                    "booking_id": str(new_booking["booking_id"]),
                    "machine_type": new_booking["machine_type_requested"],
                    "message": f"New '{new_booking['machine_type_requested']}' request near you.",
                }
                for chc_row in nearby_chcs:
                    await websocket_manager.send_to_chc(str(chc_row["chc_id"]), notification_message)
        except Exception as notify_err:
            print(f"⚠️ Error sending new booking notification: {notify_err}")
        # --- End Notification ---

        return BookingResponse(**new_booking)
    except Exception as e:
        print(f"❌ Error creating booking request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not create booking request: {e}")


@router.get("/bookings/my", response_model=List[BookingResponse])
async def list_my_bookings(
    current_user: dict = Depends(get_current_farmer),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    farmer_id = current_user["user_id"]

    bookings = await db.fetch_all(
        """
        SELECT
            booking_id, farmer_id, chc_id, machine_id, machine_type_requested,
            parcel_id, requested_time, scheduled_time, status, created_at,
            final_amount, notes
        FROM bookings
        WHERE farmer_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        farmer_id,
        limit,
        offset,
    )

    return [BookingResponse(**b) for b in bookings]


@router.get("/profile/me", response_model=FarmerProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_farmer)):
    farmer_id = current_user["user_id"]
    profile = await db.fetch_one(
        """
        SELECT farmer_id, pm_kisan_id, village, district, state, created_at
        FROM farmer_profiles WHERE farmer_id = $1
        """,
        farmer_id,
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found.")

    return FarmerProfileResponse(
        farmer_id=profile["farmer_id"],
        pm_kisan_id=profile.get("pm_kisan_id"),
        village=profile.get("village"),
        district=profile.get("district"),
        state=profile.get("state"),
        created_at=profile["created_at"],
    )


@router.patch("/profile/me", response_model=FarmerProfileResponse)
async def update_my_profile(
    profile_data: FarmerProfileCreate = Body(...),
    current_user: dict = Depends(get_current_farmer),
):
    farmer_id = current_user["user_id"]
    update_fields = []
    params = []

    if profile_data.pm_kisan_id is not None:
        update_fields.append(f"pm_kisan_id = ${len(params) + 1}")
        params.append(profile_data.pm_kisan_id)
    if profile_data.village is not None:
        update_fields.append(f"village = ${len(params) + 1}")
        params.append(profile_data.village)
    if profile_data.district is not None:
        update_fields.append(f"district = ${len(params) + 1}")
        params.append(profile_data.district)
    if profile_data.state is not None:
        update_fields.append(f"state = ${len(params) + 1}")
        params.append(profile_data.state)

    if not update_fields:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No profile data provided for update.")

    update_fields.append("updated_at = NOW()")

    query = f"""
        UPDATE farmer_profiles
        SET {', '.join(update_fields)}
        WHERE farmer_id = ${len(params) + 1}
        RETURNING farmer_id, pm_kisan_id, village, district, state, created_at
    """
    params.append(farmer_id)

    try:
        updated_profile = await db.fetch_one(query, *params)
        if not updated_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer profile not found for update.")

        return FarmerProfileResponse(
            farmer_id=updated_profile["farmer_id"],
            pm_kisan_id=updated_profile.get("pm_kisan_id"),
            village=updated_profile.get("village"),
            district=updated_profile.get("district"),
            state=updated_profile.get("state"),
            created_at=updated_profile["created_at"],
        )
    except Exception as e:
        print(f"❌ Error updating farmer profile: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not update profile: {e}")


@router.post("/parcels", response_model=ParcelResponse, status_code=status.HTTP_201_CREATED)
async def add_parcel(
    parcel_data: ParcelCreate = Body(...),
    current_user: dict = Depends(get_current_farmer),
):
    farmer_id = current_user["user_id"]

    if not isinstance(parcel_data.geometry, dict) or parcel_data.geometry.get("type") != "Polygon" or not parcel_data.geometry.get("coordinates"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GeoJSON Polygon geometry provided.")

    geometry_json_str = json.dumps(parcel_data.geometry)

    try:
        new_parcel = await db.fetch_one(
            """
            INSERT INTO parcels (farmer_id, geom, crop, expected_harvest_date, area_hectares)
            VALUES (
                $1,
                ST_SetSRID(ST_GeomFromGeoJSON($2), 4326),
                $3, $4, $5
            )
            RETURNING parcel_id, farmer_id, ST_AsGeoJSON(geom) as geometry_str,
                      crop, expected_harvest_date, area_hectares, created_at
            """,
            farmer_id,
            geometry_json_str,
            parcel_data.crop,
            parcel_data.expected_harvest_date,
            parcel_data.area_hectares,
        )
        if not new_parcel:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add parcel.")

        geometry_dict = json.loads(new_parcel["geometry_str"]) if new_parcel.get("geometry_str") else None

        return ParcelResponse(
            parcel_id=new_parcel["parcel_id"],
            farmer_id=new_parcel["farmer_id"],
            geometry=geometry_dict,
            crop=new_parcel.get("crop"),
            expected_harvest_date=new_parcel.get("expected_harvest_date"),
            area_hectares=new_parcel.get("area_hectares"),
            created_at=new_parcel["created_at"],
        )
    except asyncpg.PostgresError as e:
        print(f"❌ PostGIS/Postgres Error adding parcel: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid parcel geometry or data.")
    except Exception as e:
        print(f"❌ Error adding parcel: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Could not add parcel: {e}")


@router.get("/parcels/my", response_model=List[ParcelResponse])
async def list_my_parcels(
    current_user: dict = Depends(get_current_farmer),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    farmer_id = current_user["user_id"]

    parcels = await db.fetch_all(
        """
        SELECT
            parcel_id, farmer_id, ST_AsGeoJSON(geom) as geometry_str,
            crop, expected_harvest_date, area_hectares, created_at
        FROM parcels
        WHERE farmer_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        farmer_id,
        limit,
        offset,
    )

    response_list: List[ParcelResponse] = []
    for p in parcels:
        try:
            geometry_dict = json.loads(p["geometry_str"]) if p.get("geometry_str") else None
            response_list.append(
                ParcelResponse(
                    parcel_id=p["parcel_id"],
                    farmer_id=p["farmer_id"],
                    geometry=geometry_dict,
                    crop=p.get("crop"),
                    expected_harvest_date=p.get("expected_harvest_date"),
                    area_hectares=p.get("area_hectares"),
                    created_at=p["created_at"],
                )
            )
        except Exception as e:
            print(f"⚠️ Error processing parcel {p['parcel_id']} geometry: {e}")
            # Skip or include partial; here we skip malformed geometry
    return response_list
