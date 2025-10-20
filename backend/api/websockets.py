from uuid import UUID
import logging
from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    HTTPException,
    status,
    Query,
)

from websocket.manager import websocket_manager
from core.security import decode_access_token
from core.database import db

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/chc/{chc_id}")
async def websocket_chc_endpoint(
    websocket: WebSocket,
    chc_id: UUID,
    token: str = Query(...),
):
    # Authenticate via JWT in query param
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return

    user_id_from_token = payload.get("sub")
    if not user_id_from_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token missing user ID")
        return

    # Verify user is CHC staff and CHC exists
    user = await db.fetch_one(
        "SELECT user_id, role FROM users WHERE user_id = $1::uuid",
        user_id_from_token,
    )
    if not user or user.get("role") != "chc_staff":
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found or not CHC staff")
        return

    chc = await db.fetch_one("SELECT owner_user_id FROM chcs WHERE chc_id = $1", chc_id)
    if not chc:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="CHC not found")
        return

    # NOTE: Consider enforcing ownership check here in future
    logger.info(f"CHC Staff {user['user_id']} WS connect for CHC {chc_id}")

    chc_id_str = str(chc_id)
    await websocket_manager.connect_chc(websocket, chc_id_str)

    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received from CHC {chc_id_str}: {data}")
    except WebSocketDisconnect:
        logger.info(f"CHC {chc_id_str} WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"Error in CHC WebSocket {chc_id_str}: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
    finally:
        await websocket_manager.disconnect_chc(websocket, chc_id_str)


@router.websocket("/ws/user")
async def websocket_user_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
        return

    user_id_from_token = payload.get("sub")
    if not user_id_from_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token missing user ID")
        return

    user = await db.fetch_one(
        "SELECT user_id FROM users WHERE user_id = $1::uuid",
        user_id_from_token,
    )
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
        return

    user_id_str = str(user_id_from_token)
    await websocket_manager.connect_user(websocket, user_id_str)

    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"Received from user {user_id_str}: {data}")
    except WebSocketDisconnect:
        logger.info(f"User {user_id_str} WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"Error in user WebSocket {user_id_str}: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
    finally:
        await websocket_manager.disconnect_user(websocket, user_id_str)
