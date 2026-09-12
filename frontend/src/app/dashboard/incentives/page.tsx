"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BadgePercent,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  IndianRupee,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useNotificationStore } from "@/store/notificationStore";
import {
  evaluatePolicyIncentives,
  SECTOR_POLICY_REGISTRY,
  type CalculatedIncentives,
} from "@/data/policyRulesEngine";
import { Button } from "@/components/ui/button";

interface IncentiveScheme {
  id: string;
  title: string;
  authority: string;
  reference: string;
  category: string;
  summary: string;
  benefits: string[];
  criteria: string[];
}

interface SchemeMatch {
  eligible: boolean;
  conditional: boolean;
  pct: number;
  reasons: string[];
}

const SECTOR_LABEL_KEYS: Record<string, string> = {
  "food processing, restaurants & qsr": "agro_food_processing",
  "electric vehicle & clean tech": "ev_manufacturing",
  "fintech, it & digital services": "fintech",
  "logistics, warehousing & cold chain": "logistics_warehousing",
  "textiles, garments & spinning": "textiles_garmenting",
  "solar energy & biofuels": "green_energy_biofuel",
  "aerospace & defence": "aerospace_defence",
  "general manufacturing & chemicals": "general_manufacturing",
  "retail & commercial services": "services_retail",
  "specialty chemicals & bio-solvents": "general_manufacturing",
  "food processing": "agro_food_processing",
};

function resolveSectorKey(storeSector: string, industryType?: string): string {
  if (industryType && SECTOR_POLICY_REGISTRY[industryType]) return industryType;
  const direct = SECTOR_POLICY_REGISTRY[storeSector.trim().toLowerCase()];
  if (direct) return storeSector.trim().toLowerCase();
  const mapped = SECTOR_LABEL_KEYS[storeSector.trim().toLowerCase()];
  if (mapped && SECTOR_POLICY_REGISTRY[mapped]) return mapped;
  return "general_manufacturing";
}

