import logging
from uuid import UUID
from decimal import Decimal
from datetime import datetime, timedelta

from core.database import db
from core.config import settings
from ai.satellite_service.verify import satellite_service

logger = logging.getLogger(__name__)


class GreenCreditService:
    """Service for managing Green Credit awards"""

    async def award_credit_for_booking(self, booking_id: UUID) -> bool:
        """
        Awards green credits if a completed booking meets criteria.
        Currently checks only booking status; extend with satellite/telemetry later.
        """
        try:
            # 1) Fetch booking details
            booking = await db.fetch_one(
                """
                SELECT booking_id, farmer_id, parcel_id, status, chc_id, machine_id, updated_at
                FROM bookings
                WHERE booking_id = $1
                """,
                booking_id,
            )

            if not booking:
                logger.warning(f"Credit Award: Booking {booking_id} not found.")
                return False

            if booking["status"] != "completed":
                logger.info(
                    f"Credit Award: Booking {booking_id} not completed (status: {booking['status']})."
                )
                return False

            # Satellite verification window based on completion time
            completion_dt = booking.get("updated_at")
            if completion_dt is None:
                logger.warning(f"Credit Award: Booking {booking_id} missing completion timestamp (updated_at).")
                return False
            check_start = completion_dt.date()
            check_end = check_start + timedelta(days=14)
            try:
                verified_no_burn = await satellite_service.check_parcel_for_burn(
                    parcel_id=booking["parcel_id"],
                    check_start_date=check_start,
                    check_end_date=check_end,
                )
            except Exception as sat_e:
                logger.error(
                    f"Satellite check failed for booking {booking_id} / parcel {booking['parcel_id']}: {sat_e}"
                )
                verified_no_burn = False

            if not verified_no_burn:
                logger.info(
                    f"Credit Award: Parcel {booking['parcel_id']} failed satellite verification for booking {booking_id}."
                )
                return False

            # 2) Idempotency: ensure not awarded already
            existing = await db.fetch_one(
                "SELECT credit_id FROM green_credits WHERE source_booking_id = $1",
                booking_id,
            )
            if existing:
                logger.info(f"Credit Award: Already awarded for booking {booking_id}.")
                return True

            # 3) Award credit
            amount = Decimal(str(settings.GREEN_CREDIT_RATE))
            farmer_id = booking["farmer_id"]
            notes = f"Credit for completed booking {booking_id} (Satellite Verified: {check_start} to {check_end})"

            await db.execute(
                """
                INSERT INTO green_credits (farmer_id, source_booking_id, amount, status, notes)
                VALUES ($1, $2, $3, 'available', $4)
                """,
                farmer_id,
                booking_id,
                amount,
                notes,
            )

            logger.info(
                f"✅ Awarded {amount} green credits to farmer {farmer_id} for booking {booking_id}."
            )
            return True
        except Exception as e:
            logger.error(f"❌ Error awarding credit for booking {booking_id}: {e}")
            return False

    async def check_satellite_verification(self, parcel_id: UUID, completed_date: datetime) -> bool:
        logger.warning("Satellite verification check not implemented yet.")
        return True

    async def check_machine_presence(
        self, machine_id: UUID, parcel_id: UUID, start_time: datetime, end_time: datetime
    ) -> bool:
        logger.warning("Machine presence verification check not implemented yet.")
        return True


# Global instance
credit_service = GreenCreditService()
