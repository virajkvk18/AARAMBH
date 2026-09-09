import { useEnterpriseStore } from "./enterpriseStore";

/**
 * Hook that extracts only the minimal data needed for the AskAarambh Chatbot
 * to provide context‑aware answers.
 */
export const useActiveChatContext = () => {
  // Pull the required fields from the enterprise store.
  const {
    sector,
    locationZone,
    capexCr,
    masterCAF,
    applicationRef,
    applicationStatus,
    clearances,
    dagNodeStatuses,
  } = useEnterpriseStore((state) => ({
    sector: state.sector,
    locationZone: state.locationZone,
    capexCr: state.capexCr,
    masterCAF: state.masterCAF,
    applicationRef: state.applicationRef,
    applicationStatus: state.applicationStatus,
    clearances: state.clearances,
    dagNodeStatuses: state.dagNodeStatuses,
  }));

  // Normalise the enterprise name – fall back to an empty string if not available.
  const enterpriseName = masterCAF?.companyDetails?.companyName ?? "";

  // Prepare a simple SLA list – here we just expose the declared SLA days.
  const sla = clearances.map((c) => ({
    clearance: c.name,
    daysRemaining: c.slaDays ?? 0,
  }));

  return {
    enterprise: {
      name: enterpriseName,
      sector: sector ?? "",
      capexCr: capexCr ?? 0,
      locationZone: locationZone ?? "",
    },
    application: {
      reference: applicationRef ?? "",
      status: applicationStatus ?? "",
    },
    clearances: clearances.map((c) => ({
      id: c.id,
      name: c.name,
      department: c.department,
      status: c.status ?? "unknown",
      slaDays: c.slaDays ?? 0,
    })),
    dag: { ...dagNodeStatuses },
    sla,
  };
};
