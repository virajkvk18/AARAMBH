/**
 * AARAMBH Master Common Application Form (CAF) Schema & Department Payload Definitions
 * Normalized multi-department data model for Maharashtra Single Window System.
 */

export interface MasterCAFPayload {
  companyDetails: {
    companyName: string;
    pan: string;
    gstin: string;
    cin: string;
    entityType: "Pvt Ltd" | "Public Ltd" | "LLP" | "Proprietorship" | "Partnership";
    signatoryName: string;
    signatoryEmail: string;
    signatoryMobile: string;
  };
  locationDetails: {
    state: string;
    district: string;
    taluka?: string;
    address: string;
    pincode: string;
    plotAreaSqMeters: number;
    midcZoneName: string;
    midcPlotNo: string;
  };
  projectSpecs: {
    industryType: string;
    sector: string;
    capitalInvestmentInr: number;
    powerRequirementKw: number;
    waterRequirementKlpd: number;
    hazardCategory: "Red" | "Orange" | "Green" | "White";
    maxBuildingHeightMeters: number;
    totalOccupants: number;
    expectedCommissioningDate?: string;
  };
  documentVault: {
    panCardUrl: string;
    gstCertUrl: string;
    landDeedUrl: string;
    sitePlanUrl: string;
    udyamCertUrl?: string;
  };
}

// ----------------------------------------------------
// Department-Specific Delta Input Types
// ----------------------------------------------------

export interface MPCBDeltaInput {
  etpProposed: boolean;
  hazardousWasteTpa: number;
  chimneyHeightMeters: number;
  airPollutionControlSystem: string;
}

export interface FireNocDeltaInput {
  extinguisherType: string;
  hasUgTank: boolean;
  undergroundTankCapacityLiters: number;
  sprinklerSystemFitted: boolean;
  emergencyExitsCount: number;
}

export interface MIDCDeltaInput {
  proposedBuiltupAreaSqm: number;
  industrialParkingBays: number;
  effluentDischargePointRequired: boolean;
  substationSpaceAllotted: boolean;
}

export interface DISHDeltaInput {
  boilerInstalled: boolean;
  safetyOfficerAppointed: boolean;
  shiftPattern: "1 Shift" | "2 Shifts" | "3 Shifts (24x7)";
  firstAidRoomProvided: boolean;
}

export interface DPIITDeltaInput {
  foreignCollaborationRequired: boolean;
  fdiEquityPercent: number;
  exportOrientedUnit: boolean;
}

export interface DepartmentDeltas {
  mpcb?: MPCBDeltaInput;
  fire?: FireNocDeltaInput;
  midc?: MIDCDeltaInput;
  dish?: DISHDeltaInput;
  dpiit?: DPIITDeltaInput;
}

// ----------------------------------------------------
// Transformed External Ministry Payloads
// ----------------------------------------------------

export interface MPCBApiPayload {
  department: "MPCB";
  clearance_type: "Consent to Establish (CTE)";
  unit_name: string;
  gst_number: string;
  pan_number: string;
  investment_value_rs: number;
  pollution_category: string;
  water_consumption_kld: number;
  location: {
    district: string;
    zone: string;
    plot_no: string;
  };
  attached_documents: {
    pan_document: string;
    land_ownership: string;
    site_blueprint: string;
  };
  effluent_treatment_plant_proposed: boolean;
  hazardous_waste_generation_tpa: number;
  chimney_height_meters: number;
  air_pollution_control_system: string;
}

export interface FireNocApiPayload {
  department: "MAHAFIRE";
  clearance_type: "Provisional Fire NOC";
  applicant_entity: string;
  site_address: string;
  plot_area_sqm: number;
  building_height_m: number;
  occupancy_load: number;
  blueprints_url: string;
  fire_extinguisher_type_installed: string;
  has_underground_water_tank: boolean;
  underground_tank_capacity_liters: number;
  sprinkler_system_fitted: boolean;
  emergency_exits_count: number;
}

export interface MIDCApiPayload {
  department: "MIDC";
  clearance_type: "Industrial Land Lease & Plan Sanction";
  enterprise_legal_name: string;
  cin_number: string;
  gstin: string;
  estate_zone: string;
  plot_number: string;
  plot_area_sqm: number;
  proposed_builtup_area_sqm: number;
  power_demand_kw: number;
  water_demand_kld: number;
  industrial_parking_bays: number;
  effluent_discharge_point_required: boolean;
  substation_space_allotted: boolean;
  allotment_letter_attachment: string;
}

export interface DISHApiPayload {
  department: "DISH";
  clearance_type: "Factory Registration & Safety License";
  factory_name: string;
  registered_address: string;
  power_load_kw: number;
  max_workers_employed: number;
  hazard_classification: string;
  boiler_installed: boolean;
  safety_officer_appointed: boolean;
  shift_pattern: string;
  first_aid_room_provided: boolean;
}

export interface DPIITApiPayload {
  department: "DPIIT";
  clearance_type: "Industrial Entrepreneur Memorandum (IEM)";
  enterprise_name: string;
  pan: string;
  cin: string;
  sector: string;
  capital_investment_inr: number;
  foreign_collaboration_required: boolean;
  fdi_equity_percent: number;
  export_oriented_unit: boolean;
}

export interface DepartmentSubmissionResult {
  departmentId: string;
  departmentName: string;
  clearanceName: string;
  portalEndpoint: string;
  integrationMode: "REST_API" | "WEBHOOK_EVENT" | "SSO_PREFILL_PAYLOAD";
  trackingId: string;
  status: "SUBMITTED" | "AUTO_ACKNOWLEDGED" | "UNDER_SCRUTINY";
  slaDays: number;
  statutoryDueDate: string;
  digitalEndorsementToken: string;
  autoFilledPercentage: number;
}

export interface CAFSubmissionResponse {
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "ERROR";
  masterApplicationRef: string;
  timestamp: string;
  enterpriseName: string;
  totalDepartmentsSubmitted: number;
  departments: DepartmentSubmissionResult[];
  summaryReceiptPdfUrl?: string;
}
