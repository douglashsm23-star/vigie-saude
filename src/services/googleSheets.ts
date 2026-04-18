const API_URL = "https://sheetdb.io/api/v1/eh0ftrju3o4ve";

const LEGACY_PATIENT_NAMES = ["enzo", "douglas", "ricardo"];

function normalizeName(name: any) {
  return String(name || "").toLowerCase().trim();
}

function isLegacyPatient(patient: any) {
  const name = normalizeName(patient.name);
  return LEGACY_PATIENT_NAMES.some((legacyName) => name.includes(legacyName));
}

// ============================================
// BUSCAR TODOS OS PACIENTES
// ============================================
export const getPatients = async (): Promise<any[]> => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && Array.isArray(data)) {
      return data
        .map((row: any) => ({
          id: row.id || "",
          name: row.name || "",
          cpf: String(row.cpf || ""), // ← FORÇA COMO STRING
          password: row.password || "",
          dob: row.dob || "",
          phone: row.phone || "",
          address: row.address || "",
          registeredAt: row.registeredAt || "",
        }))
        .filter((patient: any) => !isLegacyPatient(patient));
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
};

// ============================================
// BUSCAR PACIENTE POR CPF
// ============================================
export const getPatientByCPF = async (cpf: string): Promise<any | null> => {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    const patients = await getPatients();
    const encontrado = patients.find((p: any) => {
      const cpfPaciente = String(p.cpf).replace(/\D/g, "");
      return cpfPaciente === cpfLimpo;
    });
    return encontrado || null;
  } catch (error) {
    console.error("Erro ao buscar por CPF:", error);
    return null;
  }
};

// ============================================
// SALVAR PACIENTE
// ============================================
export const savePatient = async (patient: any): Promise<void> => {
  try {
    // FORÇAR CPF COMO STRING (para preservar zeros no início)
    const pacienteParaSalvar = {
      id: String(patient.id || Date.now().toString()),
      role: patient.role || "paciente",
      specialty: patient.specialty || "",
      name: patient.name || "",
      cpf: String(patient.cpf || ""),
      password: patient.password || "",
      email: patient.email || "",
      dob: patient.dob || "",
      phone: patient.phone || "",
      address: patient.address || "",
      weight: patient.weight ?? "",
      height: patient.height ?? "",
      sex: patient.sex || "",
      motivoConsulta: patient.motivoConsulta || "",
      exameStatus: patient.exameStatus || "",
      historicoFamiliar: patient.historicoFamiliar || "",
      comorbidities: Array.isArray(patient.comorbidities)
        ? patient.comorbidities.join(", ")
        : patient.comorbidities || "",
      medications: patient.medications || "",
      allergies: patient.allergies || "",
      prescricao: patient.prescricao || "",
      encaminhamento: patient.encaminhamento || "",
      vereditoGeral: patient.vereditoGeral || "",
      pressaoArterial: patient.pressaoArterial || "",
      frequenciaCardiaca: patient.frequenciaCardiaca || "",
      lastConsultDate: patient.lastConsultDate || "",
      painLevel: patient.painLevel ?? "",
      registeredAt: patient.registeredAt || new Date().toISOString(),
      registeredBy: patient.registeredBy || "",
      finalRisk: patient.finalRisk || "low",
    };

    console.log("📝 Salvando paciente:", pacienteParaSalvar);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: pacienteParaSalvar,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao salvar paciente: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Paciente salvo no SheetDB:", result);

    // Também salva no localStorage para backup, eliminando duplicados por CPF
    const localPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    const newList = [...localPatients, pacienteParaSalvar];
    const deduped = newList.filter((p: any, index: number) => {
      const cpf = String(p.cpf || "").replace(/\D/g, "");
      return index ===
        newList.findIndex(
          (item: any) => String(item.cpf || "").replace(/\D/g, "") === cpf,
        );
    });
    localStorage.setItem("patients", JSON.stringify(deduped));
  } catch (error) {
    console.error("❌ Erro ao salvar paciente:", error);
    throw error;
  }
};

// ============================================
// ATUALIZAR PACIENTE
// ============================================
export const updatePatient = async (
  cpf: string,
  updatedData: any,
): Promise<void> => {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    await fetch(`${API_URL}/cpf/${cpfLimpo}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: updatedData,
      }),
    });

    console.log("✅ Paciente atualizado no SheetDB");
  } catch (error) {
    console.error("❌ Erro ao atualizar paciente:", error);
    throw error;
  }
};
