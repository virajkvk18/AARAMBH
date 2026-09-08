import React from "react";

export interface ApprovalMetadata {
  id: string; // e.g., 'midc-land-allotment'
  slug: string;
  title: string;
  department: string;
  departmentCode: "MIDC" | "MPCB" | "MFIS" | "DISH";
  category: "Pre-Establishment" | "Pre-Operation";
  slaDays: number;
  feeRange: string;
  act: string;
  description: string;
  validityYears?: string;
  officialWebsite: string;
  helpline: string;
  iconName: "Building2" | "Factory" | "Flame" | "ShieldCheck";
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "radio" | "email" | "tel";
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  helperText?: string;
  defaultValue?: string | number | boolean;
  unit?: string;
  colSpan?: 1 | 2; // grid column span
}

export interface DocumentRequirementConfig {
  id: string;
  title: string;
  description: string;
  mandatory: boolean;
  maxSizeMb: number;
  allowedFormats: string[]; // e.g. ['.pdf', '.jpg', '.png']
  sampleTemplateName?: string;
}

export interface ComplianceDeclarationConfig {
  id: string;
  title: string;
  description: string;
  statutoryAct: string;
  mandatory: boolean;
}

export interface ApprovalConfig {
  meta: ApprovalMetadata;
  aliases: string[];
  projectFields: FormFieldConfig[];
  complianceDeclarations: ComplianceDeclarationConfig[];
  documents: DocumentRequirementConfig[];
  feeCalculator?: (values: Record<string, any>) => { baseFee: number; cess: number; total: number; explanation: string };
}