// Structured catalogue of Maharashtra investment incentives.
// This is a clearly-labelled mock catalogue that maps onto the PSI 2019 / sector
// policy rules engine below; it is designed to be replaced by an API-backed
// scheme registry without changing the page structure.
const SCHEMES: IncentiveScheme[] = [
  {
    id: "PSI-CAPITAL-SUBSIDY",
    title: "Package Scheme of Incentives (PSI 2019) — Capital Subsidy",
    authority: "Directorate of Industries / Udyog Mitra",
    reference: "PSI-2019/CR 46/IND-8",
    category: "Capital Subsidy",
    summary:
      "Capital subsidy equal to a fixed percentage of Fixed Capital Investment (FCI), capped and disbursed over the eligibility period.",
    benefits: [
      "Admissible up to the taluka-category ceiling based on your location",
      "Thrust sectors receive an additional +20% ceiling and +2 eligibility years",
      "Vidarbha, Marathwada, Ratnagiri, Sindhudurg & Dhule get a special 80% floor",
    ],
    criteria: ["Project must be a New or Expansion industrial unit in Maharashtra", "Fixed Capital Investment recorded and verified by DIC/MIDC"],
  },
  {
    id: "SGST-IPS-REFUND",
    title: "Industrial Promotion Subsidy (SGST Refund)",
    authority: "Finance Department, Govt. of Maharashtra",
    reference: "PSI-2019/CR 46/IND-8 (Para 10)",
    category: "Fiscal Refund",
    summary:
      "Gross SGST refund on first sale of output products within Maharashtra after commencement of production.",
    benefits: ["Refund on Gross SGST on first sale within the State", "Available for the full eligibility period", "Offsets working capital pressure in early operating years"],
    criteria: ["Enterprise must be registered under GST in Maharashtra", "First sale should be within the State to claim refund"],
  },
  {
    id: "STAMP-DUTY-WAIVER",
    title: "Stamp Duty Waiver & Registration Fee Reimbursement",
    authority: "Maharashtra State / MIDC",
    reference: "PSI-2019/CR 46/IND-8 (Para 12)",
    category: "Capital Cost Relief",
    summary:
      "100% waiver of stamp duty on purchase/lease of land & building and Mortgage Deeds executed for term loans.",
    benefits: ["Reduces land acquisition cost at project inception", "Covers Loan Mortgage Deeds (up to 15 years)", "Directly reduces effective FCI outlay"],
    criteria: ["Unit must be eligible under the governing policy", "Applies on industrial land/building acquisition"],
  },
  {
    id: "POWER-TARIFF-SUBSIDY",
    title: "Power Tariff Subsidy",
    authority: "Maharashtra State Electricity Distribution Company (MSEDCL)",
    reference: "PSI-2019/CR 46/IND-8 (Para 11)",
    category: "Operating Cost Relief",
    summary:
      "Per-unit subsidy on electricity consumed for the first 3 years from commencement of commercial production.",
    benefits: ["Direct cash-flow benefit on monthly energy bills", "Higher rates in Vidarbha, Marathwada & Konkan regions", "Zone A units are generally not eligible"],
    criteria: ["Important Consumers connection under the relevant industrial category", "Subsidy claimed through quarterly reimbursement"],
  },
  {
    id: "ELECTRICITY-DUTY-EXEMPTION",
    title: "Electricity Duty Exemption",
    authority: "Maharashtra Energy Department",
    reference: "PSI-2019/CR 46/IND-8 (Para 11)",
    category: "Operating Cost Relief",
    summary:
      "100% exemption from electricity duty for the full eligibility period for units in Group C, D, D+ and aspirational/naxal/NO-INDUSTRY areas.",
    benefits: ["Full eligibility-period exemption", "Zero recurring duty on industrial consumption", "Stackable with the power tariff subsidy"],
    criteria: ["Unit must be located in an exempted taluka category", "Consumption must be captured on a separate industrial meter"],
  },
  {
    id: "INTEREST-SUBSIDY",
    title: "Interest Subsidy for MSME (Capital Subsidy in lieu of Interest)",
    authority: "District Industries Centre / SIDBI partner banks",
    reference: "PSI-2019/CR 46/IND-8 (Para 5.2)",
    category: "Financing Support",
    summary:
      "Interest subsidy on term loans for new MSME units in lieu of capital subsidy, supporting working capital viability.",
    benefits: ["5% per annum interest support on term loans", "Eases debt-service burden during ramp-up", "Automatically applied through banking channel"],
    criteria: ["Unit must be classified as Micro, Small or Medium under MSME definition", "Term loan financed by a notified bank/financial institution"],
  },
  {
    id: "MEGA-PROJECT-PACKAGE",
    title: "Mega & Ultra-Mega Project Package",
    authority: "Industries, Mines & Energy Department",
    reference: "PSI-2019/CR 46/IND-8 (Para 7)",
    category: "Anchor / Large Investment",
    summary:
      "Special fiscal package for large anchor investments with higher ceiling, land rebates and fast-track facilitation.",
    benefits: ["Higher capital subsidy ceilings for Mega (₹1000–₹4000 Cr FCI) projects", "MIDC land premium concession & power infrastructure support", "Single-window waiver committee for extra-concessional benefits"],
    criteria: ["FCI and/or direct employment at or above zone-specific Mega threshold", "Capable of achieving commercial production within prescribed period"],
  },
  {
    id: "SECTOR-POLICY-BOOSTER",
    title: "Sector Policy Booster (Thrust Sector Provisions)",
    authority: "Government of Maharashtra (Policy GR)",
    reference: "Sector governing policy GR",
    category: "Sector-Targeted",
    summary:
      "Sector-specific fiscal and regulatory benefits under the governing policy (EV 2021, Logistics 2024, Textile 2018, FinTech 2018, Aerospace & Defence 2018).",
    benefits: [
      "+20% fiscal ceiling and +2 eligibility years for thrust manufacturing sectors",
      "Sector GR references and condition-wise special provisions",
      "Fast-track consents for eligible categories (e.g., Green category MPCB)",
    ],
    criteria: ["Unit must be classified in the identified thrust sector", "Benefits follow the governing policy GR conditions"],
  },
  {
    id: "MSME-STARTUP-SUPPORT",
    title: "MSME & FinTech / Startup Support Reimbursements",
    authority: "Directorate of Industries & IT Department",
    reference: "FinTech 2018 / MSME policies",
    category: "Startup & MSME",
    summary:
      "Operational reimbursements for startup/MSME units — internet, electricity, cloud hosting, GST and co-working rent.",
    benefits: ["Internet & electricity reimbursement up to ₹3 Lakh/yr for 3 years", "Cloud hosting & co-working rent reimbursement", "SGST full reimbursement for startups with turnover ≤ ₹5 Cr"],
    criteria: ["Where applicable: startup turnover ≤ ₹25 Cr", "MSME or notified FinTech/startup classification"],
  },
  {
    id: "GREEN-SUSTAINABILITY",
    title: "Green & Sustainability Assistance",
    authority: "MPCB / Maharashtra State",
    reference: "PSI-2019/CR 46/IND-8 (Para 13)",
    category: "Sustainability",
    summary:
      "Capital subsidy assistance for waste management, effluent treatment (ETP/STP), water conservation and green-certified manufacturing.",
    benefits: ["Covers ETP/STP and zero-liquid-discharge setups", "ZLD schemes eligible at higher rates", "Supports green manufacturing certification"],
    criteria: ["Unit must implement the identified green asset", "Compliance with MPCB consent conditions"],
  },
];

