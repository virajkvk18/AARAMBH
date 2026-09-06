import os
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from models.schemas import DocumentExtractionRequest, DocumentExtractionResponse, ExtractedField


class PipelineState(TypedDict):
    request: DocumentExtractionRequest
    raw_text: str
    extracted_fields: Dict[str, ExtractedField]
    validation_errors: List[str]
    is_valid: bool


def ocr_node(state: PipelineState) -> Dict[str, Any]:
    """Extracts raw text from PDF or Image using PyMuPDF / EasyOCR."""
    # Placeholder for OCR extraction integration
    req = state["request"]
    raw_text = f"Sample extracted text for {req.document_type}"
    return {"raw_text": raw_text}


def llm_extraction_node(state: PipelineState) -> Dict[str, Any]:
    """Uses Groq / LLM to structure extracted text into typed fields."""
    # Placeholder for Groq structured output call
    fields: Dict[str, ExtractedField] = {
        "document_number": ExtractedField(field_name="document_number", value="SAMPLE12345", confidence=0.95),
        "holder_name": ExtractedField(field_name="holder_name", value="ENTERPRISE CORP", confidence=0.92),
    }
    return {"extracted_fields": fields}


def validation_node(state: PipelineState) -> Dict[str, Any]:
    """Validates extracted data against expected formats."""
    fields = state.get("extracted_fields", {})
    errors = []
    if not fields:
        errors.append("No fields could be extracted")
    return {
        "validation_errors": errors,
        "is_valid": len(errors) == 0,
    }


def build_extraction_graph():
    workflow = StateGraph(PipelineState)
    workflow.add_node("ocr", ocr_node)
    workflow.add_node("llm_extraction", llm_extraction_node)
    workflow.add_node("validation", validation_node)

    workflow.set_entry_point("ocr")
    workflow.add_edge("ocr", "llm_extraction")
    workflow.add_edge("llm_extraction", "validation")
    workflow.add_edge("validation", END)

    return workflow.compile()


extraction_graph = build_extraction_graph()


async def extract_document_pipeline(request: DocumentExtractionRequest) -> DocumentExtractionResponse:
    initial_state: PipelineState = {
        "request": request,
        "raw_text": "",
        "extracted_fields": {},
        "validation_errors": [],
        "is_valid": False,
    }
    result = await extraction_graph.ainvoke(initial_state)
    return DocumentExtractionResponse(
        document_type=request.document_type,
        is_valid=result["is_valid"],
        fields=result["extracted_fields"],
        raw_text=result["raw_text"],
        validation_errors=result["validation_errors"],
    )
