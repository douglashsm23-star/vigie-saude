import { db } from "./firebase.js";
import { collection, getDocs, addDoc, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";

const COLLECTION_NAME = "patients";

export const getPatients = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    return patients;
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return [];
  }
};

export const getPatientByCPF = async (cpf) => {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    const q = query(collection(db, COLLECTION_NAME), where("cpf", "==", cpfLimpo));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    let patient = null;
    querySnapshot.forEach((doc) => {
      patient = { id: doc.id, ...doc.data() };
    });
    return patient;
  } catch (error) {
    console.error("Erro ao buscar por CPF:", error);
    return null;
  }
};

export const savePatient = async (patient) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), patient);
    console.log("✅ Paciente salvo no Firebase! ID:", docRef.id);
    return { id: docRef.id, ...patient };
  } catch (error) {
    console.error("❌ Erro ao salvar paciente:", error);
    throw error;
  }
};
