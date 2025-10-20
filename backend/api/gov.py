from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal

from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel

from core.database import db
from core.security import get_current_gov_admin
from db.schemas import GovDashboardResponse, BookingResponse, MachineResponse
from services.iot_service import iot_service

router = APIRouter(
    prefix="/gov",
    tags=["Government Dashboard"],
    dependencies=[Depends(get_current_gov_admin)],
)


@router.get("/dashboard/kpis", response_model=GovDashboardResponse)
async def get_government_kpis():
    try:
        total_machines_res = await db.fetch_one("SELECT COUNT(*) as count FROM machines")
        online_machines_res = await db.fetch_one(
            """
            SELECT COUNT(*) as count
            FROM machines
            WHERE status != 'offline' AND last_seen > NOW() - INTERVAL '1 hour'
            """
        )
        total_farmers_res = await db.fetch_one("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'")
        total_bookings_res = await db.fetch_one("SELECT COUNT(*) as count FROM bookings")
        completed_bookings_res = await db.fetch_one("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'")
        total_credits_res = await db.fetch_one(
            """
            SELECT COALESCE(SUM(amount), 0) as total
            FROM green_credits
            WHERE status IN ('available','redeemed')
            """
        )

        running_machines_res = await db.fetch_one("SELECT COUNT(*) as count FROM machines WHERE status = 'running'")
        online_count = online_machines_res["count"] if online_machines_res else 0
        running_count = running_machines_res["count"] if running_machines_res else 0
        avg_utilization = (running_count / online_count * 100) if online_count > 0 else 0.0

        return GovDashboardResponse(
            total_machines=total_machines_res["count"] if total_machines_res else 0,
            total_machines_online=online_machines_res["count"] if online_machines_res else 0,
            total_farmers=total_farmers_res["count"] if total_farmers_res else 0,
            total_bookings=total_bookings_res["count"] if total_bookings_res else 0,
            completed_bookings=completed_bookings_res["count"] if completed_bookings_res else 0,
            total_green_credits_awarded=Decimal(str(total_credits_res["total"])) if total_credits_res else Decimal("0.0"),
            avg_system_utilization=round(avg_utilization, 2),
        )
    except Exception as e:
        print(f"❌ Error fetching government KPIs: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve dashboard KPIs.")


class UtilizationReportItem(BaseModel):
    time_bucket: datetime
    chc_id: Optional[UUID] = None
    machine_id: Optional[UUID] = None
    runtime_hours: float
    utilization_percent: float


@router.get("/reports/utilization", response_model=List[UtilizationReportItem])
async def get_utilization_report(
    chc_id_filter: Optional[UUID] = Query(None, alias="chcId"),
    hours: int = Query(24, ge=1, le=7 * 24),
):
    if chc_id_filter:
        stats = await iot_service.get_utilization_stats(chc_id=chc_id_filter, hours=hours)
        return [
            UtilizationReportItem(
                time_bucket=datetime.utcnow(),
                chc_id=chc_id_filter,
                runtime_hours=stats.get("total_runtime_hours", 0.0),
                utilization_percent=stats.get("utilization_percentage", 0.0),
            )
        ]
    else:
        print("⚠️ System-wide utilization report not yet implemented.")
        return []


class ComplianceReportItem(BaseModel):
    booking_id: UUID
    parcel_id: UUID
    farmer_id: UUID
    machine_type: str
    booking_completed_at: Optional[datetime]
    satellite_image_date: Optional[date] = None
    burn_flag: Optional[bool] = None
    machine_activity_verified: Optional[bool] = None


@router.get("/reports/compliance", response_model=List[ComplianceReportItem])
async def get_compliance_report(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    try:
        rows = await db.fetch_all(
            """
            SELECT b.booking_id, b.parcel_id, b.farmer_id, b.machine_type_requested, b.updated_at as completed_at,
                   s.image_date, s.burn_flag
            FROM bookings b
            LEFT JOIN satellite_events s ON b.parcel_id = s.parcel_id
                 AND s.image_date >= date(b.updated_at)
                 AND s.image_date <= date(b.updated_at) + interval '14 days'
            WHERE b.status = 'completed'
            ORDER BY b.updated_at DESC
            LIMIT $1 OFFSET $2
            """,
            limit,
            offset,
        )
        return [
            ComplianceReportItem(
                booking_id=r["booking_id"],
                parcel_id=r["parcel_id"],
                farmer_id=r["farmer_id"],
                machine_type=r["machine_type_requested"],
                booking_completed_at=r["completed_at"],
                satellite_image_date=r.get("image_date"),
                burn_flag=r.get("burn_flag"),
                machine_activity_verified=None,
            )
            for r in rows
        ]
    except Exception as e:
        print(f"❌ Error fetching compliance report: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not retrieve compliance report.")
