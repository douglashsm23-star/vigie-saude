import { useState } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Funções auxiliares para CPF
const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length !== 11) return cpf;
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length !== 11) return false;

  // Evita CPFs com todos dígitos iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  if (firstDigit !== parseInt(numbers.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  if (secondDigit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

export default function Register() {
  const [, setLocation] = useLocation();
  const auth = useAuth();

  const [step, setStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [endereco, setEndereco] = useState("");

  const [localTrabalho, setLocalTrabalho] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [matricula, setMatricula] = useState("");
  const [universidade, setUniversidade] = useState("");

  // Verifica se auth.register existe
  if (!auth || typeof (auth as any).register !== "function") {
    console.error("AuthContext não tem register!", auth);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-xl font-black text-red-600">
            Erro de configuração
          </h1>
          <p className="text-slate-500 mt-2">
            Recarregue a página ou tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-[#7B2335] text-white rounded-xl"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (role === "paciente") {
      setStep("details");
    } else {
      setStep("specialty");
    }
  };

  const handleSpecialtySelect = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setStep("details");
  };

  const handleRegister = async () => {
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Digite seu nome!");
      return;
    }

    // Validação do CPF (já deve estar formatado pelo onBlur)
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!isValidCPF(cpfLimpo)) {
      setErrorMsg("❌ CPF inválido! Digite um CPF válido.");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Digite sua senha!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem!");
      return;
    }
    if (!endereco.trim()) {
      setErrorMsg("Digite seu endereço!");
      return;
    }

    if (selectedRole === "profissional" && !registroProfissional.trim()) {
      setErrorMsg("Digite seu CRM/CRO!");
      return;
    }
    if (selectedRole === "estudante" && !matricula.trim()) {
      setErrorMsg("Digite sua matrícula!");
      return;
    }
    if (selectedRole === "estudante" && !universidade.trim()) {
      setErrorMsg("Digite sua universidade!");
      return;
    }

    setLoading(true);

    const userProfile: any = {
      role: selectedRole,
      specialty: selectedSpecialty,
      name,
      cpf: cpfLimpo, // Salva sem formatação
      password,
      endereco,
    };

    if (selectedRole === "profissional") {
      userProfile.localTrabalho = localTrabalho;
      userProfile.registroProfissional = registroProfissional;
    }
    if (selectedRole === "estudante") {
      userProfile.matricula = matricula;
      userProfile.university = universidade;
    }

    try {
      const success = await (auth as any).register(userProfile);
      if (success) {
        setLocation("/");
      } else {
        setErrorMsg("Erro ao cadastrar. CPF já existe?");
      }
    } catch (err) {
      console.error("Erro:", err);
      setErrorMsg("Erro ao cadastrar. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* BOTÃO VOLTAR PARA TELA INICIAL */}
        <div className="mb-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-1 text-[#7B2335] font-black text-sm hover:text-[#5a1a26] transition-colors"
          >
            <Lucide.ChevronLeft size={20} /> Voltar
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#7B2335] uppercase italic">
            Vigie Health Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-2">Crie sua conta</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-6 backdrop-blur-sm">
          {step === "role" && (
            <>
              <h2 className="text-center font-black text-slate-700 text-xl">
                Quem é você?
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect("profissional")}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-[#7B2335] hover:bg-[#7B2335]/5 transition-all flex items-center gap-4 group"
                >
                  <Lucide.Briefcase size={28} className="text-[#7B2335] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-black">Profissional de Saúde</p>
                    <p className="text-xs text-slate-400">
                      Médico ou Cirurgião-Dentista
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("estudante")}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-[#7B2335] hover:bg-[#7B2335]/5 transition-all flex items-center gap-4 group"
                >
                  <Lucide.GraduationCap size={28} className="text-[#7B2335] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-black">Estudante Universitário</p>
                    <p className="text-xs text-slate-400">
                      Medicina ou Odontologia
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("paciente")}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-[#7B2335] hover:bg-[#7B2335]/5 transition-all flex items-center gap-4 group"
                >
                  <Lucide.User size={28} className="text-[#7B2335] group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-black">Paciente</p>
                    <p className="text-xs text-slate-400">
                      Acessar meu prontuário
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === "specialty" && (
            <>
              <button
                onClick={() => setStep("role")}
                className="text-[#7B2335] text-sm font-bold flex items-center gap-1 hover:text-[#5a1a26] transition-colors"
              >
                <Lucide.ChevronLeft size={16} /> Voltar
              </button>
              <h2 className="text-center font-black text-slate-700 text-xl">
                Qual sua especialidade?
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleSpecialtySelect("odontologia")}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all flex items-center gap-4 group"
                >
                  <Lucide.Smile size={28} className="text-green-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-black">Cirurgião-Dentista</p>
                    <p className="text-xs text-slate-400">Odontologia</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSpecialtySelect("medicina")}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 group"
                >
                  <Lucide.Heart size={28} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p className="font-black">Médico</p>
                    <p className="text-xs text-slate-400">Medicina</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === "details" && (
            <>
              <button
                onClick={() =>
                  setStep(selectedRole === "paciente" ? "role" : "specialty")
                }
                className="text-[#7B2335] text-sm font-bold flex items-center gap-1 hover:text-[#5a1a26] transition-colors"
              >
                <Lucide.ChevronLeft size={16} /> Voltar
              </button>
              <h2 className="text-center font-black text-slate-700 text-xl">
                Seus Dados
              </h2>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    CPF *
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    onBlur={() => {
                      const limpo = cpf.replace(/\D/g, "");
                      if (limpo.length === 11) {
                        setCpf(formatCPF(limpo));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    Senha *
                  </label>
                  <input
                    type="password"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>

                {selectedRole === "profissional" && (
                  <>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        Local de Trabalho
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                        value={localTrabalho}
                        onChange={(e) => setLocalTrabalho(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        {selectedSpecialty === "odontologia"
                          ? "CRO *"
                          : "CRM *"}
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                        value={registroProfissional}
                        onChange={(e) =>
                          setRegistroProfissional(e.target.value)
                        }
                      />
                    </div>
                  </>
                )}

                {selectedRole === "estudante" && (
                  <>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        Universidade *
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                        value={universidade}
                        onChange={(e) => setUniversidade(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        Matrícula *
                      </label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] focus:ring-2 focus:ring-[#7B2335]/20 transition-all mt-1"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full mt-6 py-5 bg-[#4169E1] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-lg hover:bg-[#3658c7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      CADASTRANDO...
                    </div>
                  ) : (
                    "CADASTRAR E ENTRAR"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
