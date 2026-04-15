import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type UserRole = "paciente" | "profissional" | "estudante";
export type Specialty = "odontologia" | "medicina" | null;

export interface UserProfile {
  role: UserRole;
  specialty: Specialty;
  name: string;
  cpf: string;
  password: string;
  endereco: string;
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

// Função auxiliar para limpar CPF (remover pontos, traços, espaços)
const unformatCPF = (cpf: string): string => {
  return cpf?.replace(/\D/g, "") || "";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // ============================================
  // LOGIN CORRIGIDO - COMPARAÇÃO DE CPF SEM FORMATAÇÃO
  // ============================================
  const login = async (cpf: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      // Remove pontos, traço e espaços do CPF digitado
      const cpfLimpo = unformatCPF(cpf);
      console.log("🔍 CPF digitado (limpo):", cpfLimpo);

      // Buscar pacientes do SheetDB
      const response = await fetch('https://sheetdb.io/api/v1/eh0ftrju3o4ve');
      const patients = await response.json();

      console.log("📋 Pacientes carregados:", patients.length);

      // Comparar CPF já limpo com o CPF do banco (também limpo)
      const foundUser = patients.find((p: any) => {
        const cpfBancoLimpo = unformatCPF(String(p.cpf));
        return cpfBancoLimpo === cpfLimpo && p.password === password;
      });

      if (foundUser) {
        console.log("✅ Usuário encontrado:", foundUser.name);
        const userProfile: UserProfile = {
          role: "paciente",
          specialty: null,
          name: foundUser.name,
          cpf: foundUser.cpf,
          password: foundUser.password,
          endereco: foundUser.address || "",
          photo: foundUser.photo,
        };
        setUser(userProfile);
        return true;
      }

      console.log("❌ Usuário não encontrado");
      setError("CPF ou senha incorretos!");
      return false;
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login!");
      return false;
    }
  };

  // ============================================
  // REGISTRO COM GOOGLE SHEETS
  // ============================================
  const register = async (profile: UserProfile): Promise<boolean> => {
    setError(null);
    try {
      const cpfLimpo = unformatCPF(profile.cpf);

      // Verificar se CPF já existe na planilha
      const response = await fetch('https://sheetdb.io/api/v1/eh0ftrju3o4ve');
      const patients = await response.json();

      const pacienteExistente = patients.find((p: any) => {
        const cpfBancoLimpo = unformatCPF(String(p.cpf));
        return cpfBancoLimpo === cpfLimpo;
      });

      if (pacienteExistente) {
        setError("CPF já cadastrado!");
        return false;
      }

      // Salvar na planilha
      const novoPaciente = {
        id: Date.now().toString(),
        name: profile.name,
        cpf: cpfLimpo,
        password: profile.password,
        address: profile.endereco,
        registeredAt: new Date().toISOString(),
      };

      await fetch('https://sheetdb.io/api/v1/eh0ftrju3o4ve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: novoPaciente }),
      });

      setUser(profile);
      return true;
    } catch (err) {
      console.error("Erro no register:", err);
      setError("Erro ao cadastrar!");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}