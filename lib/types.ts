// Shared types and constants for MedTrace

export type Tab = "incidents" | "investigate" | "fix" | "review" | "release";

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  status: "open" | "investigating" | "fixing" | "reviewing" | "released";
  createdAt: string;
}

export const DEMO_INCIDENT: Incident = {
  id: "INC-2026-0847",
  title: "Emergency Department dashboard shows incorrect patient wait time",
  description:
    "Nurses on the ED floor report that the wait time displayed in the dashboard is consistently 15–20 minutes higher than actual queue data. Affects triage prioritisation during peak hours. Reports started after last Tuesday's deployment of the appointment scheduling refactor.",
  severity: "critical",
  module: "EmergencyDashboard.jsx",
  status: "investigating",
  createdAt: "2026-09-27T00:00:00+05:30",
};