// ============================================================================
// 1. MIDC LAND ALLOTMENT & BUILDING PLAN APPROVAL
// ============================================================================
export const midcLandConfig: ApprovalConfig = {
  meta: {
    id: "midc-land-allotment",
    slug: "midc-land-allotment",
    title: "MIDC Land Allotment & Building Plan Approval",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    departmentCode: "MIDC",
    category: "Pre-Establishment",
    slaDays: 15,
    feeRange: "₹15,000 - ₹50,000 (Based on Plot Area & Premium Rate)",
    act: "Maharashtra Industrial Development Act, 1961 & RTS Act 2015",
    description:
      "Statutory industrial plot allotment, provisional possession letter issuance, and architectural building blueprint sanction across MIDC industrial estates.",
    validityYears: "95-Year Leasehold",
    officialWebsite: "https://midcindia.org",
    helpline: "1800-22-MIDC (6432)",
    iconName: "Building2",
  },
  aliases: ["midc-land", "midc-land-allotment", "midc"],
  projectFields: [
    {
      id: "industrialZone",
      label: "Target MIDC Industrial Area / Zone",
      type: "select",
      required: true,
      options: [
        { label: "Chakan Industrial Area (Pune)", value: "chakan_pune" },
        { label: "Ranjangaon MIDC (Pune)", value: "ranjangaon_pune" },
        { label: "TTC Navi Mumbai / Turbhe (Thane)", value: "ttc_navi_mumbai" },
        { label: "Taloja Industrial Area (Raigad)", value: "taloja_raigad" },
        { label: "Butibori Industrial Area (Nagpur)", value: "butibori_nagpur" },
        { label: "Waluj Industrial Area (Chhatrapati Sambhaji Nagar)", value: "waluj_csn" },
        { label: "Shendra MIDC / AURIC Smart City", value: "shendra_auric" },
        { label: "Kagal Hatkanangale Industrial Area (Kolhapur)", value: "kagal_kolhapur" },
        { label: "Sinnar Industrial Estate (Nashik)", value: "sinnar_nashik" },
        { label: "Roha Industrial Estate (Raigad)", value: "roha_raigad" },
        { label: "Supa Parner Industrial Park (Ahmednagar)", value: "supa_parner" },
      ],
      helperText: "Select the specific government industrial estate where plot is required.",
    },
    {
      id: "lineOfActivity",
      label: "Proposed Sector / Line of Activity",
      type: "select",
      required: true,
      options: [
        { label: "Automotive & Auto-Components", value: "automotive" },
        { label: "Precision Engineering & Heavy Fabrication", value: "engineering" },
        { label: "Chemicals & Petrochemicals", value: "chemicals" },
        { label: "Pharmaceuticals & Active Ingredients", value: "pharma" },
        { label: "Electronics & Semiconductor Assembly", value: "electronics" },
        { label: "Food Processing, Agro-tech & Cold Chain", value: "food_processing" },
        { label: "Textile & Technical Apparels", value: "textile" },
        { label: "Logistics, Warehousing & Distribution Hub", value: "logistics" },
        { label: "IT / Data Center Infrastructure", value: "it_datacenter" },
      ],
      helperText: "Determines industrial zoning classification and utility allocation.",
    },
    {
      id: "plotAreaRequired",
      label: "Plot Area Required",
      type: "number",
      required: true,
      placeholder: "e.g. 5000",
      unit: "sq. metres",
      helperText: "Standard industrial plots range from 1,000 to 50,000 sq. metres.",
    },
    {
      id: "proposedBuiltUpArea",
      label: "Proposed Ground Coverage / Built-up Plinth",
      type: "number",
      required: true,
      placeholder: "e.g. 3200",
      unit: "sq. metres",
      helperText: "Max ground coverage per MIDC DCR rules is typically 50-60% of plot area.",
    },
    {
      id: "requestedFar",
      label: "Requested Floor Area Ratio (FAR / FSI)",
      type: "select",
      required: true,
      options: [
        { label: "1.00 Standard FSI (Permitted Base)", value: "1.00" },
        { label: "1.25 Premium FSI (With Premium Fee)", value: "1.25" },
        { label: "1.50 Enhanced FSI (Eligible for Biotech/Electronics)", value: "1.50" },
        { label: "2.00 IT / Data Center Special FSI", value: "2.00" },
      ],
      helperText: "Governed by MIDC Development Control Regulations (DCR 2023).",
    },
    {
      id: "powerLoadRequired",
      label: "Connected Electrical Load Requirement",
      type: "number",
      required: true,
      placeholder: "e.g. 350",
      unit: "kVA",
      helperText: "Sub-station feeder provisioning by MSEDCL/MSETCL.",
    },
    {
      id: "waterRequirementCmd",
      label: "Daily Industrial Water Requirement",
      type: "number",
      required: true,
      placeholder: "e.g. 50",
      unit: "CMD (KLD)",
      helperText: "Cubic Metres per Day supplied by MIDC Water Works.",
    },
    {
      id: "capexFixedAssets",
      label: "Proposed Capital Investment in Fixed Assets",
      type: "number",
      required: true,
      placeholder: "e.g. 25.5",
      unit: "₹ Crores",
      helperText: "Land, building civil work, plant & machinery investment.",
    },
    {
      id: "proposedEmployment",
      label: "Direct Employment Headcount",
      type: "number",
      required: true,
      placeholder: "e.g. 120",
      unit: "Persons",
      helperText: "Direct on-roll technical and non-technical workforce planned.",
    },
    {
      id: "implementationMonths",
      label: "Project Implementation Period",
      type: "select",
      required: true,
      options: [
        { label: "12 Months (Fast-track construction)", value: "12" },
        { label: "18 Months (Standard industrial timeframe)", value: "18" },
        { label: "24 Months (Heavy machinery & fabrication)", value: "24" },
        { label: "36 Months (Mega project multi-phase)", value: "36" },
      ],
      helperText: "Possession agreement mandates construction start within specified timeline.",
    },
    {
      id: "projectSummary",
      label: "Brief Summary of Proposed Manufacturing Operations",
      type: "textarea",
      required: true,
      placeholder: "Provide an executive summary of raw materials, manufacturing process, equipment, and market demand...",
      colSpan: 2,
    },
  ],
  complianceDeclarations: [
    {
      id: "midc_green_belt",
      title: "33% Green Belt & Tree Plantation Undertaking",
      description: "Applicant agrees to develop and maintain a mandatory minimum 33% green tree plantation belt within the allocated plot boundaries.",
      statutoryAct: "MIDC DCR 2023 & MoEFCC Environmental Guidelines",
      mandatory: true,
    },
    {
      id: "midc_dcr_setbacks",
      title: "Conformity to MIDC Setback & Fire Lane Clearances",
      description: "All building plinths shall maintain standard 6-metre peripheral roads for fire tenders and conform strictly to boundary setbacks.",
      statutoryAct: "Maharashtra Industrial Development Act, 1961 Section 43",
      mandatory: true,
    },
    {
      id: "midc_rwh_system",
      title: "Mandatory Rainwater Harvesting & Groundwater Recharge",
      description: "Applicant covenants to install functional rainwater harvesting structures and recharge pits before requesting building occupancy certificate.",
      statutoryAct: "CGWB & Maharashtra Water Resources Regulatory Authority Rules",
      mandatory: true,
    },
    {
      id: "midc_lease_agreement",
      title: "Agreement to Execute Lease Deed within 60 Days",
      description: "Applicant undertakes to pay the required earnest deposit and execute the formal tripartite lease agreement within 60 calendar days of provisional allotment.",
      statutoryAct: "MIDC Land Disposal Regulations 1975 (Amended 2022)",
      mandatory: true,
    },
  ],
  documents: [
    {
      id: "dpr_feasibility_report",
      title: "Detailed Project Report (DPR) & Feasibility Study",
      description: "Technical feasibility, process description, machinery layout, and financial viability model.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
      sampleTemplateName: "DPR_Standard_Format.pdf",
    },
    {
      id: "architectural_layout_plan",
      title: "Conceptual Site Layout & Architectural Blueprint",
      description: "Scaled layout indicating proposed building boundaries, parking, green belt, and fire lanes.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf", ".dwg"],
    },
    {
      id: "entity_constitution_doc",
      title: "Entity Registration Certificate (MOA / Partnership Deed / Trust Deed)",
      description: "Certificate of Incorporation with Memorandum of Association or registered Partnership Deed.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "ca_networth_certificate",
      title: "CA Certified Net Worth & Means of Finance Certificate",
      description: "Certified document verifying promoter net worth and equity/debt arrangement for the project.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "board_resolution_signatory",
      title: "Board Resolution / Power of Attorney for Authorized Signatory",
      description: "Resolution authorizing the signatory to execute deeds and represent the applicant company.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "land_justification_note",
      title: "Land Requirement Justification Note",
      description: "Detailed area calculations explaining why the requested plot area is needed for equipment and staging.",
      mandatory: false,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
  ],
  feeCalculator: (values) => {
    const area = Number(values.plotAreaRequired) || 1000;
    const baseFee = Math.min(Math.max(area * 5, 15000), 50000);
    const cess = Math.round(baseFee * 0.18);
    return {
      baseFee,
      cess,
      total: baseFee + cess,
      explanation: `Calculated at ₹5/sq.m of requested plot area (${area} sq.m) + 18% GST (capped under MIDC schedule).`,
    };
  },
};