function matchScheme(scheme: IncentiveScheme, inc: CalculatedIncentives): SchemeMatch {
  switch (scheme.id) {
    case "PSI-CAPITAL-SUBSIDY":
      return inc.fciCeilingPct > 0
        ? {
            eligible: true,
            conditional: false,
            pct: 100,
            reasons: [`FCI ceiling of ${inc.fciCeilingPct}% applies (up to ₹${inc.maxIncentiveAmountCr} Cr over ${inc.eligibilityYears} years).`],
          }
        : {
            eligible: false,
            conditional: true,
            pct: 55,
            reasons: ["Zone A units need Large Scale investment (FCI > ₹50 Cr) to start earning a capital subsidy ceiling."],
          };
    case "SGST-IPS-REFUND":
      return {
        eligible: true,
        conditional: false,
        pct: 100,
        reasons: [`Industrial Promotion Subsidy refund of ${inc.sgstIpsRefundPct}% Gross SGST on first sale applies.`],
      };
    case "STAMP-DUTY-WAIVER":
      return inc.stampDutyWaiverPct > 0
        ? { eligible: true, conditional: false, pct: 100, reasons: [`Up to ${inc.stampDutyWaiverPct}% stamp duty waiver is available.`] }
        : { eligible: false, conditional: true, pct: 40, reasons: ["Zone A/B units are outside the stamp duty waiver scope for this policy."] };
    case "POWER-TARIFF-SUBSIDY":
      return inc.powerSubsidyRatePerUnit > 0
        ? { eligible: true, conditional: false, pct: 100, reasons: [`Power tariff subsidy of ₹${inc.powerSubsidyRatePerUnit}/unit for 3 years.`] }
        : { eligible: false, conditional: true, pct: 40, reasons: ["Zone A units are not eligible for the power tariff subsidy."] };
    case "ELECTRICITY-DUTY-EXEMPTION":
      return inc.electricityDutyExempt
        ? { eligible: true, conditional: false, pct: 100, reasons: ["100% electricity duty exemption applies for the full eligibility period."] }
        : { eligible: false, conditional: true, pct: 40, reasons: ["No electricity duty exemption for Zone A/B category talukas."] };
    case "INTEREST-SUBSIDY":
      return ["MICRO", "SMALL", "MEDIUM"].includes(inc.scale)
        ? { eligible: true, conditional: false, pct: 100, reasons: [`MSME interest subsidy of ${inc.interestSubsidyPct}% on term loans is available.`] }
        : { eligible: false, conditional: true, pct: 60, reasons: ["Interest subsidy targets MSME scale; Large/capital-heavy projects may prefer capital subsidy instead."] };
    case "MEGA-PROJECT-PACKAGE":
      return inc.scale === "MEGA" || inc.scale === "ULTRA_MEGA"
        ? { eligible: true, conditional: false, pct: 100, reasons: [`Project scales as ${inc.scale} — special package applies.`] }
        : {
            eligible: false,
            conditional: true,
            pct: 35,
            reasons: [`Not yet at Mega threshold — ${inc.scale} scale applies (${inc.scaleCriteriaNotes}).`],
          };
    case "SECTOR-POLICY-BOOSTER":
      return inc.isThrustSector
        ? { eligible: true, conditional: false, pct: 100, reasons: [`Governing ${inc.governingPolicy} GR applies — ${inc.grReference}.`] }
        : { eligible: false, conditional: false, pct: 20, reasons: ["Sector is not currently ranked as a thrust sector under the governing policies."] };
    case "MSME-STARTUP-SUPPORT":
      return inc.governingPolicy === "FINTECH_POLICY_2018" || ["MICRO", "SMALL", "MEDIUM"].includes(inc.scale)
        ? { eligible: true, conditional: false, pct: 100, reasons: ["Eligible as MSME / FinTech startup for reimbursements."] }
        : { eligible: false, conditional: true, pct: 45, reasons: ["Considered for startup/MSME classification only."] };
    case "GREEN-SUSTAINABILITY":
      return { eligible: true, conditional: false, pct: 100, reasons: ["Green & sustainability assistance is available across eligible manufacturing categories."] };
    default:
      return { eligible: true, conditional: false, pct: 70, reasons: ["Eligibility to be confirmed by the implementing authority."] };
  }
}

