export type RiskLevel = "low" | "medium" | "high";

export const RISK_COLOR: Record<RiskLevel, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};

const LEGACY_PATIENT_NAMES = ["enzo", "douglas", "ricardo"];

function normalizeCpf(cpf: any) {
  return String(cpf || "").replace(/\D/g, "");
}

function normalizeName(name: any) {
  return String(name || "").toLowerCase().trim();
}

function isLegacyPatient(patient: any) {
  const name = normalizeName(patient.name);
  return LEGACY_PATIENT_NAMES.some((legacyName) => name.includes(legacyName));
}

function cleanLegacyPatients(patients: any[]) {
  return patients.filter((patient) => !isLegacyPatient(patient));
}

function dedupePatients(patients: any[]) {
  const seen = new Set<string>();
  return patients.filter((patient) => {
    if (isLegacyPatient(patient)) {
      return false;
    }
    const key = normalizeCpf(patient.cpf) || String(patient.id || patient.name || "");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function getStoredPatients() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem("vigie_patients_v1") || localStorage.getItem("patients");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    const list = Array.isArray(parsed) ? parsed : [];
    const filtered = cleanLegacyPatients(list);
    const clean = dedupePatients(filtered);
    if (clean.length !== list.length) {
      localStorage.setItem("vigie_patients_v1", JSON.stringify(clean));
      localStorage.removeItem("patients");
    }
    return clean;
  } catch {
    return [];
  }
}

export function clearAllPatientData() {
  if (typeof window === "undefined") {
    return;
  }
  const patientKeys = ["patients", "vigie_patients_v1", "vigie_respostas_questionarios", "vigie_historico_consultas", "vigie_medicacoes_reminders"];

  patientKeys.forEach((key) => localStorage.removeItem(key));

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("questionarios_") ||
      key.startsWith("respostas_") ||
      key.startsWith("consultas_") ||
      key.startsWith("medicacao_status_")
    ) {
      localStorage.removeItem(key);
    }
  });
}

export function addStoredPatient(patient: any) {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = getStoredPatients();
  const updated = dedupePatients([...stored, patient]);
  localStorage.setItem("vigie_patients_v1", JSON.stringify(updated));
  return updated;
}

export function calcRisk(patient: any): RiskLevel {
  if (!patient) return "low";
  if (patient.finalRisk) {
    return ["high", "medium", "low"].includes(patient.finalRisk)
      ? patient.finalRisk
      : "low";
  }
  if (patient.status === "critical" || patient.status === "high") {
    return "high";
  }
  if (patient.status === "attention" || patient.status === "medium") {
    return "medium";
  }
  return "low";
}