// ============================================================================
// 2. MPCB CONSENT TO ESTABLISH (CTE) & OPERATE (CTO)
// ============================================================================
export const mpcbConsentConfig: ApprovalConfig = {
  meta: {
    id: "mpcb-consent",
    slug: "mpcb-consent",
    title: "MPCB Consent to Establish (CTE) & Operate (CTO)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    departmentCode: "MPCB",
    category: "Pre-Establishment",
    slaDays: 21,
    feeRange: "₹25,000 - ₹1,25,000 (Based on Gross Capital Investment in Plant & Machinery)",
    act: "Water (Prevention & Control of Pollution) Act 1974 & Air Act 1981",
    description:
      "Statutory environmental consent categorization (Red/Orange/Green/White) and clearance for industrial air emissions, effluent discharge, and hazardous waste storage.",
    validityYears: "5 Years (CTE) / 1-5 Years (CTO)",
    officialWebsite: "https://mpcb.gov.in",
    helpline: "022-24010437 / 022-24020781",
    iconName: "Factory",
  },
  aliases: ["mpcb-cte", "mpcb-consent", "mpcb"],
  projectFields: [
    {
      id: "consentType",
      label: "Consent Application Type",
      type: "select",
      required: true,
      options: [
        { label: "Consent to Establish (CTE) - Fresh Unit", value: "cte_fresh" },
        { label: "Consent to Operate (CTO) - Fresh Unit", value: "cto_fresh" },
        { label: "Renewal of Consent to Operate (CTO Renewal)", value: "cto_renewal" },
        { label: "Consent to Establish - Expansion / Modernization", value: "cte_expansion" },
      ],
      helperText: "CTE is mandatory before starting any ground civil construction.",
    },
    {
      id: "pollutionCategory",
      label: "CPCB / MPCB Industrial Pollution Classification",
      type: "select",
      required: true,
      options: [
        { label: "Red Category (Pollution Index Score 60 & above - High Impact)", value: "red" },
        { label: "Orange Category (Pollution Index Score 41 to 59 - Moderate Impact)", value: "orange" },
        { label: "Green Category (Pollution Index Score 21 to 40 - Low Impact)", value: "green" },
        { label: "White Category (Pollution Index Score up to 20 - Non-Polluting / Fast Track)", value: "white" },
      ],
      helperText: "Categorized under Central Pollution Control Board (CPCB) harmonized criteria.",
    },
    {
      id: "nicCodeCategory",
      label: "National Industrial Classification (NIC) Sector",
      type: "select",
      required: true,
      options: [
        { label: "201 - Manufacture of basic chemicals, fertilizers & plastics", value: "nic_chemicals" },
        { label: "210 - Manufacture of pharmaceuticals, medicinal chemicals & botanicals", value: "nic_pharma" },
        { label: "291 - Manufacture of motor vehicles, trailers & semi-trailers", value: "nic_auto" },
        { label: "259 - Manufacture of other fabricated metal products; metal working", value: "nic_metals" },
        { label: "107 - Manufacture of other food products, beverages & starch", value: "nic_food" },
        { label: "131 - Spinning, weaving & finishing of textiles (dyeing/washing)", value: "nic_textiles" },
        { label: "261 - Manufacture of electronic components, boards & computers", value: "nic_electronics" },
        { label: "382 - Waste treatment and disposal activities", value: "nic_waste" },
      ],
      helperText: "Select matching 3-digit NIC category.",
    },
    {
      id: "finishedProducts",
      label: "Main Finished Products & Installed Monthly Capacity",
      type: "text",
      required: true,
      placeholder: "e.g. Synthetic Resins: 500 MT/month, Polymer Emulsions: 250 MT/month",
      helperText: "State maximum monthly production quantity with metric units.",
    },
    {
      id: "rawMaterials",
      label: "Principal Raw Materials, Chemicals & Solvents Consumed",
      type: "textarea",
      required: true,
      placeholder: "e.g. Styrene Monomer (120 MT/M), Butyl Acrylate (80 MT/M), Catalysts, Industrial solvents...",
      helperText: "List key chemical inputs and monthly consumption rate.",
    },
    {
      id: "freshWaterConsumption",
      label: "Total Daily Fresh Water Consumption",
      type: "number",
      required: true,
      placeholder: "e.g. 60",
      unit: "KLD (m³/day)",
      helperText: "Includes boiler feed, cooling towers, process, and domestic usage.",
    },
    {
      id: "effluentGeneration",
      label: "Total Daily Wastewater / Effluent Generation",
      type: "number",
      required: true,
      placeholder: "e.g. 35",
      unit: "KLD (m³/day)",
      helperText: "Combined trade effluent and domestic sewage discharge.",
    },
    {
      id: "effluentTreatmentType",
      label: "Proposed Effluent Treatment Scheme",
      type: "select",
      required: true,
      options: [
        { label: "Zero Liquid Discharge (ZLD) - Multi-Effect Evaporator (MEE) + ATFD", value: "zld" },
        { label: "Dedicated On-Site ETP (Primary + Secondary Biological + Tertiary RO)", value: "etp_onsite" },
        { label: "Connected to Common Effluent Treatment Plant (CETP MIDC)", value: "cetp_connected" },
        { label: "Sewage Treatment Plant (STP) only - No hazardous trade effluent", value: "stp_only" },
        { label: "Soak Pit with Septic Tank (Green/White Category domestic only)", value: "septic_tank" },
      ],
      helperText: "Red & chemical categories mandate ZLD or certified CETP membership.",
    },
    {
      id: "airStackCount",
      label: "Number of Air Emission Chimneys / Stacks",
      type: "number",
      required: true,
      placeholder: "e.g. 2",
      unit: "Stacks",
      helperText: "Boiler chimneys, DG set exhausts, and process vents.",
    },
    {
      id: "stackHeight",
      label: "Height of Highest Process Chimney / Stack",
      type: "number",
      required: true,
      placeholder: "e.g. 30",
      unit: "Meters above ground",
      helperText: "CPCB formula: H = 14 * Q^0.3 (where Q is SO2 emission rate).",
    },
    {
      id: "hazardousWasteCategory",
      label: "Primary Hazardous Waste Category (HOWM Rules 2016)",
      type: "select",
      required: true,
      options: [
        { label: "No Hazardous Waste Generated", value: "none" },
        { label: "Used / Spent Lubricating Oil (Schedule I - Cat 5.1)", value: "spent_oil" },
        { label: "Chemical ETP Treatment Sludge (Schedule I - Cat 35.3)", value: "etp_sludge" },
        { label: "Discarded Chemical Drums & Liners (Schedule I - Cat 33.1)", value: "empty_drums" },
        { label: "Spent Organic Solvents / Distillation Residue (Cat 20.1)", value: "spent_solvents" },
        { label: "Incinerator Ash / Flue Gas Dust (Schedule I - Cat 37.2)", value: "fly_ash" },
      ],
      helperText: "Classified under Hazardous and Other Wastes Rules, 2016.",
    },
    {
      id: "hazardousWasteQuantity",
      label: "Estimated Hazardous Waste Quantity per Year",
      type: "number",
      required: true,
      placeholder: "e.g. 15",
      unit: "Metric Tonnes / Year",
      helperText: "Quantified for disposal at authorized CHWTSDF sites (e.g. MEPL).",
    },
  ],
  complianceDeclarations: [
    {
      id: "mpcb_water_air_act",
      title: "Water Act 1974 & Air Act 1981 Statutory Undertaking",
      description: "Applicant affirms strict compliance with effluent and emission standards prescribed under Water Act 1974, Air Act 1981 and EPA 1986.",
      statutoryAct: "Water (P&CP) Act 1974 & Air (P&CP) Act 1981",
      mandatory: true,
    },
    {
      id: "mpcb_chwtsdf_membership",
      title: "Disposal Agreement with Authorized CHWTSDF Facility",
      description: "Applicant commits to execute an annual disposal agreement with MEPL/MWML or authorized Common Hazardous Waste facility prior to production commencement.",
      statutoryAct: "Hazardous and Other Wastes (Management & Transboundary Movement) Rules, 2016",
      mandatory: true,
    },
    {
      id: "mpcb_cems_installation",
      title: "Online Continuous Emission Monitoring System (OCEMS) Undertaking",
      description: "For Red Category industries, applicant undertakes to install tamper-proof OCEMS connected directly to MPCB and CPCB cloud servers.",
      statutoryAct: "CPCB Environmental Surveillance Directives",
      mandatory: true,
    },
    {
      id: "mpcb_public_nuisance",
      title: "No Odour / Noise Nuisance to Surrounding Habitat",
      description: "Applicant guarantees noise levels within factory boundaries will remain under 75 dB(A) day-time and 70 dB(A) night-time with zero toxic fugitive emissions.",
      statutoryAct: "Noise Pollution (Regulation and Control) Rules, 2000",
      mandatory: true,
    },
  ],
  documents: [
    {
      id: "process_flow_mass_balance",
      title: "Manufacturing Process Flow Diagram with Mass & Water Balance",
      description: "Comprehensive block diagram illustrating all unit processes, chemical additions, and water recovery.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "topo_sheet_site_plan",
      title: "Site Plan & Topo Sheet with 5-km Environmental Radius Map",
      description: "Topographical drawing showing nearest rivers, residential areas, forests, and national highways.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "etp_stp_design_schematic",
      title: "ETP & STP Detailed Engineering Design Scheme",
      description: "Civil design, retention times, hydraulic flow sheets, and chemical dosing specifications.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "ca_gross_capital_certificate",
      title: "CA Gross Capital Investment Certificate (Land, Building, Plant)",
      description: "Audited certificate determining the official consent fee slab based on overall capital outlay.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "baseline_air_noise_report",
      title: "Baseline Ambient Air & Noise Monitoring Report",
      description: "NABL/MoEFCC accredited lab survey of baseline PM10, PM2.5, SO2, NOx levels.",
      mandatory: false,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "midc_land_possession_letter",
      title: "MIDC Plot Allotment Letter / Land Ownership Deed",
      description: "Proof of legal title or registered lease for the factory premises.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
  ],
  feeCalculator: (values) => {
    const capex = Number(values.capexFixedAssets) || 10;
    let baseFee = 25000;
    if (capex > 50) baseFee = 100000;
    else if (capex > 25) baseFee = 75000;
    else if (capex > 10) baseFee = 50000;
    const cess = Math.round(baseFee * 0.18);
    return {
      baseFee,
      cess,
      total: baseFee + cess,
      explanation: `Calculated from MPCB Capital Investment slab (₹${capex} Cr capex) + 18% GST.`,
    };
  },
};

// ============================================================================
// 3. PROVISIONAL FIRE SAFETY & PREVENTION NOC
// ============================================================================
export const fireSafetyNocConfig: ApprovalConfig = {
  meta: {
    id: "fire-safety-noc",
    slug: "fire-safety-noc",
    title: "Provisional Fire Safety & Prevention NOC",
    department: "Directorate of Maharashtra Fire Services",
    departmentCode: "MFIS",
    category: "Pre-Establishment",
    slaDays: 14,
    feeRange: "₹10,000 - ₹45,000 (Based on Total Built-up Area & Hazard Class)",
    act: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
    description:
      "Statutory life safety audit, egress analysis, fire hydrant/sprinkler plan approval, and provisional construction clearance for industrial and commercial premises.",
    validityYears: "Valid until Completion / Form B Issuance",
    officialWebsite: "https://mahafireservice.gov.in",
    helpline: "022-26677555 / 101",
    iconName: "Flame",
  },
  aliases: ["fire-noc", "fire-safety-noc", "fire"],
  projectFields: [
    {
      id: "occupancyHazardClass",
      label: "NBC 2016 Occupancy & Hazard Classification",
      type: "select",
      required: true,
      options: [
        { label: "Group G-1: Industrial Low Hazard (Non-combustible materials)", value: "g1_low" },
        { label: "Group G-2: Industrial Moderate Hazard (General manufacturing)", value: "g2_moderate" },
        { label: "Group G-3: Industrial High Hazard (Flammables, toxic, explosive risk)", value: "g3_high" },
        { label: "Group H: Storage & Hazardous Warehouses", value: "group_h_storage" },
        { label: "Group E: Business / Corporate IT Parks", value: "group_e_business" },
      ],
      helperText: "Determined per National Building Code (NBC) 2016 Part 4 standards.",
    },
    {
      id: "plotAreaSqM",
      label: "Total Plot Area",
      type: "number",
      required: true,
      placeholder: "e.g. 8000",
      unit: "sq. metres",
      helperText: "Gross plot area within surveyed boundary.",
    },
    {
      id: "totalBuiltUpAreaSqM",
      label: "Total Proposed Built-Up Area (All Floors)",
      type: "number",
      required: true,
      placeholder: "e.g. 5200",
      unit: "sq. metres",
      helperText: "Aggregated floor area across all proposed buildings.",
    },
    {
      id: "maxBuildingHeightM",
      label: "Maximum Building Height (Highest Floor Level)",
      type: "number",
      required: true,
      placeholder: "e.g. 14.5",
      unit: "Meters",
      helperText: "Buildings exceeding 15 meters are classified as High-Rise under Maharashtra rules.",
    },
    {
      id: "numberOfFloors",
      label: "Number of Floors & Basements",
      type: "select",
      required: true,
      options: [
        { label: "Single Ground Floor Shed / High-Bay Plinth", value: "ground_only" },
        { label: "Ground + 1 Upper Floor", value: "g_plus_1" },
        { label: "Ground + 2 to 4 Upper Floors", value: "g_plus_4" },
        { label: "Multi-Storey High Rise (> 15m) with Basement", value: "high_rise_basement" },
      ],
      helperText: "Influences emergency staircase count and sprinkler density.",
    },
    {
      id: "peripheralRoadWidth",
      label: "Width of Peripheral Fire Tender Access Road",
      type: "number",
      required: true,
      placeholder: "e.g. 6.5",
      unit: "Meters",
      helperText: "Statutory minimum 6.0 meters all around structure is legally mandatory.",
    },
    {
      id: "staticWaterTankLitres",
      label: "Dedicated Underground / Overhead Fire Water Tank Capacity",
      type: "number",
      required: true,
      placeholder: "e.g. 150000",
      unit: "Litres",
      helperText: "Minimum 100,000 Litres for moderate hazard; 200,000+ for high hazard.",
    },
    {
      id: "nearestFireStationDistanceKm",
      label: "Distance to Nearest Operational Fire Station",
      type: "number",
      required: true,
      placeholder: "e.g. 4.2",
      unit: "Kilometres",
      helperText: "MIDC or municipal fire brigade response distance.",
    },
    {
      id: "flammableLiquidsStored",
      label: "Flammable Liquids / Solvents / Compressed Gas Storage",
      type: "select",
      required: true,
      options: [
        { label: "No flammable solvents or gases stored on site", value: "none" },
        { label: "Class A / Class B Solvents in drums (< 5,000 Litres)", value: "solvents_drums" },
        { label: "Bulk Underground Solvent Storage Tanks (> 5,000 Litres)", value: "bulk_underground" },
        { label: "LPG / Compressed Gas Cylinder Bank or Bullet", value: "gas_bullet" },
      ],
      helperText: "Requires dedicated foam-water deluge or gas suppression installations.",
    },
    {
      id: "fireProtectionSystems",
      label: "Proposed Fire Protection & Alarm Systems",
      type: "textarea",
      required: true,
      placeholder: "e.g. Automatic Sprinklers throughout production floor, Internal wet risers with landing valves at every 30m, 50kg ABC extinguishers, addressable optical smoke detectors, 45kW diesel fire pump...",
      colSpan: 2,
    },
  ],
  complianceDeclarations: [
    {
      id: "fire_nbc_part4",
      title: "National Building Code 2016 Part 4 Strict Compliance",
      description: "Applicant affirms all egress widths, travel distances (max 30m to nearest exit), fire doors, and compartmentation follow NBC 2016 Part 4 without variance.",
      statutoryAct: "Maharashtra Fire Prevention and Life Safety Measures Act, 2006",
      mandatory: true,
    },
    {
      id: "fire_peripheral_clearance",
      title: "6.0m Unobstructed Motorway for 40-Tonne Hydraulic Turn Table",
      description: "Applicant covenants that the 6m peripheral driveway shall remain free from overhead pipes, power lines, or physical parking obstructions 24 hours a day.",
      statutoryAct: "Maharashtra Fire Prevention Rules, 2009",
      mandatory: true,
    },
    {
      id: "fire_form_b_audit",
      title: "Bi-Annual Fire Safety Audit & Form B Renewal",
      description: "Applicant covenants to conduct half-yearly inspection through a Licensed Fire Agency and submit statutory Form 'B' every January and July.",
      statutoryAct: "Section 3(3) of Maharashtra Fire Prevention Act, 2006",
      mandatory: true,
    },
  ],
  documents: [
    {
      id: "architect_building_plans_exits",
      title: "Architect-Certified Building Plans Highlighting Exits & Fire Stairs",
      description: "Floor drawings showing travel distance lines, emergency exits, fire tower staircases, and occupancy loads.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "site_plan_fire_tenders",
      title: "Site Master Plan indicating 6m Peripheral Fire Driveways & Gates",
      description: "Clear demarcation of 6.0m wide driveway, turn radius, static water tank, and pump house location.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "fire_hydrant_sprinkler_schematic",
      title: "Fire Hydrant, Sprinkler Riser & Pumping Schematic Diagram",
      description: "Hydraulic calculation note, riser layout, jockey pump, electric main pump, and diesel standby pump ratings.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "structural_stability_fire_certificate",
      title: "Structural Engineer Certificate on 2-Hour Fire Rating Walls",
      description: "Certificate by licensed Structural Engineer on load bearing capacity and fire rating of separation walls.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "msds_chemical_inventory",
      title: "Material Safety Data Sheets (MSDS) for Stored Flammables",
      description: "Flash points, storage temperature limits, and extinguishing media compatibility notes.",
      mandatory: false,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
  ],
  feeCalculator: (values) => {
    const area = Number(values.totalBuiltUpAreaSqM) || 2000;
    const baseFee = Math.min(Math.max(area * 4, 10000), 45000);
    const cess = Math.round(baseFee * 0.18);
    return {
      baseFee,
      cess,
      total: baseFee + cess,
      explanation: `Calculated at ₹4/sq.m of total built-up area (${area} sq.m) + 18% GST (capped under Fire Service schedule).`,
    };
  },
};

// ============================================================================
// 4. FACTORY REGISTRATION & SAFETY LICENSE (DISH)
// ============================================================================
export const dishFactoryLicenseConfig: ApprovalConfig = {
  meta: {
    id: "dish-factory-license",
    slug: "dish-factory-license",
    title: "Factory Registration & Safety License (DISH)",
    department: "Directorate of Industrial Safety & Health (DISH)",
    departmentCode: "DISH",
    category: "Pre-Operation",
    slaDays: 10,
    feeRange: "₹8,000 - ₹35,000 (Based on Connected Motive Power HP and Worker Count)",
    act: "The Factories Act, 1948 & Maharashtra Factories Rules, 1963",
    description:
      "Statutory industrial factory license approval, occupier responsibility registration, machinery safety compliance inspection, and worker welfare verification.",
    validityYears: "1 to 5 Years Renewal Cycle",
    officialWebsite: "https://dish.maharashtra.gov.in",
    helpline: "022-26572504 / 022-26572509",
    iconName: "ShieldCheck",
  },
  aliases: ["dish-license", "dish-factory-license", "dish"],
  projectFields: [
    {
      id: "factoryPremisesAddress",
      label: "Factory Premises Location & Survey / MIDC Plot Number",
      type: "text",
      required: true,
      placeholder: "e.g. Plot No. E-42, Chakan Industrial Area Phase II, Taluka Khed, Pune",
      helperText: "Exact site address where manufacturing machinery is being erected.",
    },
    {
      id: "occupierName",
      label: "Full Name of Factory Occupier (Director / Designated Partner)",
      type: "text",
      required: true,
      placeholder: "e.g. Rajesh S. Kulkarni",
      helperText: "Occupier as defined under Section 2(n) of Factories Act, 1948.",
    },
    {
      id: "occupierDinAadhaar",
      label: "Occupier DIN (Director Identification No.) or Corporate PAN",
      type: "text",
      required: true,
      placeholder: "e.g. DIN 08921456 or ABCDE1234F",
      helperText: "Statutory proof of corporate directorship.",
    },
    {
      id: "factoryManagerName",
      label: "Full Name of Appointed Factory Manager on Record",
      type: "text",
      required: true,
      placeholder: "e.g. Anil M. Joshi",
      helperText: "Designated manager residing within factory locality.",
    },
    {
      id: "factoryManagerContact",
      label: "Factory Manager Contact Mobile Number",
      type: "tel",
      required: true,
      placeholder: "e.g. 9822012345",
      helperText: "For emergency statutory correspondence and safety inspections.",
    },
    {
      id: "operatingShifts",
      label: "Daily Operational Shift Schedule",
      type: "select",
      required: true,
      options: [
        { label: "1 Single General Shift (08:30 to 17:30)", value: "1_shift" },
        { label: "2 Shifts (Day & Evening Shifts)", value: "2_shifts" },
        { label: "3 Continuous Shifts (24-Hour Continuous Operation)", value: "3_shifts" },
      ],
      helperText: "Night shifts with female workers require special transportation security provisions.",
    },
    {
      id: "maxDailyWorkers",
      label: "Maximum Total Workers Employed on Any Single Day",
      type: "number",
      required: true,
      placeholder: "e.g. 150",
      unit: "Workers",
      helperText: "Includes permanent, probationer, trainee, and contractual employees.",
    },
    {
      id: "contractualWorkers",
      label: "Number of Contractual / Indirect Workers out of Total",
      type: "number",
      required: true,
      placeholder: "e.g. 45",
      unit: "Workers",
      helperText: "Requires compliance with Contract Labour (R&A) Act 1970.",
    },
    {
      id: "installedMotivePowerHp",
      label: "Total Connected Motive Electric Power",
      type: "number",
      required: true,
      placeholder: "e.g. 250",
      unit: "Brake Horsepower (HP)",
      helperText: "Sum total of all electric drive motors, pumps, and machine drives.",
    },
    {
      id: "boilersInstalled",
      label: "High Pressure Steam Boilers / Unfired Pressure Vessels",
      type: "select",
      required: true,
      options: [
        { label: "No steam boilers or pressure vessels installed", value: "none" },
        { label: "Unfired Pressure Vessels installed (Air receivers, reactors > 1 kg/cm²)", value: "pressure_vessels" },
        { label: "IBR Certified Steam Boiler (< 500 kg/hr steam)", value: "boiler_small" },
        { label: "IBR Heavy Steam Boiler (> 500 kg/hr steam - full boiler inspection)", value: "boiler_heavy" },
      ],
      helperText: "Regulated under Indian Boilers Act, 1923.",
    },
    {
      id: "liftingAppliancesCranes",
      label: "Overhead EOT Cranes, Hoists & Passenger/Goods Lifts",
      type: "select",
      required: true,
      options: [
        { label: "No overhead cranes or industrial lifts installed", value: "none" },
        { label: "Overhead Electric Cranes installed (< 10 Tonnes capacity)", value: "eot_light" },
        { label: "Heavy Industrial Cranes (> 10 Tonnes) & Goods Lifts", value: "eot_heavy" },
      ],
      helperText: "Requires statutory annual load test certificate by Competent Person.",
    },
    {
      id: "workerWelfareAmenities",
      label: "Worker Welfare Amenities Provided on Premises",
      type: "textarea",
      required: true,
      placeholder: "e.g. Clean drinking water points, air-conditioned worker dining canteen, occupational first aid station with bed, separate sanitized toilets for male/female staff, protective PPE lockers...",
      colSpan: 2,
    },
  ],
  complianceDeclarations: [
    {
      id: "dish_safety_officer",
      title: "Appointment of Qualified Safety Officer & Safety Committee",
      description: "Applicant affirms constitution of factory Health & Safety Committee with equal worker representation, and appointment of dedicated Safety Officer (if workforce > 250).",
      statutoryAct: "Section 40-B of The Factories Act, 1948",
      mandatory: true,
    },
    {
      id: "dish_machine_guarding",
      title: "100% Machine Guarding & Mandatory PPE Provision",
      description: "All transmission machinery, gears, belts, and hazardous pinch points are fitted with physical interlocking guards and all workers provided with ISI-certified PPE.",
      statutoryAct: "Section 21 to 26 of The Factories Act, 1948",
      mandatory: true,
    },
    {
      id: "dish_canteen_creche",
      title: "Statutory Welfare Provision (Canteen, First Aid, Crèche)",
      description: "Applicant undertakes to operate a subsidized worker canteen (if workers > 250) and a crèche for children under 6 (if female workers > 30).",
      statutoryAct: "Sections 45 to 48 of The Factories Act, 1948",
      mandatory: true,
    },
  ],
  documents: [
    {
      id: "dish_approved_layout_plan",
      title: "Factory Building Layout Blueprint Signed by Licensed Architect",
      description: "Detailed plan showing machine placement, gangways, lighting, ventilation, and emergency exits.",
      mandatory: true,
      maxSizeMb: 10,
      allowedFormats: [".pdf"],
    },
    {
      id: "dish_form_1_application",
      title: "Form No. 1 - Application for Permission to Construct or Extend Factory",
      description: "Statutory application prescribed under Maharashtra Factories Rules, 1963.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "machinery_hp_schedule",
      title: "Schedule of Machinery & Electric Motor Drive Ratings (HP)",
      description: "Complete inventory list detailing machine name, manufacturer, and rated motor horsepower.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "manager_occupier_appointment",
      title: "Board Resolution Appointing Occupier & Manager Acceptance Letter",
      description: "Official company resolution designating the occupier and signed acceptance of factory manager.",
      mandatory: true,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
    {
      id: "occupational_health_policy",
      title: "Occupational Safety, Health & Environment (EHS) Policy Document",
      description: "Signed corporate policy outlining hazard prevention, mock drills, and worker medical checks.",
      mandatory: false,
      maxSizeMb: 5,
      allowedFormats: [".pdf"],
    },
  ],
  feeCalculator: (values) => {
    const workers = Number(values.maxDailyWorkers) || 50;
    const hp = Number(values.installedMotivePowerHp) || 100;
    let baseFee = 8000;
    if (workers > 250 || hp > 500) baseFee = 25000;
    else if (workers > 100 || hp > 200) baseFee = 16000;
    const cess = Math.round(baseFee * 0.18);
    return {
      baseFee,
      cess,
      total: baseFee + cess,
      explanation: `Calculated from DISH Schedule of Fees (${workers} workers, ${hp} HP motive power) + 18% GST.`,
    };
  },
};

// ============================================================================
// REGISTRY MAP AND LOOKUP HELPERS
// ============================================================================
export const allApprovalsList: ApprovalConfig[] = [
  midcLandConfig,
  mpcbConsentConfig,
  fireSafetyNocConfig,
  dishFactoryLicenseConfig,
];

export const approvalsRegistry: Record<string, ApprovalConfig> = {
  // Canonical Slugs
  "midc-land-allotment": midcLandConfig,
  "mpcb-consent": mpcbConsentConfig,
  "fire-safety-noc": fireSafetyNocConfig,
  "dish-factory-license": dishFactoryLicenseConfig,

  // Aliases and Legacy IDs
  "midc-land": midcLandConfig,
  "midc": midcLandConfig,
  "mpcb-cte": mpcbConsentConfig,
  "mpcb": mpcbConsentConfig,
  "fire-noc": fireSafetyNocConfig,
  "fire": fireSafetyNocConfig,
  "dish-license": dishFactoryLicenseConfig,
  "dish": dishFactoryLicenseConfig,
};

export function getApprovalConfig(slugOrId: string): ApprovalConfig | null {
  if (!slugOrId) return null;
  const normalized = slugOrId.toLowerCase().trim();
  return approvalsRegistry[normalized] || null;
}