function formatMoneyCr(amount: number): string {
  return `₹${Number(amount).toFixed(2)} Cr`;
}

interface AppliedIncentive {
  ref: string;
  schemeTitle: string;
  date: string;
  status: string;
}

function readStoredApplications(): AppliedIncentive[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("aarambh_incentive_applications");
    if (!raw) return [];
    return JSON.parse(raw) as AppliedIncentive[];
  } catch (e) {
    return [];
  }
}

export default function IncentivesPage() {
  usePageTitle("Incentives & Schemes | AARAMBH");

  const {
    district: storeDistrict,
    sector: storeSector,
    capexCr,
    powerLoadKva,
    workforceSize,
    applicableIncentives,
    isAssessed,
    masterCAF,
  } = useEnterpriseStore();

  const sectorKey = useMemo(
    () => resolveSectorKey(storeSector, masterCAF?.projectSpecs?.industryType),
    [storeSector, masterCAF?.projectSpecs?.industryType]
  );

  const district = storeDistrict || masterCAF?.locationDetails?.district || "Pune";
  const financialCapexCr = useMemo(() => {
    if (capexCr > 0) return capexCr;
    const inr = masterCAF?.projectSpecs?.capitalInvestmentInr || 0;
    return inr > 0 ? Number((inr / 1e7).toFixed(2)) : 0;
  }, [capexCr, masterCAF?.projectSpecs?.capitalInvestmentInr]);
  const powerKw = powerLoadKva || masterCAF?.projectSpecs?.powerRequirementKw || 0;
  const workforce = workforceSize || masterCAF?.projectSpecs?.totalOccupants || 0;

  const calculatedIncentives = useMemo<CalculatedIncentives>(
    () =>
      evaluatePolicyIncentives({
        sector: sectorKey,
        district,
        capexCr: financialCapexCr,
        workforceSize: workforce,
        powerLoadKw: powerKw,
      }),
    [sectorKey, district, financialCapexCr, workforce, powerKw]
  );

  const sectorRule = SECTOR_POLICY_REGISTRY[sectorKey] || SECTOR_POLICY_REGISTRY.general_manufacturing;

  const matchedSchemes = useMemo(
    () => SCHEMES.map((s) => ({ scheme: s, match: matchScheme(s, calculatedIncentives) })),
    [calculatedIncentives]
  );

  const [selectedScheme, setSelectedScheme] = useState<IncentiveScheme | null>(null);
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<AppliedIncentive[]>([]);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setApplications(readStoredApplications());
  }, []);

  const persistApplications = (list: AppliedIncentive[]) => {
    setApplications(list);
    try {
      window.localStorage.setItem("aarambh_incentive_applications", JSON.stringify(list));
    } catch (e) {
      // storage may be unavailable in incognito — non-fatal
    }
  };

  const handleConfirmApply = () => {
    if (!selectedScheme) return;
    setApplying(true);
    window.setTimeout(() => {
      const year = new Date().getFullYear();
      const seq = String(Math.floor(1000 + Math.random() * 9000));
      const ref = `INC-${year}-${seq}`;
      const entry: AppliedIncentive = {
        ref,
        schemeTitle: selectedScheme.title,
        date: new Date().toISOString().slice(0, 10),
        status: "Under Review",
      };
      persistApplications([entry, ...applications]);
      useNotificationStore.getState().addNotification({
        type: "incentive",
        title: "Incentive application lodged",
        message: `${selectedScheme.title} — ref ${ref}. The District Industries Centre (DIC) will review your application.`,
        severity: "success",
        target: "/dashboard/incentives",
      });
      setSelectedScheme(null);
      setApplying(false);
    }, 450);
  };

  const openReceipt = (app: AppliedIncentive) => {
    const win = window.open("", "_blank", "width=640,height=760");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Incentive Receipt ${app.ref}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;margin:40px;color:#16060E}
      .gov{border:2px solid #16060E;padding:24px;border-radius:12px}
      h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;margin:0 0 16px;color:#9B2A48;font-weight:600}
      .row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px dashed #d6c6c0}
      .row span:first-child{color:#6b5b55}.badge{background:#9B2A48;color:#fff;display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700}
      .foot{margin-top:24px;font-size:11px;color:#6b5b55;line-height:1.6}
    </style></head><body><div class="gov">
      <span class="badge">Maharashtra Single Window — AARAMBH</span>
      <h1>Incentive Application Receipt</h1>
      <h2>${app.schemeTitle}</h2>
      <div class="row"><span>Application Reference</span><span>${app.ref}</span></div>
      <div class="row"><span>Date of Lodging</span><span>${app.date}</span></div>
      <div class="row"><span>Scheme</span><span>${app.schemeTitle}</span></div>
      <div class="row"><span>District</span><span>${district}</span></div>
      <div class="row"><span>Status</span><span>${app.status}</span></div>
      <p class="foot">This is a system-generated acknowledgement from the AARAMBH single-window platform. Sanction and disbursement are subject to verification by the District Industries Centre / Udyog Mitra under the governing policy GR. For status updates, visit your AARAMBH dashboard.</p>
    </div><script>window.print();</script></body></html>`);
    win.document.close();
    setDownloadNotice(`Receipt for ${app.ref} opened in a new tab for printing.`);
  };

  const snapshotCards = [
    {
      icon: Banknote,
      label: "SGST IPS Refund",
      value: `${calculatedIncentives.sgstIpsRefundPct}%`,
      note: "Gross SGST refund on first sales",
    },
    {
      icon: Clock,
      label: "Eligibility Tenure",
      value: `${calculatedIncentives.eligibilityYears} Years`,
      note: `Max ${formatMoneyCr(calculatedIncentives.annualDisbursementCapCr)} / Year`,
    },
    {
      icon: Zap,
      label: "Power Tariff Subsidy",
      value: `₹${calculatedIncentives.powerSubsidyRatePerUnit} / unit`,
      note: "For 3 years from commercial prod.",
    },
    {
      icon: BadgePercent,
      label: "Stamp & Electricity Duty",
      value: `${calculatedIncentives.stampDutyWaiverPct}% Waiver`,
      note: calculatedIncentives.electricityDutyExempt ? "100% Electricity Duty Exemption" : "Standard duty",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Policy & Incentive Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#FED17A]/60 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#9B2A48] text-white text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5 text-[#FFCA7C]" />
              <span>PS 26130 Feature — Incentives &amp; Government Schemes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#16060E] tracking-tight">
              Your Incentive &amp; Eligibility Dashboard
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Discover Maharashtra investment incentives matched against your enterprise profile, then lodge applications from one place.
            </p>
            <p className="text-xs text-slate-500 mt-2 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>
                {district} • {sectorRule.displayName} • FCI {formatMoneyCr(financialCapexCr)} • {powerKw} kW load • {workforce} employees
              </span>
            </p>
          </div>

          <div className="text-right shrink-0 bg-white p-4 rounded-xl border border-[#FED17A] shadow-xs">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Capital Subsidy Cap</p>
            <p className="text-2xl sm:text-3xl font-black text-[#9B2A48]">{formatMoneyCr(calculatedIncentives.maxIncentiveAmountCr)}</p>
            <p className="text-[11px] font-bold text-[#FE7251]">{calculatedIncentives.fciCeilingPct}% of Fixed Capital Investment</p>
          </div>
        </div>

        {!isAssessed && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start space-x-2 flex-1">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Complete your KYA assessment for a personalised snapshot</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Figures below are indicative defaults. Running Know Your Approvals locks your sector &amp; location profile and generates your statutory clearance checklist.
                </p>
              </div>
            </div>
            <Link href="/dashboard/kya" className="shrink-0 px-4 py-2 rounded-lg bg-[#FE7251] hover:bg-[#E85E3E] text-white font-bold text-xs transition-colors shadow-2xs text-center">
              Run KYA Assessment
            </Link>
          </div>
        )}

        {/* 4 Financial Subsidies Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {snapshotCards.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-white border border-[#F0E5E0] shadow-xs">
                <div className="flex items-center space-x-2 text-[#9B2A48] mb-1">
                  <IconComp className="w-4 h-4 text-[#FE7251]" />
                  <span className="text-xs font-bold uppercase">{card.label}</span>
                </div>
                <p className="text-xl font-black text-[#16060E]">{card.value}</p>
                <p className="text-[10px] text-slate-500">{card.note}</p>
              </div>
            );
          })}
        </div>

        {/* Special Policy Benefits List */}
        {calculatedIncentives.specialPerks && calculatedIncentives.specialPerks.length > 0 && (
          <div className="p-4 bg-[#FFF7F0] rounded-xl border border-[#FED17A]">
            <h4 className="text-xs font-bold text-[#9B2A48] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FE7251]" />
              <span>Special Sector Provisions ({calculatedIncentives.governingPolicy} • {calculatedIncentives.grReference})</span>
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
              {calculatedIncentives.specialPerks.slice(0, 6).map((perk, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9B2A48] mt-0.5 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* KYA-identified incentives */}
        {isAssessed && applicableIncentives.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">KYA-identified:</span>
            {applicableIncentives.map((label, idx) => (
              <Link
                key={idx}
                href="/dashboard/kya"
                className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scheme Catalogue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-[#16060E] tracking-tight uppercase">Scheme Catalogue</h2>
          <span className="text-[11px] text-slate-500">{matchedSchemes.length} Maharashtra schemes evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchedSchemes.map(({ scheme, match }) => (
            <div key={scheme.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2 text-[#9B2A48]">
                  <Building2 className="w-4 h-4 text-[#FE7251]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{scheme.category}</span>
                </div>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    match.eligible
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : match.conditional
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${match.eligible ? "bg-emerald-500" : match.conditional ? "bg-amber-500" : "bg-slate-400"}`} />
                  {match.eligible ? "Eligible" : match.conditional ? "Conditional" : "Not Eligible"} • {match.pct}%
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{scheme.title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {scheme.authority} • {scheme.reference}
              </p>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{scheme.summary}</p>

              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B2A48]">Why it applies to you</p>
                <ul className="space-y-1">
                  {match.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{scheme.benefits.length} benefits</span>
                <Button size="sm" onClick={() => setSelectedScheme(scheme)} disabled={!match.eligible}>
                  {match.eligible ? "Lodge Application" : "View Criteria"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Incentive Applications */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-[#16060E] tracking-tight uppercase">My Incentive Applications</h2>
          <span className="text-[11px] text-slate-500">{applications.length} lodged</span>
        </div>

        {applications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No incentive applications lodged yet. Choose a scheme above to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {applications.map((app) => (
              <li key={app.ref} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF7F0] border border-[#FED17A] text-[#9B2A48] flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{app.schemeTitle}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {app.ref} • {app.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                    {app.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => openReceipt(app)}
                    className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-[#9B2A48] hover:text-[#FE7251] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start space-x-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-[#FE7251] shrink-0 mt-0.5" />
        <p>
          Indicative eligibility computed from the PSI 2019 / sector-policy rules engine against your declared profile. Final sanction is
          subject to verification and assessment by the District Industries Centre, Udyog Mitra and the implementing departments.
        </p>
      </div>

      {/* Lodge Application Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !applying && setSelectedScheme(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative space-y-3 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedScheme(null)}
              disabled={applying}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-semibold text-[#FE7251] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Higher Amount — PSI 2019</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{selectedScheme.title}</h3>
            <p className="text-[11px] text-slate-500">{selectedScheme.authority} • {selectedScheme.reference}</p>

            <p className="text-xs text-slate-600">{selectedScheme.summary}</p>

            <div className="p-3 rounded-lg bg-[#FFF7F0] border border-[#FED17A] text-xs space-y-1">
              <p className="font-bold text-[#9B2A48]">Enterprise snapshot</p>
              <p className="text-slate-700">
                {district}, {sectorRule.displayName} • Category: {calculatedIncentives.category} ({calculatedIncentives.scale})
              </p>
              <p className="text-slate-700">
                Capital Subsidy: {formatMoneyCr(calculatedIncentives.maxIncentiveAmountCr)} over {calculatedIncentives.eligibilityYears} years
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedScheme(null)} disabled={applying}>
                Cancel
              </Button>
              <Button onClick={handleConfirmApply} disabled={applying}>
                {applying ? "Lodging…" : "Confirm & Lodge Application"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-3 rounded-lg bg-emerald-900 text-emerald-100 text-xs shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadNotice}</span>
          <button type="button" onClick={() => setDownloadNotice(null)} className="ml-2 text-emerald-300 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}