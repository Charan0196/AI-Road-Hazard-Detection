from __future__ import annotations

from dataclasses import dataclass

import cv2

from app.core.config import settings


@dataclass(frozen=True)
class DetectedBox:
    label: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float


_model = None


def _get_model():
    global _model
    if _model is not None:
        return _model
    from ultralytics import YOLO

    _model = YOLO(settings.yolo_weights)
    return _model


def detect_image_file(image_path: str) -> list[DetectedBox]:
    model = _get_model()
    results = model(image_path, verbose=False)
    if not results:
        return []
    r0 = results[0]
    names = r0.names or {}
    boxes = []
    if r0.boxes is None:
        return boxes
    for b in r0.boxes:
        cls_idx = int(b.cls.item())
        label = str(names.get(cls_idx, cls_idx))
        conf = float(b.conf.item())
        xyxy = b.xyxy[0].tolist()
        boxes.append(
            DetectedBox(
                label=label,
                confidence=conf,
                x1=float(xyxy[0]),
                y1=float(xyxy[1]),
                x2=float(xyxy[2]),
                y2=float(xyxy[3]),
            )
        )
    return boxes


def detect_video_file(video_path: str) -> list[DetectedBox]:
    cap = cv2.VideoCapture(video_path)
    try:
        if not cap.isOpened():
            return []
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        target = max(frame_count // 2, 0)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target)
        ok, frame = cap.read()
        if not ok or frame is None:
            return []
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        model = _get_model()
        results = model(rgb, verbose=False)
        if not results:
            return []
        r0 = results[0]
        names = r0.names or {}
        boxes = []
        if r0.boxes is None:
            return boxes
        for b in r0.boxes:
            cls_idx = int(b.cls.item())
            label = str(names.get(cls_idx, cls_idx))
            conf = float(b.conf.item())
            xyxy = b.xyxy[0].tolist()
            boxes.append(
                DetectedBox(
                    label=label,
                    confidence=conf,
                    x1=float(xyxy[0]),
                    y1=float(xyxy[1]),
                    x2=float(xyxy[2]),
                    y2=float(xyxy[3]),
                )
            )
        return boxes
    finally:
        cap.release()
