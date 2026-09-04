import React, { useState } from "react";
import {
  Search, FolderCheck, GitBranch, IndianRupee, BookOpen, ClipboardList,
  MessageSquareText, ArrowRight, ChevronRight, LogIn, Building2, MapPin,
  Cpu, Shirt, Pill, Factory, Leaf, Mountain, Landmark, Plane,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

/* ---------- tokens ---------- */
const INDIGO = "#132A52";
const INDIGO_DEEP = "#0A1B38";
const INK = "#13151C";
const PAPER = "#F7F3EA";
const LINE = "#E4DFCF";
const SAFFRON = "#E8720C";
const TEAL = "#0E8F6F";
const MARIGOLD = "#D6A419";

/* ---------- content ---------- */
const portalItems = [
  { icon: Search, name: "Know Your Approvals", blurb: "Answer a few questions about your project and see every clearance you'll need, based on sector, size and location.", color: SAFFRON },
  { icon: FolderCheck, name: "Document Locker", blurb: "Upload once. Your documents and the details inside them are ready to attach wherever they're needed next.", color: TEAL },
  { icon: GitBranch, name: "Application Tracker", blurb: "Follow every application you've filed, with live status and the statutory deadline attached to each.", color: MARIGOLD },
  { icon: IndianRupee, name: "Subsidy & Scheme Finder", blurb: "Check the incentives your project qualifies for under the Maharashtra Industrial Policy 2025.", color: INDIGO },
  { icon: BookOpen, name: "Acts & Gazettes", blurb: "Browse the rules, notifications and gazette entries behind every approval on the portal.", color: TEAL },
  { icon: ClipboardList, name: "Officer Desk", blurb: "A separate space for department officials to review, inspect and certify applications.", color: SAFFRON },
];

const marqueeItems = [
  "Know Your Approvals", "Document Locker", "Application Tracker", "Subsidy & Scheme Finder",
  "Acts & Gazettes", "Officer Desk", "Grievance & Support", "Certificate Downloads",
];

const sectors = [
  { icon: Cpu, name: "IT & Electronics", days: 28 },
  { icon: Shirt, name: "Textile & Garments", days: 35 },
  { icon: Pill, name: "Pharma & Biotech", days: 42 },
  { icon: Factory, name: "Auto Components", days: 30 },
  { icon: Leaf, name: "Food Processing", days: 25 },
  { icon: Mountain, name: "Mining & Minerals", days: 50 },
  { icon: Landmark, name: "Tourism & Hospitality", days: 20 },
  { icon: Plane, name: "Logistics & Warehousing", days: 22 },
];

const cities = [
  { name: "Mumbai", x: 66, y: 168, sector: "Logistics & Warehousing" },
  { name: "Pune", x: 152, y: 258, sector: "IT & Electronics" },
  { name: "Nashik", x: 112, y: 108, sector: "Food Processing" },
  { name: "Nagpur", x: 352, y: 92, sector: "Mining & Minerals" },
  { name: "Chh. Sambhajinagar", x: 232, y: 214, sector: "Auto Components" },
  { name: "Solapur", x: 246, y: 344, sector: "Textile & Garments" },
];

const trendData = [
  { month: "Jan", applications: 180 },
  { month: "Feb", applications: 210 },
  { month: "Mar", applications: 260 },
  { month: "Apr", applications: 300 },
  { month: "May", applications: 340 },
  { month: "Jun", applications: 392 },
  { month: "Jul", applications: 430 },
  { month: "Aug", applications: 471 },
];

/* low-poly Maharashtra silhouette, viewBox 0 0 420 460 */
const MH_PATH = "M130,20 L230,15 L330,40 L390,70 L385,140 L340,190 L300,230 L320,280 L290,330 L240,360 L190,400 L140,430 L100,390 L70,340 L55,280 L50,220 L60,160 L90,100 L100,50 Z";

function StatBlock({ value, label }) {
  return (
    <div style={{ borderLeft: "2px solid rgba(255,255,255,0.25)" }} className="pl-4">
      <div className="text-3xl md:text-4xl font-semibold tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.68)" }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: INK, color: "white", padding: "8px 12px", borderRadius: 4, fontSize: 12 }}>
      <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{payload[0].value}{payload[0].dataKey === "days" ? " days avg" : " applications"}</div>
    </div>
  );
};

