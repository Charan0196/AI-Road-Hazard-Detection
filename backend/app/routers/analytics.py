from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models import Detection, HazardReport
from app.schemas import AnalyticsSummaryOut, HeatPoint, LabelCount

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryOut)
async def summary(session: AsyncSession = Depends(get_session)):
    total_reports = (await session.execute(select(func.count()).select_from(HazardReport))).scalar_one()
    total_detections = (await session.execute(select(func.count()).select_from(Detection))).scalar_one()

    rows = (
        await session.execute(
            select(Detection.label, func.count(Detection.id))
            .group_by(Detection.label)
            .order_by(func.count(Detection.id).desc())
        )
    ).all()

    by_label = [LabelCount(label=label, count=int(count)) for label, count in rows]
    return AnalyticsSummaryOut(
        total_reports=int(total_reports),
        total_detections=int(total_detections),
        by_label=by_label,
    )


@router.get("/heatmap", response_model=list[HeatPoint])
async def heatmap(session: AsyncSession = Depends(get_session)):
    rows = (
        await session.execute(
            select(HazardReport.latitude, HazardReport.longitude, func.count(Detection.id))
            .join(Detection, Detection.report_id == HazardReport.id, isouter=True)
            .where(HazardReport.latitude.is_not(None), HazardReport.longitude.is_not(None))
            .group_by(HazardReport.id)
        )
    ).all()

    buckets: dict[tuple[float, float], float] = defaultdict(float)
    for lat, lng, det_count in rows:
        key = (round(float(lat), 4), round(float(lng), 4))
        buckets[key] += float(det_count or 0) + 1.0

    return [HeatPoint(latitude=lat, longitude=lng, weight=weight) for (lat, lng), weight in buckets.items()]

