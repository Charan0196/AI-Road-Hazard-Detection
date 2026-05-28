import datetime as dt

from pydantic import BaseModel, Field
from pydantic import ConfigDict


class DetectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float


class MediaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    content_type: str
    url: str


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    latitude: float | None
    longitude: float | None
    created_at: dt.datetime
    media: MediaOut
    detections: list[DetectionOut] = Field(default_factory=list)


class LabelCount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    label: str
    count: int


class AnalyticsSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_reports: int
    total_detections: int
    by_label: list[LabelCount]


class HeatPoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    latitude: float
    longitude: float
    weight: float