export default function AarambhLanding() {
  const [sector, setSector] = useState(sectors[0].name);
  const activeCity = cities.find((c) => c.sector === sector) || cities[0];

  return (
    <div style={{ background: PAPER, color: INK, fontFamily: "'Inter', sans-serif" }} className="min-h-screen w-full overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; width: max-content; animation: marquee 32s linear infinite; }

        @keyframes gridDrift { from { background-position: 0 0, 0 0; } to { background-position: 72px 72px, 72px 72px; } }
        .grid-pattern { animation: gridDrift 16s linear infinite; }

        @keyframes cardSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .card-track { display: flex; width: max-content; animation: cardSlide 38s linear infinite; }
        .card-track:hover { animation-play-state: paused; }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-16px) rotate(var(--r, 0deg)); }
        }
        .float-card { animation: floatCard 7s ease-in-out infinite; }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
          70% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        .pulse-dot { animation: pulseDot 2.4s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track, .grid-pattern, .float-card, .pulse-dot { animation: none !important; }
        }
      `}</style>

      {/* Utility strip */}
      <div style={{ background: INK }} className="text-xs text-white/70">
        <div className="max-w-6xl mx-auto px-6 py-1.5 flex items-center justify-between">
          <span>Smart India Hackathon 2026 · Problem Statement 26130</span>
          <span className="hidden sm:inline">Team Cryptonites</span>
        </div>
      </div>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${LINE}` }} className="bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div style={{ background: INDIGO }} className="w-8 h-8 rounded flex items-center justify-center">
              <Building2 size={18} className="text-white" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-lg font-semibold tracking-tight">AARAMBH</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: INK }}>
            <a href="#find">On the portal</a>
            <a href="#map">Maharashtra map</a>
            <a href="#progress">Live progress</a>
            <a href="#">Track application</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5" style={{ color: INDIGO }}>
              <LogIn size={15} /> Officer login
            </button>
            <button style={{ background: SAFFRON }} className="text-white text-sm font-semibold px-4 py-2 rounded flex items-center gap-1.5">
              Get started <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: `linear-gradient(155deg, ${INDIGO} 0%, ${INDIGO_DEEP} 70%)`, position: "relative", overflow: "hidden" }} className="text-white">
        {/* drifting blueprint-grid pattern */}
        <div
          className="grid-pattern"
          style={{
            position: "absolute", inset: 0, opacity: 0.5,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 72px)",
          }}
        />
        {/* floating background cards */}
        <div style={{ "--r": "-6deg" }} className="float-card hidden md:block absolute left-8 top-24 border border-white/15 rounded px-3 py-2 text-[11px] text-white/40" >Subsidy Finder</div>
        <div style={{ "--r": "4deg", animationDelay: "1.2s" }} className="float-card hidden md:block absolute left-24 bottom-16 border border-white/15 rounded px-3 py-2 text-[11px] text-white/40">Document Locker</div>
        <div style={{ "--r": "-3deg", animationDelay: "2.4s" }} className="float-card hidden lg:block absolute right-[26rem] top-16 border border-white/15 rounded px-3 py-2 text-[11px] text-white/40">SLA Tracker</div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-14 relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full mb-6" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <span style={{ background: SAFFRON }} className="w-1.5 h-1.5 rounded-full" />
              Built for industrial approvals in Maharashtra
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", maxWidth: "17ch" }} className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
              One portal for every industrial approval your business needs
            </h1>
            <p style={{ maxWidth: "56ch", color: "rgba(255,255,255,0.78)" }} className="mt-5 text-base md:text-lg leading-relaxed">
              Find the approvals that apply to you, keep every document in one place, and watch each application move toward its deadline — all from a single window.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button style={{ background: SAFFRON }} className="text-white font-semibold px-5 py-3 rounded flex items-center gap-2 text-sm">
                Start Know Your Approvals <ArrowRight size={16} />
              </button>
              <button style={{ border: "1px solid rgba(255,255,255,0.3)" }} className="font-medium px-5 py-3 rounded text-sm text-white">
                Track an application
              </button>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 md:gap-10">
              <StatBlock value="40+" label="Approvals mapped" />
              <StatBlock value="12" label="Departments linked" />
              <StatBlock value="471" label="Applications live this month" />
            </div>
          </div>

          {/* mini map preview */}
          <div className="relative hidden sm:flex flex-col items-center justify-center h-full">
            <svg viewBox="0 0 420 460" className="w-full h-auto max-h-[440px]">
              <path d={MH_PATH} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              {cities.map((c) => (
                <g key={c.name}>
                  <circle cx={c.x} cy={c.y} r="4" fill={SAFFRON} className="pulse-dot" />
                  <text x={c.x + 9} y={c.y + 4} fontSize="11" fill="rgba(255,255,255,0.75)">{c.name}</text>
                </g>
              ))}
            </svg>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-white/45">
              <span style={{ background: SAFFRON }} className="w-2 h-2 rounded-full" />
              Live industrial hubs across the state
            </div>
          </div>
        </div>
      </section>

      {/* Sliding marquee of what's on the portal */}
      <div style={{ background: MARIGOLD }} className="py-3 overflow-hidden">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ borderColor: "rgba(19,21,28,0.25)" }} className="mx-3 shrink-0 border rounded-full px-4 py-1.5 text-sm font-medium text-[#13151C] bg-white/25 whitespace-nowrap">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Live progress / graphs */}
      <section id="progress" style={{ background: "white", borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-xl mb-10">
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl md:text-3xl font-semibold tracking-tight">See progress at a glance</h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#4B5566" }}>
              The portal keeps a running count of applications moving through the system, and how approval time compares across sectors.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div style={{ border: `1px solid ${LINE}` }} className="p-5 rounded-sm">
              <h3 className="font-semibold text-[15px] mb-3">Applications tracked this year</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="fillTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={TEAL} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={LINE} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="applications" stroke={TEAL} strokeWidth={2} fill="url(#fillTeal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ border: `1px solid ${LINE}` }} className="p-5 rounded-sm">
              <h3 className="font-semibold text-[15px] mb-3">Average approval time by sector</h3>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectors}>
                    <CartesianGrid stroke={LINE} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="days" radius={[3, 3, 0, 0]}>
                      {sectors.map((s) => (
                        <Cell key={s.name} fill={s.name === sector ? SAFFRON : TEAL} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maharashtra map */}
      <section id="map" style={{ background: INDIGO }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl md:text-3xl font-semibold tracking-tight">Where projects are coming from</h2>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Pick a sector to see which hub it's concentrated around.
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {sectors.map(({ icon: Icon, name }) => {
                const active = sector === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSector(name)}
                    style={{
                      background: active ? "white" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${active ? "white" : "rgba(255,255,255,0.18)"}`,
                      color: active ? INDIGO : "white",
                    }}
                    className="flex flex-col items-start gap-1.5 p-2.5 rounded-sm text-left transition-colors"
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    <span className="text-[11px] font-medium leading-snug">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <svg viewBox="0 0 420 460" className="w-full h-auto max-h-[380px]">
              <path d={MH_PATH} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              {cities.map((c) => {
                const isActive = c.name === activeCity.name;
                return (
                  <g key={c.name}>
                    <circle cx={c.x} cy={c.y} r={isActive ? 7 : 4} fill={isActive ? SAFFRON : "rgba(255,255,255,0.55)"} className={isActive ? "pulse-dot" : ""} />
                    <text x={c.x + 10} y={c.y + 4} fontSize="12" fontWeight={isActive ? 600 : 400} fill={isActive ? "white" : "rgba(255,255,255,0.55)"}>{c.name}</text>
                  </g>
                );
              })}
            </svg>
            <p className="text-xs text-white/45 mt-2">Illustrative map, not to scale.</p>
          </div>
        </div>
      </section>

      {/* Find on the portal */}
      <section id="find" style={{ position: "relative" }} className="max-w-6xl mx-auto px-6 py-16">
        {/* crossword-style corner motif */}
        <svg width="120" height="120" className="hidden md:block absolute -top-2 right-6 opacity-[0.08]" viewBox="0 0 120 120">
          {[0,1,2,3,4,5].map((row) =>
            [0,1,2,3,4,5].map((col) => {
              const filled = (row * 7 + col * 3) % 5 === 0;
              return <rect key={`${row}-${col}`} x={col * 20} y={row * 20} width="19" height="19" fill={filled ? INK : "none"} stroke={INK} strokeWidth="0.5" />;
            })
          )}
        </svg>

        <div className="max-w-xl mb-10">
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl md:text-3xl font-semibold tracking-tight">Find on the portal</h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#4B5566" }}>
            A short list of where to go for what you need.
          </p>
        </div>
        <div className="overflow-hidden -mx-6 px-6">
          <div className="card-track">
            {[...portalItems, ...portalItems].map(({ icon: Icon, name, blurb, color }, i) => (
              <div
                key={`${name}-${i}`}
                style={{ border: `1px solid ${LINE}`, borderTop: `3px solid ${color}`, width: "280px" }}
                className="bg-white p-5 rounded-sm mr-4 shrink-0"
              >
                <Icon size={19} style={{ color }} strokeWidth={1.75} />
                <h3 className="mt-3 font-semibold text-[15px]">{name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#5A6478" }}>{blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold tracking-tight">Know your approvals in under five minutes</h2>
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "#4B5566" }}>Answer a few questions about your project — we'll build the checklist.</p>
        </div>
        <button style={{ background: SAFFRON }} className="text-white font-semibold px-5 py-3 rounded flex items-center gap-2 text-sm shrink-0">
          Start now <ChevronRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: INK, borderTop: "1px solid rgba(255,255,255,0.08)" }} className="text-white/70">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Building2 size={16} /> AARAMBH
            </div>
            <p className="mt-3 leading-relaxed text-white/50 text-[13px]">
              Built for SIH 2026 · Problem Statement 26130 — one portal for industrial approvals, compliance and government support in Maharashtra.
            </p>
          </div>
          <div>
            <div className="text-white font-medium text-[13px] mb-3">On the portal</div>
            <ul className="space-y-2 text-[13px]">
              <li>Know Your Approvals</li>
              <li>Document Locker</li>
              <li>Application Tracker</li>
              <li>Subsidy & Scheme Finder</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-medium text-[13px] mb-3">Team Cryptonites</div>
            <div className="flex items-center gap-2 text-[13px]"><MapPin size={13} /> Jabalpur, Madhya Pradesh</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
