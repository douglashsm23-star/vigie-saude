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
const USERS_KEY = "vigie_users";

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

  const login = async (cpf: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const foundUser = users.find(
        (u: UserProfile) => u.cpf === cpf && u.password === password,
      );
      if (foundUser) {
        setUser(foundUser);
        return true;
      }
      setError("CPF ou senha incorretos!");
      return false;
    } catch (err) {
      setError("Erro ao fazer login!");
      return false;
    }
  };

  const register = async (profile: UserProfile): Promise<boolean> => {
    setError(null);
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      if (users.some((u: UserProfile) => u.cpf === profile.cpf)) {
        setError("CPF já cadastrado!");
        return false;
      }
      users.push(profile);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
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
