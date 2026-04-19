import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export type UserRole = "paciente" | "profissional" | "estudante";
export type Specialty = "odontologia" | "medicina" | null;

export interface UserProfile {
  role: UserRole;
  specialty: Specialty;
  name: string;
  cpf: string;
  password: string;
  endereco: string;
  email?: string;
  photo?: string;
  localTrabalho?: string;
  registroProfissional?: string;
  matricula?: string;
  university?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (cpf: string, password: string) => Promise<boolean>;
  register: (profile: UserProfile) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "vigie_user_v2";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (cpf: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const cpfLimpo = cpf.replace(/\D/g, "");
      const q = query(collection(db, "usuarios"), where("cpf", "==", cpfLimpo));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Usuário não encontrado!");
        return false;
      }

      const userData = querySnapshot.docs[0].data() as UserProfile;

      if (userData.password === password) {
        setUser(userData);
        return true;
      } else {
        setError("Senha incorreta!");
        return false;
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao conectar com o banco de dados.");
      return false;
    }
  };

  const register = async (profile: UserProfile): Promise<boolean> => {
    setError(null);
    try {
      const cpfLimpo = profile.cpf.replace(/\D/g, "");
      
      const q = query(collection(db, "usuarios"), where("cpf", "==", cpfLimpo));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError("CPF já cadastrado!");
        return false;
      }

      await addDoc(collection(db, "usuarios"), {
        ...profile,
        cpf: cpfLimpo,
        registeredAt: new Date().toISOString()
      });

      setUser(profile);
      return true;
    } catch (err) {
      console.error("Erro no registro:", err);
      setError("Erro ao salvar cadastro.");
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
