"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "mr" | "hi";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Government statement
    "topbar.gov_statement": "महाराष्ट्र शासन • Government of Maharashtra",
    "topbar.portal_title": "Single Window Clearance Portal",
    "topbar.text_size": "Adjust Text Size",
    "topbar.switch_lang": "Switch Language",

    // Navigation / Header
    "nav.services": "Services",
    "nav.approvals": "Approvals & Clearances",
    "nav.schemes": "Subsidies & PSI",
    "nav.sectors": "Sectors",
    "nav.sla_tracker": "SLA Tracker",
    "nav.portal_badge": "MH-SWS 2.0",
    "nav.portal_sub": "Government of Maharashtra Single Window Portal",
    "nav.investor_login": "Investor Login",
    "nav.dashboard": "Enterprise Dashboard",
    "nav.get_started": "Get Started",
    "nav.single_window": "Single Window Clearance",

    // Landing Page Hero
    "hero.badge": "Single Window Industrial Clearance Portal • Maharashtra",
    "hero.headline_start": "Accelerating Industrial",
    "hero.headline_highlight": "Enterprise Growth",
    "hero.headline_end": "in Maharashtra",
    "hero.subheadline": "Unified single-window portal enabling real-time statutory clearances, automated document pre-validation, smart DAG routing, and time-bound deemed approvals under Maharashtra Right to Public Services Act.",
    "hero.cta_primary": "Launch Single Window Application",
    "hero.cta_secondary": "Know Your Approvals (KYA)",
    "hero.stat1_val": "70+",
    "hero.stat1_label": "Integrated Clearances",
    "hero.stat2_val": "15-30",
    "hero.stat2_label": "Max SLA Working Days",
    "hero.stat3_val": "100%",
    "hero.stat3_label": "Deemed Approval Guarantee",
    "hero.stat4_val": "₹0",
    "hero.stat4_label": "Filing Delay Penalty",

    // Benefits & Pillars
    "benefits.badge": "Pioneering State Infrastructure",
    "benefits.title": "Why Industrialists Choose Maharashtra",
    "benefits.sub": "Engineered to eliminate departmental red tape and accelerate manufacturing plant commissioning.",
    "benefits.card1_title": "Automated Document Scrutiny & Vault",
    "benefits.card1_desc": "Automated OCR extracts key statutory parameters from lease deeds and blueprints with cross-document discrepancy detection.",
    "benefits.card2_title": "DAG Parallel Clearance Engine",
    "benefits.card2_desc": "Break out of sequential bottlenecks. MPCB, Fire NOC, and Water allotments process simultaneously.",
    "benefits.card3_title": "Deemed Approvals under RTS Act",
    "benefits.card3_desc": "If department officers don't review your dossier within statutory SLA limits, certificates are granted automatically by law.",
    "benefits.card4_title": "Integrated DigiLocker Pull",
    "benefits.card4_desc": "One-click pull for verified PAN, GSTIN, Udyam MSME, and Land Allocation deeds with zero manual paperwork.",

    // Landing Page Clearances Section
    "clearances.badge": "Single Window Matrix",
    "clearances.title": "Integrated Statutory Approvals",
    "clearances.sub": "Over 70+ department permits orchestrated through a single unified common application form.",

    // Modals
    "modal.consultation_title": "Schedule Industrial Advisory Consultation",
    "modal.consultation_desc": "Connect directly with Maharashtra Single Window Nodal Officers for fast-track setup assistance.",
    "modal.name": "Full Name",
    "modal.email": "Official Email Address",
    "modal.phone": "Contact Phone Number",
    "modal.sector": "Industry Sector",
    "modal.capex": "Expected Investment (in ₹ Crores)",
    "modal.zone": "Target MIDC Zone / District",
    "modal.submit_btn": "Confirm Consultation Request",
    "modal.success_title": "Advisory Request Scheduled!",
    "modal.success_desc": "A dedicated Nodal Officer will contact your enterprise within 24 business hours.",

    // Footer
    "footer.desc": "Official Single Window Clearance Portal by Government of Maharashtra. Streamlining industrial establishment, statutory permits, and PSI incentives.",
    "footer.quick_links": "Quick Links",
    "footer.departments": "Key Departments",
    "footer.support": "Help & Grievance Desk",
    "footer.rights": "Government of Maharashtra. All Rights Reserved. Built for Industrial Growth.",

    // Chatbot
    "chat.title": "AARAMBH Industrial Advisory",
    "chat.online": "Online • 24x7 Regulatory Assistant",
    "chat.placeholder": "Ask about clearances, MIDC zones, PSI subsidies, or SLAs...",
    "chat.disclaimer": "Advisory assistant provides guidance based on Maharashtra Industrial Policies & RTS Rules.",
    "chat.chip1": "What approvals do I need for Chemical manufacturing?",
    "chat.chip2": "How does Deemed Approval work?",
    "chat.chip3": "What subsidies apply for Pune Chakan MIDC?",
    "chat.welcome": "Namaste! I am the AARAMBH Industrial Advisory Assistant. How can I assist with your Maharashtra statutory clearances, MIDC land, or subsidy inquiries today?",

    // Dashboard Layout & Sidebar
    "dash.overview": "Control Center",
    "dash.kya": "KYA Wizard",
    "dash.vault": "Document Vault",
    "dash.dag": "DAG Workflow",
    "dash.sla": "SLA Tracker",
    "dash.prevalidation": "Pre-Validation",
    "dash.grievances": "Grievance Desk",
    "dash.officer": "Officer Workspace",
    "dash.profile": "Enterprise Profile",
    "dash.signout": "Sign Out",
    "dash.investor_view": "Investor View",
    "dash.officer_view": "Officer View",

    // Dashboard Overview Page
    "dash.welcome_title": "Enterprise Operations Control Center",
    "dash.welcome_sub": "Real-time visibility into Maharashtra single window clearances, parallel department processing, and statutory SLA counters.",
    "dash.kpi_active": "Active Applications",
    "dash.kpi_active_sub": "across 4 departments",
    "dash.kpi_parallel": "Parallel Lead Time",
    "dash.kpi_parallel_sub": "vs 72 days sequential",
    "dash.kpi_sla": "SLA Adherence Rate",
    "dash.kpi_sla_sub": "100% on statutory schedule",
    "dash.kpi_deemed": "Deemed Approvals",
    "dash.kpi_deemed_sub": "guaranteed by RTS Act",
    "dash.core_modules": "Core Workflow Modules",
    "dash.recent_title": "Recent Clearance Applications",
    "dash.th_app": "Application Ref",
    "dash.th_dept": "Department",
    "dash.th_clearance": "Clearance Name",
    "dash.th_sla": "Statutory SLA",
    "dash.th_status": "Status",
    "dash.btn_action": "Open Workflow",

    // KYA Page
    "kya.title": "Know Your Approvals (KYA) Wizard",
    "kya.sub": "Dynamic rule-based statutory clearance and subsidy evaluation for Maharashtra industries.",
    "kya.step1": "Sector Selection",
    "kya.step2": "Location & Zone",
    "kya.step3": "Capital Expenditure",
    "kya.step4": "Resource Demand",
    "kya.continue": "Continue",
    "kya.previous": "Previous Step",
    "kya.evaluate": "Evaluate & Generate Clearances",
    "kya.modify": "Modify Parameters",

    // Vault Page
    "vault.title": "Document Vault & Extraction",
    "vault.sub": "Store, auto-validate, and sync statutory clearance documents with automated OCR and structured parameter verification.",
    "vault.digilocker_title": "DigiLocker Verified Statutory Certificates",
    "vault.connect_dl": "Connect DigiLocker",
    "vault.drop_title": "Drop your Industrial Dossier or Click to Browse",
    "vault.process_ai": "Process Documents",
    "vault.extracted_title": "Extracted Payload Data",

    // DAG Page
    "dag.title": "Directed Acyclic Graph (DAG) Workflow",
    "dag.sub": "Live interactive dependency graph orchestrating multi-department industrial clearances.",
    "dag.reset": "Reset Simulation",
    "dag.stage1": "STAGE 1: ROOT DEPENDENCY",
    "dag.stage2": "STAGE 2: PARALLEL PROCESSING (3 STREAMS)",
    "dag.stage3": "STAGE 3: CONSOLIDATED GRANDCHILD",
    "dag.approve_node": "Approve Node",
    "dag.waiting": "Waiting on Parent",
    "dag.passed": "Passed",

    // SLA Page
    "sla.title": "SLA Tracker & Deemed Approval Simulator",
    "sla.sub": "Maharashtra Right to Public Services Act guarantees time-bound clearances.",
    "sla.simulator": "Interactive Time-Lapse Simulator",
    "sla.pause": "Pause Simulation",
    "sla.auto": "Auto-Simulate Timeline",

    // Prevalidation Page
    "preval.title": "Pre-Validation & Document Comparison",
    "preval.sub": "Automated cross-check engine verifying consistency across multi-document statutory filings before submission.",
    "preval.passed_gate": "Quality Gate Passed",
    "preval.locked_gate": "Quality Gate Locked",
    "preval.submit_btn": "Submit & Dispatch to Parallel Review",

    // Hero Search & Actions
    "hero.search_placeholder": "Search for approvals, licences, registrations, services e.g. MIDC, MPCB CTE...",
    "hero.all_approvals": "All Approvals",
    "hero.state_approvals": "State Approvals (MH)",
    "hero.central_approvals": "Central Approvals",
    "hero.govt_schemes": "Govt. Schemes & Subsidies",
    "hero.explore_all": "EXPLORE ALL",
    "hero.popular_clearances": "Popular Clearances:",
    "hero.kya_tagline": "Get a customized list of clearances in under 3 minutes",
    "hero.click_kya": "Click Here & Know Your Approvals",

    // Benefits Section
    "benefits.how_help": "How does AARAMBH help you?",
    "benefits.how_help_sub": "Eliminating procedural hurdles with an intelligent digital infrastructure engineered specifically for Maharashtra's industrial ecosystem.",
    "benefits.play_video": "PLAY VIDEO TO KNOW MORE",
    "benefits.explore_feature": "Explore Feature",
    "benefits.helpline_title": "Need Dedicated Single-Window Assistance?",
    "benefits.helpline_desc": "Call Toll-Free Investor Helpline 1800-120-8040 (9:00 AM to 6:00 PM, Mon-Sat) or connect with a District Industry Facilitator.",
    "benefits.raise_query": "Raise a Query",

    // Clearances Section
    "clearances.statutory_tag": "Statutory Clearances",
    "clearances.view_all": "VIEW ALL APPROVALS",
    "clearances.apply_online": "Apply Online",
    "clearances.working_days": "Working Days",
    "clearances.online_app": "Online Application",

    // Sectors Section
    "sectors.directory_tag": "SECTOR SPECIFIC DIRECTORY",
    "sectors.which_approvals": "Which approvals are required to start my business in",
    "sectors.select_industry": "Select your industry sector below to discover the exact statutory clearances, licenses, and applicable state incentives under Package Scheme of Incentives (PSI 2019).",
    "sectors.approvals_suffix": "Approvals",
    "sectors.clearances_required": "Clearances Required",
    "sectors.launch_kya_prefix": "Launch KYA for",

    // Zones Section
    "zones.clusters_tag": "STATE CLUSTERS",
    "zones.explore_title": "Explore Maharashtra Industrial Zones",
    "zones.explore_sub": "Plug-and-play industrial infrastructure across prime MIDC estates and DMIC corridors.",
    "zones.view_all_districts": "View All 36 Districts",
    "zones.primary_sectors": "Primary Sectors:",
    "zones.available_land": "Available Land:",
    "zones.check_approvals": "Check Approvals for this Zone",

    // Grievances Page
    "grievances.title": "Dispute Redressal & Officer Query Desk",
    "grievances.sub": "Time-bound statutory resolution for delays, inspection queries, or payment reconciliations under Maharashtra RTS Act.",
    "grievances.raise_ticket": "Raise New Ticket",
    "grievances.active_scrutiny": "Under Active Scrutiny",
    "grievances.resolved": "Resolved & Closed ✓",
    "grievances.target_dept": "Target Department",
    "grievances.subject": "Subject / Clear Query Summary",
    "grievances.details": "Detailed Description",
    "grievances.submit_btn": "Submit Grievance",
    "grievances.modal_title": "Raise Grievance or Officer Query",
    "grievances.modal_sub": "Your ticket will be routed directly to the designated nodal officer.",

    // Officer Workspace
    "officer.console_tag": "Department Officer Scrutiny Console",
    "officer.title": "Officer Review Queue",
    "officer.sub": "Review incoming Common Application Forms (CAF), verify OCR field extractions, conduct inspection reports, raise formal queries, or issue digital approval certificates.",
    "officer.queue_ref": "Application Ref",
    "officer.queue_enterprise": "Enterprise Name",
    "officer.queue_clearance": "Clearance Requested",
    "officer.queue_sla": "SLA Due Date",
    "officer.queue_action": "Review Action",
    "officer.endorse_approve": "Endorse & Approve",
    "officer.raise_query": "Raise Query",
    "officer.approved": "Approved ✓",
    "officer.restricted_title": "Restricted Officer Access",
    "officer.restricted_sub": "This workspace is exclusively for verified Department Scrutiny Officers. Toggle 'Officer View' on the top bar for testing.",

    // Profile Page
    "profile.title": "Investor Profile",
    "profile.single_window_id": "Enterprise Single Window ID",
    "profile.role_tier": "Role / Access Tier",
    "profile.registered_sector": "Registered Sector",
    "profile.industrial_zone": "Industrial Zone (MIDC)",
    "profile.active_badge": "Active Verified Profile",
    "profile.digi_badge": "DigiLocker Linked",
    "profile.edit_profile": "Edit Profile Details",
    "profile.save_changes": "Save Changes",

    // Common UI Elements
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.download": "Download",
    "common.view": "View",
    "common.remove": "Remove",
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.loading": "Loading...",

    // Auth & Form
    "auth.sign_in": "Sign In",
    "auth.sign_in_sub": "To access your dashboard and apply for approvals.",
    "auth.investor_login": "Investor Login",
    "auth.officer_login": "Dept. Officer",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.forgot_password": "Forgot Password?",
    "auth.digilocker_login": "Login with DigiLocker Account",
    "auth.no_account": "Don't have an account?",
    "auth.signup_now": "Sign Up Now",
    "auth.full_name": "Full Name of Authorized Signatory",
    "auth.mobile": "Mobile Number",
    "auth.next": "NEXT",
    "auth.back": "GO BACK",
    "auth.step": "Step",
    "auth.of": "of",
    "auth.complete_reg": "COMPLETE REGISTRATION",
    "auth.address": "Enter your Address",
    "auth.validate_pan": "Validate your Permanent Account Number (PAN)",
    "auth.legal_entity": "Select your legal entity type",
    "auth.login_title": "Welcome back to AARAMBH",
    "auth.login_sub": "Sign in with your enterprise credentials to manage your approvals.",
    "auth.signup_title": "Setup your profile",
    "auth.signup_sub": "Register your enterprise on the Maharashtra Single Window Portal.",
  },
  mr: {
    // Top Bar & Government statement
    "topbar.gov_statement": "महाराष्ट्र शासन • Government of Maharashtra",
    "topbar.portal_title": "एक खिडकी औद्योगिक परवाना पोर्टल",
    "topbar.text_size": "अक्षरांचा आकार बदला",
    "topbar.switch_lang": "भाषा बदला",

    // Navigation / Header
    "nav.services": "सेवा",
    "nav.approvals": "परवाने व मंजुऱ्या",
    "nav.schemes": "अनुदान व PSI योजना",
    "nav.sectors": "उद्योग क्षेत्र",
    "nav.sla_tracker": "SLA ट्रॅकर",
    "nav.portal_badge": "MH-SWS २.०",
    "nav.portal_sub": "महाराष्ट्र शासन एक खिडकी पोर्टल",
    "nav.investor_login": "उद्योजक लॉगिन",
    "nav.dashboard": "उद्यम डॅशबोर्ड",
    "nav.get_started": "सुरू करा",
    "nav.single_window": "एक खिडकी परवाना",

    // Landing Page Hero
    "hero.badge": "एक खिडकी औद्योगिक परवाना पोर्टल • महाराष्ट्र",
    "hero.headline_start": "महाराष्ट्रात औद्योगिक",
    "hero.headline_highlight": "उद्यमांची प्रगती",
    "hero.headline_end": "गतिमान करा",
    "hero.subheadline": "महाराष्ट्रात सर्व वैधानिक परवानग्या, स्वयंचलित कागदपत्र पूर्व-पडताळणी, DAG समांतर मंजुरी आणि महाराष्ट्र लोकसेवा हक्क अधिनियमांतर्गत विहित वेळेत मानिव मंजुरी.",
    "hero.cta_primary": "एक खिडकी अर्ज सुरू करा",
    "hero.cta_secondary": "परवानग्या जाणून घ्या (KYA)",
    "hero.stat1_val": "७०+",
    "hero.stat1_label": "एकत्रित परवाने",
    "hero.stat2_val": "१५-३०",
    "hero.stat2_label": "कमाल SLA कामाचे दिवस",
    "hero.stat3_val": "१००%",
    "hero.stat3_label": "मानिव मंजुरीची हमी",
    "hero.stat4_val": "₹०",
    "hero.stat4_label": "उशीर झाल्यास दंड नाही",

    // Benefits & Pillars
    "benefits.badge": "अग्रगण्य राज्य पायाभूत सुविधा",
    "benefits.title": "उद्योगपती महाराष्ट्राची निवड का करतात?",
    "benefits.sub": "विभागीय विलंब दूर करून उत्पादन युनिट्स वेळेत सुरू करण्यासाठी तयार केलेली आधुनिक प्रणाली.",
    "benefits.card1_title": "कागदपत्र तपासणी व व्हॉल्ट",
    "benefits.card1_desc": "स्वयंचलित OCR द्वारे भाडेपट्टे आणि नकाशांमधून वैधानिक माहिती तात्काळ तपासली जाते.",
    "benefits.card2_title": "DAG समांतर परवाना इंजिन",
    "benefits.card2_desc": "एकामागून एक रांगेत थांबण्याऐवजी MPCB, अग्निशमन NOC आणि पाणी वाटप एकाच वेळी मंजूर होतात.",
    "benefits.card3_title": "RTS कायद्यांतर्गत मानिव मंजुरी",
    "benefits.card3_desc": "विभागाने SLA वेळेत निर्णय न घेतल्यास कायद्यानुसार प्रमाणपत्र आपोआप मंजूर मानले जाते.",
    "benefits.card4_title": "डिजिलॉकर थेट एकत्रीकरण",
    "benefits.card4_desc": "पॅन, GSTIN, उद्यम MSME आणि MIDC वाटप पत्रे एका क्लिकवर डिजिलॉकरमधून थेट पडताळणी.",

    // Landing Page Clearances Section
    "clearances.badge": "एक खिडकी मॅट्रिक्स",
    "clearances.title": "एकात्मिक वैधानिक परवानग्या",
    "clearances.sub": "७० पेक्षा जास्त विभागीय परवाने एकाच सामाईक अर्जाद्वारे हाताळले जातात.",

    // Modals
    "modal.consultation_title": "औद्योगिक सल्लागार बैठक निश्चित करा",
    "modal.consultation_desc": "महाराष्ट्र एक खिडकी नोडल अधिकाऱ्यांशी थेट संपर्क साधा आणि जलद मंजुरी मिळवा.",
    "modal.name": "पूर्ण नाव",
    "modal.email": "अधिकृत ईमेल पत्ता",
    "modal.phone": "मोबाईल नंबर",
    "modal.sector": "उद्योग क्षेत्र",
    "modal.capex": "अपेक्षित गुंतवणूक (₹ कोटींमध्ये)",
    "modal.zone": "इच्छित MIDC क्षेत्र / जिल्हा",
    "modal.submit_btn": "सल्लागार अर्ज सबमिट करा",
    "modal.success_title": "सल्लागार बैठक नोंदवली गेली!",
    "modal.success_desc": "समर्पित नोडल अधिकारी २४ व्यावसायिक तासांत आपल्या उद्योगाशी संपर्क साधतील.",

    // Footer
    "footer.desc": "महाराष्ट्र शासनाचे अधिकृत एक खिडकी परवाना पोर्टल. उद्योग स्थापना, वैधानिक परवाने आणि PSI सवलती सुलभ करणारी यंत्रणा.",
    "footer.quick_links": "महत्त्वाच्या लिंक्स",
    "footer.departments": "प्रमुख विभाग",
    "footer.support": "मदत व तक्रार निवारण कक्ष",
    "footer.rights": "महाराष्ट्र शासन. सर्व हक्क राखीव. औद्योगिक विकासासाठी समर्पित.",

    // Chatbot
    "chat.title": "आरंभ औद्योगिक सल्लागार",
    "chat.online": "सक्रिय • २४x७ नियामक सहाय्यक",
    "chat.placeholder": "परवानग्या, MIDC क्षेत्र, PSI सबसिडी किंवा SLA बद्दल विचारा...",
    "chat.disclaimer": "सल्लागार सहाय्यक महाराष्ट्र औद्योगिक धोरणे आणि RTS नियमांवर आधारित मार्गदर्शन करतो.",
    "chat.chip1": "केमिकल उद्योगासाठी कोणते परवाने लागतात?",
    "chat.chip2": "मानिव मंजुरी (Deemed Approval) कशी मिळते?",
    "chat.chip3": "पुणे चाकण MIDC साठी कोणत्या सबसिडी आहेत?",
    "chat.welcome": "नमस्कार! मी आरंभ औद्योगिक सल्लागार सहाय्यक आहे. आज मी आपल्या महाराष्ट्र वैधानिक परवानग्या, MIDC जमीन किंवा सबसिडीबद्दल कशी मदत करू शकतो?",

    // Dashboard Layout & Sidebar
    "dash.overview": "नियंत्रण केंद्र",
    "dash.kya": "KYA विझार्ड",
    "dash.vault": "कागदपत्र व्हॉल्ट",
    "dash.dag": "DAG कार्यप्रवाह",
    "dash.sla": "SLA ट्रॅकर",
    "dash.prevalidation": "पूर्व-पडताळणी",
    "dash.grievances": "तक्रार निवारण",
    "dash.officer": "अधिकारी कार्यक्षेत्र",
    "dash.profile": "उद्यम प्रोफाइल",
    "dash.signout": "लॉग आउट",
    "dash.investor_view": "उद्योजक व्ह्यू",
    "dash.officer_view": "अधिकारी व्ह्यू",

    // Dashboard Overview Page
    "dash.welcome_title": "उद्यम ऑपरेशन्स नियंत्रण केंद्र",
    "dash.welcome_sub": "महाराष्ट्र एक खिडकी परवानग्या, समांतर प्रक्रिया आणि वैधानिक SLA काउंटर्सचे थेट विश्लेषण.",
    "dash.kpi_active": "सक्रिय अर्ज",
    "dash.kpi_active_sub": "४ विभागांमध्ये प्रलंबित",
    "dash.kpi_parallel": "समांतर लागणारा वेळ",
    "dash.kpi_parallel_sub": "७२ दिवसांऐवजी ३६ दिवस",
    "dash.kpi_sla": "SLA पालन प्रमाण",
    "dash.kpi_sla_sub": "१००% वेळेत कार्यवाही",
    "dash.kpi_deemed": "मानिव मंजुऱ्या",
    "dash.kpi_deemed_sub": "RTS कायद्यांतर्गत हमी",
    "dash.core_modules": "प्रमुख कार्यप्रवाह मॉड्यूल्स",
    "dash.recent_title": "नुकतेच सादर केलेले परवाना अर्ज",
    "dash.th_app": "अर्ज संदर्भ क्र.",
    "dash.th_dept": "विभाग",
    "dash.th_clearance": "परवान्याचे नाव",
    "dash.th_sla": "वैधानिक SLA",
    "dash.th_status": "स्थिती",
    "dash.btn_action": "कार्यप्रवाह उघडा",

    // KYA Page
    "kya.title": "परवानग्या जाणून घ्या (KYA) विझार्ड",
    "kya.sub": "महाराष्ट्रातील उद्योगांसाठी नियमांवर आधारित परवाने व सबसिडी मूल्यांकन.",
    "kya.step1": "उद्योग क्षेत्र निवड",
    "kya.step2": "स्थान आणि MIDC क्षेत्र",
    "kya.step3": "भांडवली गुंतवणूक",
    "kya.step4": "संसाधन आवश्यकता",
    "kya.continue": "पुढे चला",
    "kya.previous": "मागील पायरी",
    "kya.evaluate": "मूल्यांकन करा व परवाने तयार करा",
    "kya.modify": "मापदंड बदला",

    // Vault Page
    "vault.title": "कागदपत्र व्हॉल्ट व माहिती संकलन",
    "vault.sub": "स्वयंचलित OCR आणि स्ट्रक्चर्ड पडताळणीसह वैधानिक कागदपत्रे संग्रहित व सिंक करा.",
    "vault.digilocker_title": "डिजिलॉकर प्रमाणित वैधानिक प्रमाणपत्रे",
    "vault.connect_dl": "डिजिलॉकर कनेक्ट करा",
    "vault.drop_title": "आपली कागदपत्रे येथे ड्रॅग करा किंवा ब्राउझ करा",
    "vault.process_ai": "कागदपत्रे तपासा",
    "vault.extracted_title": "संकलित माहिती",

    // DAG Page
    "dag.title": "Directed Acyclic Graph (DAG) कार्यप्रवाह",
    "dag.sub": "विविध विभागांच्या परवानग्यांचे थेट परस्परसंवादी समांतर जाळे.",
    "dag.reset": "सिम्युलेशन रीसेट करा",
    "dag.stage1": "पायरी १: मूळ पूर्वअट",
    "dag.stage2": "पायरी २: समांतर प्रक्रिया (३ विभाग)",
    "dag.stage3": "पायरी ३: एकत्रित अंतिम मंजुरी",
    "dag.approve_node": "मंजूर करा",
    "dag.waiting": "मूळ मंजुरीची प्रतीक्षा",
    "dag.passed": "मंजूर झाले",

    // SLA Page
    "sla.title": "SLA ट्रॅकर आणि मानिव मंजुरी सिम्युलेटर",
    "sla.sub": "महाराष्ट्र लोकसेवा हक्क अधिनियमांतर्गत वेळेत परवान्यांची कायदेशीर हमी.",
    "sla.simulator": "परस्परसंवादी टाइम-लॅप्स सिम्युलेटर",
    "sla.pause": "सिम्युलेशन थांबवा",
    "sla.auto": "स्वयंचलित सिम्युलेशन",

    // Prevalidation Page
    "preval.title": "पूर्व-पडताळणी आणि कागदपत्र तुलना",
    "preval.sub": "अर्ज सादर करण्यापूर्वी कागदपत्रांमधील विसंगती शोधणारे स्वयंचलित इंजिन.",
    "preval.passed_gate": "दर्जा तपासणी उत्तीर्ण",
    "preval.locked_gate": "दर्जा तपासणी लॉक",
    "preval.submit_btn": "अर्ज सादर करा व समांतर पुनरावलोकन सुरू करा",

    // Hero Search & Actions
    "hero.search_placeholder": "परवाने, नोंदणी आणि सेवा शोधा उदा. MIDC, MPCB CTE...",
    "hero.all_approvals": "सर्व परवाने",
    "hero.state_approvals": "राज्य परवाने (महाराष्ट्र)",
    "hero.central_approvals": "केंद्रीय परवाने",
    "hero.govt_schemes": "शासकीय योजना व सबसिडी",
    "hero.explore_all": "सर्व परवाने एक्सप्लोर करा",
    "hero.popular_clearances": "लोकप्रिय परवाने:",
    "hero.kya_tagline": "३ मिनिटांपेक्षा कमी वेळेत आपल्या परवान्यांची यादी मिळवा",
    "hero.click_kya": "येथे क्लिक करा आणि परवानग्या जाणून घ्या",

    // Benefits Section
    "benefits.how_help": "आरंभ आपल्याला कशी मदत करतो?",
    "benefits.how_help_sub": "महाराष्ट्राच्या औद्योगिक परिसंस्थेसाठी तयार केलेल्या आधुनिक डिजिटल व्यासपीठाद्वारे सर्व अडचणी दूर करा.",
    "benefits.play_video": "अधिक जाणून घेण्यासाठी व्हिडिओ पहा",
    "benefits.explore_feature": "वैशिष्ट्ये एक्सप्लोर करा",
    "benefits.helpline_title": "समर्पित एक खिडकी सहाय्य हवे आहे का?",
    "benefits.helpline_desc": "टोल-फ्री गुंतवणूकदार हेल्पलाईन १८००-१२०-८०४० वर संपर्क साधा (सकाळी ९ ते संध्याकाळी ६, सोम-शनि) किंवा जिल्हा उद्योग अधिकाऱ्यांशी जोडा.",
    "benefits.raise_query": "तक्रार / शंका नोंदवा",

    // Clearances Section
    "clearances.statutory_tag": "वैधानिक परवानग्या",
    "clearances.view_all": "सर्व परवाने पहा",
    "clearances.apply_online": "ऑनलाईन अर्ज करा",
    "clearances.working_days": "कामाचे दिवस",
    "clearances.online_app": "ऑनलाईन अर्ज",

    // Sectors Section
    "sectors.directory_tag": "उद्योग क्षेत्र सूची",
    "sectors.which_approvals": "महाराष्ट्रात उद्योग सुरू करण्यासाठी कोणते परवाने आवश्यक आहेत?",
    "sectors.select_industry": "आपल्या उद्योगासाठी आवश्यक वैधानिक परवाने, लायसन्स आणि PSI २०१९ अंतर्गत मिळणारे राज्य प्रोत्साहन जाणून घेण्यासाठी खालील क्षेत्र निवडा.",
    "sectors.approvals_suffix": "परवाने",
    "sectors.clearances_required": "आवश्यक परवाने",
    "sectors.launch_kya_prefix": "KYA सुरू करा:",

    // Zones Section
    "zones.clusters_tag": "राज्य औद्योगिक क्षेत्रे",
    "zones.explore_title": "महाराष्ट्र औद्योगिक क्षेत्रे (MIDC) एक्सप्लोर करा",
    "zones.explore_sub": "प्रमुख MIDC वसाहती आणि DMIC कॉरिडोअरमध्ये सुसज्ज पायाभूत सुविधा.",
    "zones.view_all_districts": "सर्व ३६ जिल्हे पहा",
    "zones.primary_sectors": "प्रमुख उद्योग:",
    "zones.available_land": "उपलब्ध जमीन:",
    "zones.check_approvals": "या क्षेत्रासाठी परवाने तपासा",

    // Grievances Page
    "grievances.title": "तक्रार निवारण व अधिकारी चौकशी कक्ष",
    "grievances.sub": "महाराष्ट्र लोकसेवा हक्क अधिनियमांतर्गत विलंब, तपासणी प्रश्न किंवा शुल्काचे वेळेत वैधानिक निराकरण.",
    "grievances.raise_ticket": "नवीन तिकीट तयार करा",
    "grievances.active_scrutiny": "सक्रिय तपासणी सुरू आहे",
    "grievances.resolved": "निराकरण झाले व बंद ✓",
    "grievances.target_dept": "संबंधित विभाग",
    "grievances.subject": "विषय / स्पष्ट सारांश",
    "grievances.details": "तपशीलवार वर्णन",
    "grievances.submit_btn": "तक्रार दाखल करा",
    "grievances.modal_title": "तक्रार किंवा अधिकारी चौकशी दाखल करा",
    "grievances.modal_sub": "आपले तिकीट थेट नियुक्त नोडल अधिकाऱ्याकडे पाठवले जाईल.",

    // Officer Workspace
    "officer.console_tag": "विभागीय अधिकारी तपासणी कन्सोल",
    "officer.title": "अधिकारी पुनरावलोकन कतार",
    "officer.sub": "येणारे सामायिक अर्ज (CAF) तपासा, OCR निष्कर्षण सत्यापित करा, तपासणी अहवाल द्या किंवा डिजिटल मंजुरी प्रमाणपत्रे जारी करा.",
    "officer.queue_ref": "अर्ज संदर्भ क्रमांक",
    "officer.queue_enterprise": "उद्योगाचे नाव",
    "officer.queue_clearance": "मागितलेला परवाना",
    "officer.queue_sla": "SLA अंतिम तारीख",
    "officer.queue_action": "पुनरावलोकन कृती",
    "officer.endorse_approve": "मंजूर करा",
    "officer.raise_query": "प्रश्न उपस्थित करा",
    "officer.approved": "मंजूर ✓",
    "officer.restricted_title": "मर्यादित अधिकारी प्रवेश",
    "officer.restricted_sub": "हे वर्कस्पेस केवळ सत्यापित विभागीय अधिकाऱ्यांसाठी आहे. चाचणीसाठी वरील 'Officer View' टॉगल करा.",

    // Profile Page
    "profile.title": "उद्योजक प्रोफाइल",
    "profile.single_window_id": "उद्यम सिंगल विंडो आयडी",
    "profile.role_tier": "प्रवेश स्तर / भूमिका",
    "profile.registered_sector": "नोंदणीकृत उद्योग क्षेत्र",
    "profile.industrial_zone": "औद्योगिक क्षेत्र (MIDC)",
    "profile.active_badge": "सक्रिय सत्यापित प्रोफाइल",
    "profile.digi_badge": "डिजिलॉकर जोडलेले",
    "profile.edit_profile": "प्रोफाइल तपशील संपादित करा",
    "profile.save_changes": "बदल सेव्ह करा",

    // Common UI Elements
    "common.cancel": "रद्द करा",
    "common.close": "बंद करा",
    "common.download": "डाउनलोड करा",
    "common.view": "पहा",
    "common.remove": "काढून टाका",
    "common.submit": "सादर करा",
    "common.back": "मागे",
    "common.next": "पुढे",
    "common.loading": "लोड होत आहे...",

    // Auth & Form
    "auth.sign_in": "लॉग इन करा",
    "auth.sign_in_sub": "डॅशबोर्डमध्ये प्रवेश करण्यासाठी आणि परवान्यांसाठी अर्ज करण्यासाठी.",
    "auth.investor_login": "उद्योजक लॉगिन",
    "auth.officer_login": "विभागीय अधिकारी",
    "auth.email": "ईमेल पत्ता",
    "auth.password": "पासवर्ड",
    "auth.forgot_password": "पासवर्ड विसरलात?",
    "auth.digilocker_login": "डिजिलॉकर खात्याद्वारे लॉगिन करा",
    "auth.no_account": "खाते नाही का?",
    "auth.signup_now": "आता नोंदणी करा",
    "auth.full_name": "अधिकृत स्वाक्षरीकर्त्याचे पूर्ण नाव",
    "auth.mobile": "मोबाईल नंबर",
    "auth.next": "पुढे चला",
    "auth.back": "मागे जा",
    "auth.step": "पायरी",
    "auth.of": "/",
    "auth.complete_reg": "नोंदणी पूर्ण करा",
    "auth.address": "आपला पत्ता प्रविष्ट करा",
    "auth.validate_pan": "पॅन (PAN) नंबर प्रमाणित करा",
    "auth.legal_entity": "आपल्या संस्थेचा कायदेशीर प्रकार निवडा",
    "auth.login_title": "आरंभ पोर्टलवर आपले स्वागत आहे",
    "auth.login_sub": "आपल्या परवान्यांचे व्यवस्थापन करण्यासाठी आपल्या उद्यम क्रेडेंशियल्सने लॉगिन करा.",
    "auth.signup_title": "आपले प्रोफाइल सेट करा",
    "auth.signup_sub": "महाराष्ट्र सिंगल विंडो पोर्टलवर आपल्या उद्योगाची नोंदणी करा.",
  },
  hi: {
    // Top Bar & Government statement
    "topbar.gov_statement": "महाराष्ट्र शासन • Government of Maharashtra",
    "topbar.portal_title": "सिंगल विंडो औद्योगिक क्लीयरेंस पोर्टल",
    "topbar.text_size": "टेक्स्ट साइज़ बदलें",
    "topbar.switch_lang": "भाषा बदलें",

    // Navigation / Header
    "nav.services": "सेवाएं",
    "nav.approvals": "अनुमतियां एवं स्वीकृतियां",
    "nav.schemes": "सब्सिडी एवं PSI योजनाएं",
    "nav.sectors": "उद्योग क्षेत्र",
    "nav.sla_tracker": "SLA ट्रैकर",
    "nav.portal_badge": "MH-SWS 2.0",
    "nav.portal_sub": "महाराष्ट्र सरकार सिंगल विंडो पोर्टल",
    "nav.investor_login": "निवेशक लॉगिन",
    "nav.dashboard": "उद्यम डैशबोर्ड",
    "nav.get_started": "शुरू करें",
    "nav.single_window": "सिंगल विंडो क्लीयरेंस",

    // Landing Page Hero
    "hero.badge": "सिंगल विंडो औद्योगिक क्लीयरेंस पोर्टल • महाराष्ट्र",
    "hero.headline_start": "महाराष्ट्र में औद्योगिक",
    "hero.headline_highlight": "उद्यमों का विकास",
    "hero.headline_end": "गतिमान करें",
    "hero.subheadline": "महाराष्ट्र में सभी वैधानिक अनुमतियां, स्वचालित दस्तावेज़ पूर्व-सत्यापन, DAG समानांतर रूटिंग और लोक सेवा अधिकार अधिनियम के तहत समयबद्ध डीम्ड अप्रूवल।",
    "hero.cta_primary": "सिंगल विंडो आवेदन शुरू करें",
    "hero.cta_secondary": "अपनी स्वीकृतियां जानें (KYA)",
    "hero.stat1_val": "70+",
    "hero.stat1_label": "एकीकृत स्वीकृतियां",
    "hero.stat2_val": "15-30",
    "hero.stat2_label": "अधिकतम SLA कार्य दिवस",
    "hero.stat3_val": "100%",
    "hero.stat3_label": "डीम्ड अप्रूवल गारंटी",
    "hero.stat4_val": "₹0",
    "hero.stat4_label": "विलंब शुल्क शून्य",

    // Benefits & Pillars
    "benefits.badge": "अग्रणी राज्य अवसंरचना",
    "benefits.title": "उद्योगपति महाराष्ट्र को क्यों चुनते हैं?",
    "benefits.sub": "विभागीय देरी को समाप्त कर विनिर्माण संयंत्रों को समय पर शुरू करने के लिए निर्मित आधुनिक प्रणाली।",
    "benefits.card1_title": "दस्तावेज़ जांच एवं वॉल्ट",
    "benefits.card1_desc": "स्वचालित OCR द्वारा पट्टों और ब्लूप्रिंट से मुख्य वैधानिक विवरणों की त्वरित निष्कर्षण एवं जांच।",
    "benefits.card2_title": "DAG समानांतर क्लीयरेंस इंजन",
    "benefits.card2_desc": "क्रमिक कतारों से मुक्त। MPCB, फायर NOC और जल आवंटन एक साथ प्रोसेस होते हैं।",
    "benefits.card3_title": "RTS कानून के तहत डीम्ड अप्रूवल",
    "benefits.card3_desc": "यदि विभाग तय SLA सीमा में समीक्षा नहीं करता है, तो प्रमाणपत्र कानूनन स्वतः स्वीकृत माना जाता है।",
    "benefits.card4_title": "डिजिलॉकर से सीधा एकीकरण",
    "benefits.card4_desc": "पैन, GSTIN, उद्यम MSME और MIDC आवंटन प्रमाणपत्र एक क्लिक में बिना कागजी कार्रवाई के सत्यापित।",

    // Landing Page Clearances Section
    "clearances.badge": "सिंगल विंडो मैट्रिक्स",
    "clearances.title": "एकीकृत वैधानिक स्वीकृतियां",
    "clearances.sub": "70 से अधिक विभागीय अनुमतियां एक ही साझा आवेदन पत्र के माध्यम से संचालित।",

    // Modals
    "modal.consultation_title": "औद्योगिक परामर्श बैठक तय करें",
    "modal.consultation_desc": "महाराष्ट्र सिंगल विंडो नोडल अधिकारियों से सीधा संपर्क करें और त्वरित सहायता पाएं।",
    "modal.name": "पूरा नाम",
    "modal.email": "आधिकारिक ईमेल पता",
    "modal.phone": "संपर्क फ़ोन नंबर",
    "modal.sector": "उद्योग क्षेत्र",
    "modal.capex": "प्रस्तावित निवेश (₹ करोड़ में)",
    "modal.zone": "लक्षित MIDC क्षेत्र / जिला",
    "modal.submit_btn": "परामर्श अनुरोध सबमिट करें",
    "modal.success_title": "परामर्श बैठक निर्धारित की गई!",
    "modal.success_desc": "समर्पित नोडल अधिकारी 24 कार्य घंटों में आपके उद्योग से संपर्क करेंगे।",

    // Footer
    "footer.desc": "महाराष्ट्र सरकार का आधिकारिक सिंगल विंडो पोर्टल। उद्योग स्थापना, वैधानिक स्वीकृतियां और PSI प्रोत्साहन को सरल बनाने वाली प्रणाली।",
    "footer.quick_links": "महत्वपूर्ण लिंक्स",
    "footer.departments": "प्रमुख विभाग",
    "footer.support": "सहायता एवं शिकायत निवारण",
    "footer.rights": "महाराष्ट्र सरकार। सर्वाधिकार सुरक्षित। औद्योगिक विकास को समर्पित।",

    // Chatbot
    "chat.title": "आरंभ औद्योगिक सलाहकार",
    "chat.online": "ऑनलाइन • 24x7 विनियामक सहायक",
    "chat.placeholder": "स्वीकृतियों, MIDC क्षेत्रों, PSI सब्सिडी या SLA के बारे में पूछें...",
    "chat.disclaimer": "सलाहकार सहायक महाराष्ट्र औद्योगिक नीतियों और RTS नियमों के आधार पर मार्गदर्शन प्रदान करता है।",
    "chat.chip1": "केमिकल उद्योग के लिए कौन सी स्वीकृतियां आवश्यक हैं?",
    "chat.chip2": "डीम्ड अप्रूवल (Deemed Approval) कैसे काम करता है?",
    "chat.chip3": "पुणे चाकण MIDC के लिए कौन सी सब्सिडी लागू हैं?",
    "chat.welcome": "नमस्ते! मैं आरंभ औद्योगिक सलाहकार सहायक हूँ। आज मैं आपकी महाराष्ट्र वैधानिक स्वीकृतियों, MIDC भूमि या सब्सिडी पूछताछ में कैसे सहायता कर सकता हूँ?",

    // Dashboard Layout & Sidebar
    "dash.overview": "नियंत्रण केंद्र",
    "dash.kya": "KYA विज़ार्ड",
    "dash.vault": "दस्तावेज़ वॉल्ट",
    "dash.dag": "DAG वर्कफ़्लो",
    "dash.sla": "SLA ट्रैकर",
    "dash.prevalidation": "पूर्व-सत्यापन",
    "dash.grievances": "शिकायत डेस्क",
    "dash.officer": "अधिकारी कार्यक्षेत्र",
    "dash.profile": "उद्यम प्रोफ़ाइल",
    "dash.signout": "लॉग आउट",
    "dash.investor_view": "निवेशक व्यू",
    "dash.officer_view": "अधिकारी व्यू",

    // Dashboard Overview Page
    "dash.welcome_title": "उद्यम संचालन नियंत्रण केंद्र",
    "dash.welcome_sub": "महाराष्ट्र सिंगल विंडो क्लीयरेंस, समानांतर विभागीय प्रक्रिया और वैधानिक SLA काउंटरों की वास्तविक समय में निगरानी।",
    "dash.kpi_active": "सक्रिय आवेदन",
    "dash.kpi_active_sub": "4 विभागों में प्रक्रियाधीन",
    "dash.kpi_parallel": "समानांतर समय सीमा",
    "dash.kpi_parallel_sub": "72 दिनों के मुकाबले 36 दिन",
    "dash.kpi_sla": "SLA अनुपालन दर",
    "dash.kpi_sla_sub": "100% समयबद्ध प्रक्रिया",
    "dash.kpi_deemed": "डीम्ड स्वीकृतियां",
    "dash.kpi_deemed_sub": "RTS कानून द्वारा गारंटीकृत",
    "dash.core_modules": "प्रमुख वर्कफ़्लो मॉड्यूल्स",
    "dash.recent_title": "हाल के क्लीयरेंस आवेदन",
    "dash.th_app": "आवेदन संदर्भ संख्या",
    "dash.th_dept": "विभाग",
    "dash.th_clearance": "स्वीकृति का नाम",
    "dash.th_sla": "वैधानिक SLA",
    "dash.th_status": "स्थिति",
    "dash.btn_action": "वर्कफ़्लो खोलें",

    // KYA Page
    "kya.title": "अपनी स्वीकृतियां जानें (KYA) विज़ार्ड",
    "kya.sub": "महाराष्ट्र उद्योगों के लिए नियमों पर आधारित वैधानिक क्लीयरेंस एवं सब्सिडी मूल्यांकन।",
    "kya.step1": "उद्योग क्षेत्र चयन",
    "kya.step2": "स्थान एवं MIDC क्षेत्र",
    "kya.step3": "पूंजीगत व्यय (Capex)",
    "kya.step4": "संसाधन मांग",
    "kya.continue": "आगे बढ़ें",
    "kya.previous": "पिछला चरण",
    "kya.evaluate": "मूल्यांकन करें और स्वीकृतियां तैयार करें",
    "kya.modify": "पैरामीटर बदलें",

    // Vault Page
    "vault.title": "दस्तावेज़ वॉल्ट एवं डेटा निष्कर्षण",
    "vault.sub": "स्वचालित OCR और संरचित सत्यापन के साथ वैधानिक दस्तावेज़ों को संग्रहीत और सिंक करें।",
    "vault.digilocker_title": "डिजिलॉकर सत्यापित वैधानिक प्रमाणपत्र",
    "vault.connect_dl": "डिजिलॉकर कनेक्ट करें",
    "vault.drop_title": "अपनी औद्योगिक फाइल यहां खींचें या ब्राउज़ करें",
    "vault.process_ai": "दस्तावेज़ जांचें",
    "vault.extracted_title": "निष्कर्षित डेटा",

    // DAG Page
    "dag.title": "Directed Acyclic Graph (DAG) वर्कफ़्लो",
    "dag.sub": "बहु-विभागीय औद्योगिक स्वीकृतियों का इंटरैक्टिव समानांतर नेटवर्क।",
    "dag.reset": "सिमुलेशन रीसेट करें",
    "dag.stage1": "चरण 1: मुख्य पूर्व-शर्त",
    "dag.stage2": "चरण 2: समानांतर प्रक्रिया (3 विभाग)",
    "dag.stage3": "चरण 3: समेकित अंतिम स्वीकृति",
    "dag.approve_node": "स्वीकृत करें",
    "dag.waiting": "मुख्य स्वीकृति की प्रतीक्षा",
    "dag.passed": "सफल",

    // SLA Page
    "sla.title": "SLA ट्रैकर एवं डीम्ड अप्रूवल सिमुलेटर",
    "sla.sub": "महाराष्ट्र लोक सेवा अधिकार अधिनियम के तहत समयबद्ध क्लीयरेंस की गारंटी।",
    "sla.simulator": "इंटरैक्टिव टाइम-लैप्स सिमुलेटर",
    "sla.pause": "सिमुलेशन रोकें",
    "sla.auto": "स्वचालित सिमुलेशन",

    // Prevalidation Page
    "preval.title": "पूर्व-सत्यापन एवं दस्तावेज़ तुलना",
    "preval.sub": "आवेदन जमा करने से पहले बहु-दस्तावेज़ विसंगतियों का पता लगाने वाला स्वचालित इंजन।",
    "preval.passed_gate": "क्वालिटी गेट पास",
    "preval.locked_gate": "क्वालिटी गेट लॉक",
    "preval.submit_btn": "आवेदन जमा करें एवं समानांतर समीक्षा शुरू करें",

    // Hero Search & Actions
    "hero.search_placeholder": "स्वीकृतियां, लाइसेंस, पंजीकरण और सेवाएं खोजें उदा. MIDC, MPCB CTE...",
    "hero.all_approvals": "सभी स्वीकृतियां",
    "hero.state_approvals": "राज्य स्वीकृतियां (महाराष्ट्र)",
    "hero.central_approvals": "केंद्रीय स्वीकृतियां",
    "hero.govt_schemes": "सरकारी योजनाएं एवं सब्सिडी",
    "hero.explore_all": "सभी स्वीकृतियां देखें",
    "hero.popular_clearances": "लोकप्रिय स्वीकृतियां:",
    "hero.kya_tagline": "3 मिनट से भी कम समय में स्वीकृतियों की सूची प्राप्त करें",
    "hero.click_kya": "यहां क्लिक करें और स्वीकृतियां जानें",

    // Benefits Section
    "benefits.how_help": "आरंभ आपकी सहायता कैसे करता है?",
    "benefits.how_help_sub": "महाराष्ट्र के औद्योगिक परिवेश के लिए निर्मित आधुनिक डिजिटल प्रणाली के माध्यम से सभी बाधाएं दूर करें।",
    "benefits.play_video": "अधिक जानने के लिए वीडियो देखें",
    "benefits.explore_feature": "विशेषताएं देखें",
    "benefits.helpline_title": "समर्पित सिंगल-विंडो सहायता चाहिए?",
    "benefits.helpline_desc": "टोल-फ्री निवेशक हेल्पलाइन 1800-120-8040 (सुबह 9 से शाम 6, सोम-शनि) पर कॉल करें या जिला उद्योग अधिकारी से संपर्क करें।",
    "benefits.raise_query": "शिकायत / प्रश्न दर्ज करें",

    // Clearances Section
    "clearances.statutory_tag": "वैधानिक स्वीकृतियां",
    "clearances.view_all": "सभी स्वीकृतियां देखें",
    "clearances.apply_online": "ऑनलाइन आवेदन करें",
    "clearances.working_days": "कार्य दिवस",
    "clearances.online_app": "ऑनलाइन आवेदन",

    // Sectors Section
    "sectors.directory_tag": "उद्योग क्षेत्र डायरेक्टरी",
    "sectors.which_approvals": "महाराष्ट्र में व्यवसाय शुरू करने के लिए कौन सी स्वीकृतियां आवश्यक हैं?",
    "sectors.select_industry": "अपने उद्योग के लिए आवश्यक वैधानिक अनुमतियां, लाइसेंस और PSI 2019 प्रोत्साहन जानने के लिए नीचे दिए गए क्षेत्र का चयन करें।",
    "sectors.approvals_suffix": "स्वीकृतियां",
    "sectors.clearances_required": "आवश्यक स्वीकृतियां",
    "sectors.launch_kya_prefix": "KYA शुरू करें:",

    // Zones Section
    "zones.clusters_tag": "राज्य औद्योगिक क्षेत्र",
    "zones.explore_title": "महाराष्ट्र औद्योगिक क्षेत्र (MIDC) एक्सप्लोर करें",
    "zones.explore_sub": "प्रमुख MIDC एस्टेट और DMIC कॉरिडोर में तैयार औद्योगिक बुनियादी ढांचा।",
    "zones.view_all_districts": "सभी 36 जिले देखें",
    "zones.primary_sectors": "प्रमुख उद्योग:",
    "zones.available_land": "उपलब्ध भूमि:",
    "zones.check_approvals": "इस क्षेत्र के लिए स्वीकृतियां जांचें",

    // Grievances Page
    "grievances.title": "शिकायत निवारण एवं अधिकारी प्रश्न डेस्क",
    "grievances.sub": "महाराष्ट्र लोक सेवा अधिकार अधिनियम के तहत देरी, निरीक्षण प्रश्नों या भुगतान सुलह का समयबद्ध वैधानिक समाधान।",
    "grievances.raise_ticket": "नया टिकट बनाएं",
    "grievances.active_scrutiny": "सक्रिय समीक्षा जारी",
    "grievances.resolved": "समाधान पूर्ण एवं बंद ✓",
    "grievances.target_dept": "संबंधित विभाग",
    "grievances.subject": "विषय / स्पष्ट सारांश",
    "grievances.details": "विस्तृत विवरण",
    "grievances.submit_btn": "शिकायत दर्ज करें",
    "grievances.modal_title": "शिकायत या अधिकारी प्रश्न दर्ज करें",
    "grievances.modal_sub": "आपका टिकट सीधे नामित नोडल अधिकारी को भेजा जाएगा।",

    // Officer Workspace
    "officer.console_tag": "विभागीय अधिकारी समीक्षा कंसोल",
    "officer.title": "अधिकारी समीक्षा कतार",
    "officer.sub": "आने वाले सामान्य आवेदन पत्र (CAF) की समीक्षा करें, OCR निष्कर्षण सत्यापित करें, निरीक्षण रिपोर्ट दें या डिजिटल अनुमोदन प्रमाणपत्र जारी करें।",
    "officer.queue_ref": "आवेदन संदर्भ",
    "officer.queue_enterprise": "उद्यम का नाम",
    "officer.queue_clearance": "वांछित स्वीकृति",
    "officer.queue_sla": "SLA देय तिथि",
    "officer.queue_action": "समीक्षा कार्रवाई",
    "officer.endorse_approve": "स्वीकृत करें",
    "officer.raise_query": "प्रश्न पूछें",
    "officer.approved": "स्वीकृत ✓",
    "officer.restricted_title": "सीमित अधिकारी पहुंच",
    "officer.restricted_sub": "यह कार्यक्षेत्र केवल सत्यापित विभागीय अधिकारियों के लिए है। परीक्षण के लिए ऊपर 'Officer View' टॉगल करें।",

    // Profile Page
    "profile.title": "निवेशक प्रोफाइल",
    "profile.single_window_id": "उद्यम सिंगल विंडो आईडी",
    "profile.role_tier": "पहुंच स्तर / भूमिका",
    "profile.registered_sector": "पंजीकृत उद्योग क्षेत्र",
    "profile.industrial_zone": "औद्योगिक क्षेत्र (MIDC)",
    "profile.active_badge": "सक्रिय सत्यापित प्रोफाइल",
    "profile.digi_badge": "डिजिलॉकर लिंक किया गया",
    "profile.edit_profile": "प्रोफाइल विवरण संपादित करें",
    "profile.save_changes": "परिवर्तन सहेजें",

    // Common UI Elements
    "common.cancel": "रद्द करें",
    "common.close": "बंद करें",
    "common.download": "डाउनलोड करें",
    "common.view": "देखें",
    "common.remove": "हटाएं",
    "common.submit": "जमा करें",
    "common.back": "पीछे",
    "common.next": "आगे",
    "common.loading": "लोड हो रहा है...",

    // Auth & Form
    "auth.sign_in": "साइन इन करें",
    "auth.sign_in_sub": "अपने डैशबोर्ड तक पहुंचने और स्वीकृतियों के लिए आवेदन करने हेतु।",
    "auth.investor_login": "निवेशक लॉगिन",
    "auth.officer_login": "विभागीय अधिकारी",
    "auth.email": "ईमेल पता",
    "auth.password": "पासवर्ड",
    "auth.forgot_password": "पासवर्ड भूल गए?",
    "auth.digilocker_login": "डिजिलॉकर खाते से लॉगिन करें",
    "auth.no_account": "खाता नहीं है?",
    "auth.signup_now": "अभी रजिस्टर करें",
    "auth.full_name": "अधिकृत हस्ताक्षरकर्ता का पूरा नाम",
    "auth.mobile": "मोबाइल नंबर",
    "auth.next": "आगे बढ़ें",
    "auth.back": "पीछे जाएं",
    "auth.step": "चरण",
    "auth.of": "/",
    "auth.complete_reg": "पंजीकरण पूर्ण करें",
    "auth.address": "अपना पता दर्ज करें",
    "auth.validate_pan": "पैन (PAN) नंबर सत्यापित करें",
    "auth.legal_entity": "अपनी इकाई का कानूनी प्रकार चुनें",
    "auth.login_title": "आरंभ पोर्टल में पुनः स्वागत है",
    "auth.login_sub": "अपने उद्यम क्रेडेंशियल से लॉगिन करें और स्वीकृतियां प्रबंधित करें।",
    "auth.signup_title": "अपना प्रोफाइल सेट करें",
    "auth.signup_sub": "महाराष्ट्र सिंगल विंडो पोर्टल पर अपने उद्योग को पंजीकृत करें।",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aarambh_language") as Language | null;
      if (saved && (saved === "en" || saved === "mr" || saved === "hi")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("aarambh_language", lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    // Fallback to English if key is missing in current language
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
