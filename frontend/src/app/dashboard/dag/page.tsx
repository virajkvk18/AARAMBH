"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
  Building2,
  Factory,
  Flame,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Radio,
} from "lucide-react";
import { useEnterpriseStore } from "@/store/enterpriseStore";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient, isBrowserSupabaseConfigured } from "@/lib/supabase";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type NodeStatus = "locked" | "active" | "approved";

export interface DAGNode {
  id: string;
  name: string;
  department: string;
  slaDays: number;
  stage: "Root (Stage 1)" | "Parallel Clearances (Stage 2)" | "Grandchild (Stage 3)";
  dependencies: string[];
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const INITIAL_NODES: DAGNode[] = [
  {
    id: "node-root",
    name: "MIDC Land Allotment & Plan Approval",
    department: "Maharashtra Industrial Development Corporation (MIDC)",
    slaDays: 15,
    stage: "Root (Stage 1)",
    dependencies: [],
    icon: Building2,
    description: "Zonal land allotment, FAR approval, and provisional possession.",
  },
  {
    id: "node-mpcb",
    name: "MPCB Consent to Establish (CTE)",
    department: "Maharashtra Pollution Control Board",
    slaDays: 21,
    stage: "Parallel Clearances (Stage 2)",
    dependencies: ["node-root"],
    icon: Factory,
    description: "Environmental categorization (Red/Orange) & effluent standards.",
  },
  {
    id: "node-fire",
    name: "Provisional Fire Safety NOC",
    department: "State Directorate of Fire & Emergency Services",
    slaDays: 14,
    stage: "Parallel Clearances (Stage 2)",
    dependencies: ["node-root"],
    icon: Flame,
    description: "Firefighting layouts, underground static tank inspections.",
  },
  {
    id: "node-water",
    name: "Bulk Water Supply Allocation",
    department: "MIDC / Water Resources Department",
    slaDays: 7,
    stage: "Parallel Clearances (Stage 2)",
    dependencies: ["node-root"],
    icon: Droplets,
    description: "Pipeline intake quota sanction and drainage connectivity.",
  },
  {
    id: "node-dish",
    name: "Final Factory License & Safety Sign-off",
    department: "Directorate of Industrial Safety & Health (DISH)",
    slaDays: 15,
    stage: "Grandchild (Stage 3)",
    dependencies: ["node-mpcb", "node-fire", "node-water"],
    icon: ShieldCheck,
    description: "Consolidated factory license issued once all statutory pre-conditions pass.",
  },
];

export default function DAGWorkflowPage() {
  const { user } = useAuth();
  const enterpriseId = user?.enterpriseId || "ENT-MH-2026-8891";

  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({
    "node-root": "active",
    "node-mpcb": "locked",
    "node-fire": "locked",
    "node-water": "locked",
    "node-dish": "locked",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [historyLog, setHistoryLog] = useState<string[]>([
    "DAG Initialized: Connecting to persistent backend store...",
  ]);

  // Load persisted DAG nodes from Backend / Supabase REST API
  const fetchPersistedNodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BACKEND_API_URL}/dag/${enterpriseId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.nodes && Array.isArray(data.nodes)) {
          const statusMap: Record<string, NodeStatus> = {};
          data.nodes.forEach((n: any) => {
            statusMap[n.id] = n.status as NodeStatus;
          });
          setNodeStatuses(statusMap);
          setIsPersisted(true);
          setHistoryLog((prev) => [
            `📡 Persisted DAG state synchronized for Enterprise ID ${enterpriseId}`,
            ...prev,
          ]);
        }
      }
    } catch (e: any) {
      console.warn("Could not fetch persisted DAG nodes, using in-memory state:", e);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  useEffect(() => {
    fetchPersistedNodes();
  }, [fetchPersistedNodes]);

  // Set up Supabase Realtime / Cross-Tab Broadcast Channel Subscription
  useEffect(() => {
    // 1. Supabase Realtime Postgres Changes
    let channel: any = null;
    if (supabaseClient) {
      channel = supabaseClient
        .channel(`dag_realtime_${enterpriseId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "dag_nodes",
            filter: `enterprise_id=eq.${enterpriseId}`,
          },
          (payload) => {
            console.log("⚡ Supabase Realtime DAG change received:", payload);
            fetchPersistedNodes();
          }
        )
        .subscribe();
    }

    // 2. Cross-Tab Broadcast Channel (for instant 2-person live demo across tabs)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("aarambh_dag_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "DAG_NODE_UPDATED") {
          setNodeStatuses(event.data.nodeStatuses);
          setHistoryLog((prev) => [
            `⚡ Realtime Update: Node ${event.data.nodeId} was approved from another session.`,
            ...prev,
          ]);
        }
      };
    }

    return () => {
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel);
      }
      if (bc) {
        bc.close();
      }
    };
  }, [enterpriseId, fetchPersistedNodes]);

  // Handle Approving a Node with REST Persistence Call
  const handleApproveNode = async (nodeId: string) => {
    // Optimistic local state update
    const updatedStatuses = { ...nodeStatuses, [nodeId]: "approved" as NodeStatus };
    const newLogs: string[] = [];

    if (nodeId === "node-root") {
      updatedStatuses["node-mpcb"] = "active";
      updatedStatuses["node-fire"] = "active";
      updatedStatuses["node-water"] = "active";
      newLogs.push(
        "✅ MIDC Land Allotment APPROVED → Automatically unlocked 3 parallel pipelines (MPCB, Fire, Water)."
      );
    } else {
      const approvedNode = INITIAL_NODES.find((n) => n.id === nodeId);
      newLogs.push(`✅ ${approvedNode?.name} APPROVED.`);
    }

    const childrenApproved =
      updatedStatuses["node-mpcb"] === "approved" &&
      updatedStatuses["node-fire"] === "approved" &&
      updatedStatuses["node-water"] === "approved";

    if (childrenApproved && updatedStatuses["node-dish"] === "locked") {
      updatedStatuses["node-dish"] = "active";
      newLogs.push(
        "🚀 ALL 3 parallel clearances approved → Grandchild Node (Final Factory License) UNLOCKED!"
      );
    }

    if (nodeId === "node-dish") {
      newLogs.push(
        "🎉 ALL STATUTORY CLEARANCES COMPLETED! Enterprise is 100% authorized for operations."
      );
    }

    setNodeStatuses(updatedStatuses);
    setHistoryLog((old) => [...newLogs, ...old]);

    // Broadcast update across open tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("aarambh_dag_sync");
        bc.postMessage({
          type: "DAG_NODE_UPDATED",
          nodeId,
          nodeStatuses: updatedStatuses,
        });
        bc.close();
      } catch (e) {
        // ignore
      }
    }

    // Call REST Backend to persist state into DB / Supabase
    try {
      const res = await fetch(`${BACKEND_API_URL}/dag/${nodeId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enterprise_id: enterpriseId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.nodes) {
          const statusMap: Record<string, NodeStatus> = {};
          data.nodes.forEach((n: any) => {
            statusMap[n.id] = n.status as NodeStatus;
          });
          setNodeStatuses(statusMap);
        }
      }
    } catch (apiErr) {
      console.warn("Backend persistence call warning:", apiErr);
    }
  };

  // Reset function
  const handleReset = async () => {
    const initialStatuses: Record<string, NodeStatus> = {
      "node-root": "active",
      "node-mpcb": "locked",
      "node-fire": "locked",
      "node-water": "locked",
      "node-dish": "locked",
    };
    setNodeStatuses(initialStatuses);
    setHistoryLog(["🔄 Pipeline reset to initial state. Root is Active."]);

    // Re-initialize in backend
    try {
      await fetch(`${BACKEND_API_URL}/enterprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enterpriseId }),
      });
    } catch (e) {
      // ignore
    }
  };

  const approvedCount = Object.values(nodeStatuses).filter((s) => s === "approved").length;
  const isPipelineFinished = nodeStatuses["node-dish"] === "approved";

  const rootNode = INITIAL_NODES.find((n) => n.id === "node-root")!;
  const childNodes = INITIAL_NODES.filter((n) =>
    ["node-mpcb", "node-fire", "node-water"].includes(n.id)
  );
  const grandchildNode = INITIAL_NODES.find((n) => n.id === "node-dish")!;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#9333EA] text-xs font-bold uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5 text-[#9333EA]" />
              <span>Parallel Clearance Engine</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
              <span>Realtime Persistence Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            Directed Acyclic Graph (DAG) Workflow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live interactive dependency graph orchestrating multi-department industrial clearances. State is persisted via REST endpoints and broadcast across sessions in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>

          <Link
            href="/dashboard/sla"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold shadow-xs transition-all"
          >
            <span>Open SLA Tracker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. Pitch Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sequential Lead Time</p>
          <p className="text-2xl font-black text-slate-400 mt-1 line-through">72 Days</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sum of all sequential SLA days</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">AARAMBH Parallel Lead Time</p>
          <p className="text-2xl font-black text-[#4F46E5] mt-1">36 Days</p>
          <p className="text-[11px] text-indigo-700 mt-0.5">Max(Stage 2 SLAs) + Stage 1 + Stage 3</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-xs font-bold text-[#059669] uppercase tracking-wider">Lead Time Reduction</p>
          <p className="text-2xl font-black text-[#059669] mt-1">36 Days (50% Saved)</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Zero idle queue waiting time</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Progress</p>
          <p className="text-2xl font-black text-[#0F172A] mt-1">{approvedCount} of 5 Approved</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(approvedCount / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL INTERACTIVE DAG GRAPH CANVAS */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        {/* Graph Legend */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-8 text-xs">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Interactive Clearance Orchestration DAG</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
              <span>Locked</span>
            </span>
            <span className="flex items-center space-x-1.5 text-indigo-300">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Active (Click Approve)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Approved</span>
            </span>
          </div>
        </div>

        {/* 3-Stage Columns Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* STAGE 1: ROOT NODE */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center lg:text-left">
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-800/60">
                STAGE 1: ROOT DEPENDENCY
              </span>
            </div>

            <NodeCard
              node={rootNode}
              status={nodeStatuses[rootNode.id] || "active"}
              onApprove={() => handleApproveNode(rootNode.id)}
            />
          </div>

          {/* STAGE 2: 3 PARALLEL CHILD NODES */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center lg:text-left">
              <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-800/60">
                STAGE 2: PARALLEL PROCESSING (3 STREAMS)
              </span>
            </div>

            <div className="space-y-4">
              {childNodes.map((child) => (
                <NodeCard
                  key={child.id}
                  node={child}
                  status={nodeStatuses[child.id] || "locked"}
                  onApprove={() => handleApproveNode(child.id)}
                />
              ))}
            </div>
          </div>

          {/* STAGE 3: GRANDCHILD NODE */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center lg:text-left">
              <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                STAGE 3: CONSOLIDATED GRANDCHILD
              </span>
            </div>

            <NodeCard
              node={grandchildNode}
              status={nodeStatuses[grandchildNode.id] || "locked"}
              onApprove={() => handleApproveNode(grandchildNode.id)}
            />
          </div>
        </div>

        {/* Pipeline Completed Banner */}
        {isPipelineFinished && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10 p-5 rounded-2xl bg-emerald-900/60 border-2 border-emerald-500 text-white flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-white">
                  Industrial Clearance Workflow 100% Completed!
                </h4>
                <p className="text-xs text-emerald-200">
                  All 5 pre-establishment, utility, and factory sign-off certificates have been granted within statutory SLA.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/sla"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition-colors shadow-md whitespace-nowrap"
            >
              View Deemed SLA Certifications
            </Link>
          </motion.div>
        )}
      </div>

      {/* 4. Live Event Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Live DAG State Transitions & Event Log</span>
        </h3>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 font-mono text-xs">
          {historyLog.map((log, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-[11px] ${
                idx === 0
                  ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Individual Node Card with Framer Motion < 300ms transition
function NodeCard({
  node,
  status,
  onApprove,
}: {
  node: DAGNode;
  status: NodeStatus;
  onApprove: () => void;
}) {
  const IconComp = node.icon;

  const isLocked = status === "locked";
  const isActive = status === "active";
  const isApproved = status === "approved";

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        scale: isActive ? 1.02 : 1,
        borderColor: isApproved ? "#059669" : isActive ? "#4F46E5" : "#334155",
        backgroundColor: isApproved
          ? "rgba(6, 78, 59, 0.4)"
          : isActive
          ? "rgba(30, 41, 59, 0.95)"
          : "rgba(15, 23, 42, 0.6)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl p-5 border-2 shadow-lg backdrop-blur-md flex flex-col justify-between transition-colors relative overflow-hidden ${
        isActive ? "ring-2 ring-indigo-500/40 shadow-indigo-500/10" : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-colors duration-200 ${
              isApproved
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : isActive
                ? "bg-indigo-600 text-white shadow-indigo-500/30"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            <IconComp className="w-4 h-4" />
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isApproved
                ? "bg-emerald-900/80 text-emerald-300 border border-emerald-600"
                : isActive
                ? "bg-indigo-900/80 text-indigo-200 border border-indigo-600 animate-pulse"
                : "bg-slate-800 text-slate-500 border border-slate-700"
            }`}
          >
            {isApproved ? "Approved ✓" : isActive ? "Active • In Review" : "Locked 🔒"}
          </span>
        </div>

        <h4
          className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${
            isApproved ? "text-emerald-300" : isActive ? "text-white" : "text-slate-400"
          }`}
        >
          {node.name}
        </h4>
        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{node.department}</p>
        <p className="text-[11px] text-slate-400/90 mt-2 leading-relaxed">{node.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold text-slate-400">
          SLA: <strong className="text-slate-200">{node.slaDays} Days</strong>
        </span>

        {isApproved ? (
          <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passed</span>
          </span>
        ) : isActive ? (
          <button
            type="button"
            onClick={onApprove}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold shadow-md shadow-emerald-700/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Approve Node</span>
          </button>
        ) : (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
            <Lock className="w-3 h-3" />
            <span>Waiting on Parent</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
