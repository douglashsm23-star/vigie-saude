import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  limit 
} from "firebase/firestore";

const LEGACY_PATIENT_NAMES = ["enzo", "douglas", "ricardo"];

function normalizeName(name: any) {
  return String(name || "").toLowerCase().trim();
}

function isLegacyPatient(patient: any) {
  const name = normalizeName(patient.name);
  return LEGACY_PATIENT_NAMES.some((legacyName) => name.includes(legacyName));
}

// ============================================
// BUSCAR TODOS OS PACIENTES (FIREBASE)
// ============================================
export const getPatients = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "pacientes"));
    const patients = querySnapshot.docs.map(documento => ({
      firebaseId: documento.id,
      ...documento.data()
    }));

    return patients.filter((patient: any) => !isLegacyPatient(patient));
  } catch (error) {
    console.error("❌ Erro ao buscar pacientes no Firebase:", error);
    return [];
  }
};

// ============================================
// BUSCAR PACIENTE POR CPF (FIREBASE)
// ============================================
export const getPatientByCPF = async (cpf: string): Promise<any | null> => {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    const q = query(collection(db, "pacientes"), where("cpf", "==", cpfLimpo), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return { firebaseId: docData.id, ...docData.data() };
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao buscar por CPF no Firebase:", error);
    return null;
  }
};

// ============================================
// SALVAR PACIENTE (FIREBASE)
// ============================================
export const savePatient = async (patient: any): Promise<void> => {
  try {
    const pacienteParaSalvar = {
      id: String(patient.id || Date.now().toString()),
      role: patient.role || "paciente",
      specialty: patient.specialty || "",
      name: patient.name || "",
      cpf: String(patient.cpf || "").replace(/\D/g, ""), 
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

    await addDoc(collection(db, "pacientes"), pacienteParaSalvar);
    console.log("✅ Paciente salvo no Firebase!");

    const localPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    localStorage.setItem("patients", JSON.stringify([...localPatients, pacienteParaSalvar]));

  } catch (error) {
    console.error("❌ Erro ao salvar no Firebase:", error);
    throw error;
  }
};

// ============================================
// ATUALIZAR PACIENTE (FIREBASE)
// ============================================
export const updatePatient = async (cpf: string, updatedData: any): Promise<void> => {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    const q = query(collection(db, "pacientes"), where("cpf", "==", cpfLimpo), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = doc(db, "pacientes", querySnapshot.docs[0].id);
      await updateDoc(docRef, updatedData);
      console.log("✅ Paciente atualizado no Firebase");
    }
  } catch (error) {
    console.error("❌ Erro ao atualizar paciente no Firebase:", error);
    throw error;
  }
};