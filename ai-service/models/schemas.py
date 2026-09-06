from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExtractedField(BaseModel):
    field_name: str
    value: Optional[str] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    bounding_box: Optional[List[float]] = None


class DocumentExtractionRequest(BaseModel):
    document_type: str = Field(description="Type of document (e.g., PAN, GSTIN, UDYAM, LAND_DEED, NOC)")
    file_path: Optional[str] = None
    file_base64: Optional[str] = None
    expected_fields: Optional[List[str]] = None


class DocumentExtractionResponse(BaseModel):
    document_type: str
    is_valid: bool
    fields: Dict[str, ExtractedField]
    raw_text: Optional[str] = None
    validation_errors: List[str] = Field(default_factory=list)


class KYAAssessmentRequest(BaseModel):
    sector: str
    enterprise_type: str
    investment_inr: float
    land_area_sqm: float
    power_requirement_kw: float
    water_requirement_kld: float
    hazardous_materials: bool = False
    building_height_m: float = 0.0


class RequiredApproval(BaseModel):
    department: str
    clearance_name: str
    sla_days: int
    mandatory: bool
    description: str


class KYAAssessmentResponse(BaseModel):
    category: str  # White, Green, Orange, Red
    required_approvals: List[RequiredApproval]
    estimated_timeline_days: int
    applicable_incentives: List[str]
