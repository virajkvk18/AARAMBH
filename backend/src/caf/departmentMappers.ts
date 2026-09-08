/**
 * Department Mapping Engine
 * Transforms Master CAF payload + specific delta fields into department-ready API payloads.
 */

import {
  MasterCAFPayload,
  DepartmentDeltas,
  MPCBApiPayload,
  FireNocApiPayload,
  MIDCApiPayload,
  DISHApiPayload,
  DPIITApiPayload,
} from "./cafSchema";

export function mapToMPCB(
  caf: MasterCAFPayload,
  delta?: DepartmentDeltas["mpcb"]
): MPCBApiPayload {
  return {
    department: "MPCB",
    clearance_type: "Consent to Establish (CTE)",
    unit_name: caf.companyDetails.companyName,
    gst_number: caf.companyDetails.gstin,
    pan_number: caf.companyDetails.pan,
    investment_value_rs: caf.projectSpecs.capitalInvestmentInr,
    pollution_category: caf.projectSpecs.hazardCategory,
    water_consumption_kld: caf.projectSpecs.waterRequirementKlpd,
    location: {
      district: caf.locationDetails.district,
      zone: caf.locationDetails.midcZoneName || "MIDC Chakan Phase II, Pune",
      plot_no: caf.locationDetails.midcPlotNo || "Plot A-12/4",
    },
    attached_documents: {
      pan_document: caf.documentVault.panCardUrl || "/api/vault/doc/pan-default",
      land_ownership: caf.documentVault.landDeedUrl || "/api/vault/doc/lease-deed",
      site_blueprint: caf.documentVault.sitePlanUrl || "/api/vault/doc/blueprint",
    },
    // Delta fields unique to MPCB
    effluent_treatment_plant_proposed: delta?.etpProposed ?? true,
    hazardous_waste_generation_tpa: delta?.hazardousWasteTpa ?? 2.5,
    chimney_height_meters: delta?.chimneyHeightMeters ?? 30,
    air_pollution_control_system: delta?.airPollutionControlSystem ?? "Wet Scrubber + Bag Filter Array",
  };
}

export function mapToFireNoc(
  caf: MasterCAFPayload,
  delta?: DepartmentDeltas["fire"]
): FireNocApiPayload {
  return {
    department: "MAHAFIRE",
    clearance_type: "Provisional Fire NOC",
    applicant_entity: caf.companyDetails.companyName,
    site_address: `${caf.locationDetails.address || "Plot A-12/4, MIDC Industrial Area"}, ${caf.locationDetails.district || "Pune"} - ${caf.locationDetails.pincode || "410501"}`,
    plot_area_sqm: caf.locationDetails.plotAreaSqMeters || 5000,
    building_height_m: caf.projectSpecs.maxBuildingHeightMeters || 12.5,
    occupancy_load: caf.projectSpecs.totalOccupants || 120,
    blueprints_url: caf.documentVault.sitePlanUrl || "/api/vault/doc/blueprint",
    // Delta fields unique to Fire Services
    fire_extinguisher_type_installed: delta?.extinguisherType || "CO2 & ABC Multi-Purpose Powder (IS 15683)",
    has_underground_water_tank: delta?.hasUgTank ?? true,
    underground_tank_capacity_liters: delta?.undergroundTankCapacityLiters || 100000,
    sprinkler_system_fitted: delta?.sprinklerSystemFitted ?? true,
    emergency_exits_count: delta?.emergencyExitsCount || 4,
  };
}

export function mapToMIDC(
  caf: MasterCAFPayload,
  delta?: DepartmentDeltas["midc"]
): MIDCApiPayload {
  return {
    department: "MIDC",
    clearance_type: "Industrial Land Lease & Plan Sanction",
    enterprise_legal_name: caf.companyDetails.companyName,
    cin_number: caf.companyDetails.cin || "U24299MH2026PTC104921",
    gstin: caf.companyDetails.gstin,
    estate_zone: caf.locationDetails.midcZoneName || "MIDC Chakan Industrial Zone",
    plot_number: caf.locationDetails.midcPlotNo || "Plot A-12/4",
    plot_area_sqm: caf.locationDetails.plotAreaSqMeters || 5000,
    proposed_builtup_area_sqm: delta?.proposedBuiltupAreaSqm || (caf.locationDetails.plotAreaSqMeters ? caf.locationDetails.plotAreaSqMeters * 0.6 : 3000),
    power_demand_kw: caf.projectSpecs.powerRequirementKw || 250,
    water_demand_kld: caf.projectSpecs.waterRequirementKlpd || 15,
    industrial_parking_bays: delta?.industrialParkingBays || 18,
    effluent_discharge_point_required: delta?.effluentDischargePointRequired ?? true,
    substation_space_allotted: delta?.substationSpaceAllotted ?? true,
    allotment_letter_attachment: caf.documentVault.landDeedUrl || "/api/vault/doc/midc-allotment",
  };
}

export function mapToDISH(
  caf: MasterCAFPayload,
  delta?: DepartmentDeltas["dish"]
): DISHApiPayload {
  return {
    department: "DISH",
    clearance_type: "Factory Registration & Safety License",
    factory_name: `${caf.companyDetails.companyName} Unit-1`,
    registered_address: `${caf.locationDetails.address || "Plot A-12/4, MIDC Area"}, ${caf.locationDetails.district || "Pune"}`,
    power_load_kw: caf.projectSpecs.powerRequirementKw || 250,
    max_workers_employed: caf.projectSpecs.totalOccupants || 120,
    hazard_classification: caf.projectSpecs.hazardCategory === "Red" ? "Hazardous Process (Section 2cb)" : "General Industrial",
    boiler_installed: delta?.boilerInstalled ?? false,
    safety_officer_appointed: delta?.safetyOfficerAppointed ?? true,
    shift_pattern: delta?.shiftPattern || "3 Shifts (24x7)",
    first_aid_room_provided: delta?.firstAidRoomProvided ?? true,
  };
}

export function mapToDPIIT(
  caf: MasterCAFPayload,
  delta?: DepartmentDeltas["dpiit"]
): DPIITApiPayload {
  return {
    department: "DPIIT",
    clearance_type: "Industrial Entrepreneur Memorandum (IEM)",
    enterprise_name: caf.companyDetails.companyName,
    pan: caf.companyDetails.pan,
    cin: caf.companyDetails.cin || "U24299MH2026PTC104921",
    sector: caf.projectSpecs.sector || "Manufacturing / Chemicals",
    capital_investment_inr: caf.projectSpecs.capitalInvestmentInr || 350000000,
    foreign_collaboration_required: delta?.foreignCollaborationRequired ?? false,
    fdi_equity_percent: delta?.fdiEquityPercent ?? 0,
    export_oriented_unit: delta?.exportOrientedUnit ?? false,
  };
}
