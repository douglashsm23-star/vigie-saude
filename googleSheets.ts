const API_URL = "https://sheetdb.io/api/v1/eh0ftrju3o4ve";

// ============================================
// BUSCAR TODOS OS PACIENTES
// ============================================
export const getPatients = async (): Promise<any[]> => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data && Array.isArray(data)) {
      return data.map((row: any) => ({
        id: row.id || "",
        name: row.name || "",
        cpf: String(row.cpf || ""), // ← FORÇA COMO STRING
        password: row.password || "",
        dob: row.dob || "",
        phone: row.phone || "",
        address: row.address || "",
        registeredAt: row.registeredAt || "",
      }));
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
      id: patient.id,
      name: patient.name,
      cpf: String(patient.cpf), // ← FORÇA COMO STRING (ex: "06483928564")
      password: patient.password,
      dob: patient.dob || "",
      phone: patient.phone || "",
      address: patient.address || "",
      registeredAt: patient.registeredAt || new Date().toISOString(),
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

    const result = await response.json();
    console.log("✅ Paciente salvo no SheetDB:", result);

    // Também salva no localStorage para backup
    const localPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    localPatients.push(patient);
    localStorage.setItem("patients", JSON.stringify(localPatients));
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
    const response = await fetch(`${API_URL}/cpf/${cpfLimpo}`, {
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
