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

// URLs dos sheets por role (usando abas da mesma planilha)
const SHEET_BASE_URL = 'https://sheetdb.io/api/v1/eh0ftrju3o4ve';
const SHEET_URLS = {
  paciente: `${SHEET_BASE_URL}`, // Aba padrão
  profissional: `${SHEET_BASE_URL}?sheet=profissionais`,
  estudante: `${SHEET_BASE_URL}?sheet=estudantes`,
};

const LOCAL_USERS_KEY = "users";

const unformatCPF = (cpf: string): string => {
  return cpf?.replace(/\D/g, "") || "";
};

const getLocalUsers = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const addLocalUser = (user: any) => {
  const users = getLocalUsers();
  users.push(user);
  saveLocalUsers(users);
};

const seedSampleUsers = () => {
  if (typeof window === "undefined") return;
  const existing = getLocalUsers();
  if (existing.length > 0) return;

  const sampleUsers = [
    {
      id: "prof-odonto-001",
      role: "profissional",
      specialty: "odontologia",
      name: "Dra. Maria Silva",
      cpf: "11122233344",
      password: "odont@123",
      endereco: "Rua das Flores, 123",
      localTrabalho: "Clínica Sorriso",
      registroProfissional: "CRO-12345",
      email: "maria.silva@vigie.com",
      registeredAt: new Date().toISOString(),
    },
    {
      id: "prof-med-001",
      role: "profissional",
      specialty: "medicina",
      name: "Dr. João Santos",
      cpf: "22233344455",
      password: "med@123",
      endereco: "Avenida Saúde, 456",
      localTrabalho: "Clínica Bem Estar",
      registroProfissional: "CRM-54321",
      email: "joao.santos@vigie.com",
      registeredAt: new Date().toISOString(),
    },
    {
      id: "paciente-001",
      role: "paciente",
      specialty: null,
      name: "Carlos Souza",
      cpf: "33344455566",
      password: "paciente123",
      endereco: "Rua Legal, 789",
      email: "carlos.souza@vigie.com",
      registeredAt: new Date().toISOString(),
    },
  ];

  saveLocalUsers(sampleUsers);
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
      seedSampleUsers();
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
  // LOGIN ATUALIZADO - BUSCA EM TODOS OS SHEETS
  // ============================================
  const login = async (cpf: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const cpfLimpo = unformatCPF(cpf);
      console.log("🔍 CPF digitado (limpo):", cpfLimpo);

      // Verificar usuários locais primeiro
      const localUsers = getLocalUsers();
      const localFound = localUsers.find((u: any) => {
        return unformatCPF(String(u.cpf)) === cpfLimpo && u.password === password;
      });
      if (localFound) {
        console.log("✅ Usuário local encontrado:", localFound.name);
        const userProfile: UserProfile = {
          role: localFound.role,
          specialty: localFound.role === "profissional" ? (localFound.specialty || null) : null,
          name: localFound.name,
          cpf: localFound.cpf,
          password: localFound.password,
          endereco: localFound.address || localFound.endereco || "",
          photo: localFound.photo,
          localTrabalho: localFound.localTrabalho,
          registroProfissional: localFound.registroProfissional,
          matricula: localFound.matricula,
          university: localFound.university,
        };
        setUser(userProfile);
        return true;
      }

      // Buscar em todos os sheets
      for (const [role, url] of Object.entries(SHEET_URLS)) {
        try {
          console.log(`📋 Buscando em ${role}...`);
          const response = await fetch(url);
          const users = await response.json();

          const foundUser = users.find((u: any) => {
            const cpfBancoLimpo = unformatCPF(String(u.cpf));
            return cpfBancoLimpo === cpfLimpo && u.password === password;
          });

          if (foundUser) {
            console.log("✅ Usuário encontrado:", foundUser.name, `(${role})`);
            const userProfile: UserProfile = {
              role: role as UserRole,
              specialty: role === "profissional" ? (foundUser.specialty || null) : null,
              name: foundUser.name,
              cpf: foundUser.cpf,
              password: foundUser.password,
              endereco: foundUser.address || foundUser.endereco || "",
              photo: foundUser.photo,
              localTrabalho: foundUser.localTrabalho,
              registroProfissional: foundUser.registroProfissional,
              matricula: foundUser.matricula,
              university: foundUser.university,
            };
            setUser(userProfile);
            return true;
          }
        } catch (err) {
          console.warn(`Erro ao buscar em ${role}:`, err);
          // Continua para o próximo sheet
        }
      }

      console.log("❌ Usuário não encontrado em nenhum sheet");
      setError("CPF ou senha incorretos!");
      return false;
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login!");
      return false;
    }
  };

  // ============================================
  // REGISTRO ATUALIZADO - SUPORTE A TODOS OS ROLES
  // ============================================
  const register = async (profile: UserProfile): Promise<boolean> => {
    setError(null);
    try {
      const cpfLimpo = unformatCPF(profile.cpf);
      const targetUrl = SHEET_URLS[profile.role];

      if (!targetUrl) {
        setError("Role não suportado!");
        return false;
      }

      const localUsers = getLocalUsers();
      const localExists = localUsers.some((u: any) => unformatCPF(String(u.cpf)) === cpfLimpo);
      if (localExists) {
        setError("CPF já cadastrado!");
        return false;
      }

      // Verificar se CPF já existe em QUALQUER sheet remoto
      for (const [role, url] of Object.entries(SHEET_URLS)) {
        try {
          const response = await fetch(url);
          const users = await response.json();

          const existente = users.find((u: any) => {
            const cpfBancoLimpo = unformatCPF(String(u.cpf));
            return cpfBancoLimpo === cpfLimpo;
          });

          if (existente) {
            setError("CPF já cadastrado!");
            return false;
          }
        } catch (err) {
          console.warn(`Erro ao verificar em ${role}:`, err);
          // Continua verificando outros sheets
        }
      }

      const dadosParaSalvar: any = {
        id: Date.now().toString(),
        role: profile.role,
        specialty: profile.specialty || "",
        name: profile.name,
        cpf: cpfLimpo,
        password: profile.password,
        endereco: profile.endereco,
        email: profile.email || "",
        registeredAt: new Date().toISOString(),
      };

      if (profile.role === "profissional") {
        dadosParaSalvar.localTrabalho = profile.localTrabalho || "";
        dadosParaSalvar.registroProfissional = profile.registroProfissional || "";
      } else if (profile.role === "estudante") {
        dadosParaSalvar.matricula = profile.matricula || "";
        dadosParaSalvar.university = profile.university || "";
      }

      let savedRemotely = false;
      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dadosParaSalvar }),
        });

        savedRemotely = response.ok;
        if (!response.ok) {
          const errorText = await response.text();
          console.warn("Falha ao cadastrar usuário remotamente:", response.status, errorText);
        }
      } catch (err) {
        console.warn("Erro de rede ao cadastrar usuário remoto:", err);
      }

      addLocalUser(dadosParaSalvar);
      setUser(profile);

      if (!savedRemotely) {
        console.warn("Usuário salvo localmente devido a falha remota.");
      }
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