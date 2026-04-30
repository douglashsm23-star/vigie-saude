import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Search,
  ChevronRight,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts";
import { getPatients } from "@/services/firestoreService";
import {
  getStoredPatients,
  clearAllPatientData,
  RISK_COLOR,
  type RiskLevel,
} from "@/store/patientStore";

// Cores para comorbidades
const pathologyColors: Record<string, string> = {
  Diabetes: "bg-blue-100 text-blue-800",
  Hipertensão: "bg-red-100 text-red-800",
  "Hipertensão Arterial": "bg-red-100 text-red-800",
  "Renal Crônico": "bg-orange-100 text-orange-800",
  Obesidade: "bg-yellow-100 text-yellow-800",
  "Saúde Mental": "bg-gray-100 text-gray-800",
  "Problemas Respiratórios": "bg-purple-100 text-purple-800",
  Asma: "bg-purple-100 text-purple-800",
  Neoplasias: "bg-pink-100 text-pink-800",
  "Infarto Prévio": "bg-red-100 text-red-800",
  AVC: "bg-red-100 text-red-800",
  Depressão: "bg-gray-100 text-gray-800",
  Ansiedade: "bg-gray-100 text-gray-800",
};

function RiskTag({ risk }: { risk: RiskLevel }) {
  const color = RISK_COLOR[risk];
  const Icon =
    risk === "high" ? ShieldAlert : risk === "medium" ? Shield : ShieldCheck;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
      style={{ background: color }}
    >
      <Icon size={10} />
      {risk === "high" ? "Alto" : risk === "medium" ? "Médio" : "Baixo"}
    </span>
  );
}

function ComorbidityBadge({ name }: { name: string }) {
  const colorClass = pathologyColors[name] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${colorClass}`}
    >
      {name}
    </span>
  );
}

export default function Patients() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const clearOldPatients = () => {
    if (
      confirm(
        "Tem certeza? Isso irá remover todos os pacientes salvos localmente e limpar dados de questionários e consultas.",
      )
    ) {
      clearAllPatientData();
      setPatients([]);
      alert("✅ Todos os dados de pacientes foram removidos do sistema local.");
    }
  };

  const loadPatients = async () => {
    try {
      console.log("🔄 Carregando pacientes do SheetDB...");

      const pacientesFormatados = await getPatients();

      if (pacientesFormatados && pacientesFormatados.length > 0) {
        setPatients(pacientesFormatados);
        localStorage.setItem("patients", JSON.stringify(pacientesFormatados));
        localStorage.setItem("vigie_patients_v1", JSON.stringify(pacientesFormatados));
        console.log(
          `✅ ${pacientesFormatados.length} pacientes carregados do SheetDB`,
        );
        return;
      }

      const stored = getStoredPatients();
      if (stored && stored.length > 0) {
        setPatients(stored);
        console.log(`📦 ${stored.length} pacientes carregados do localStorage`);
      } else {
        setPatients([]);
        console.log("📭 Nenhum paciente encontrado");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar pacientes:", error);
      const stored = getStoredPatients();
      setPatients(stored || []);
    }
  };

  const deletePatient = (id: string, name: string, cpf: string) => {
    if (confirm(`Tem certeza que deseja deletar o paciente "${name}"?`)) {
      // Remover da lista de pacientes
      const updated = patients.filter((p) => p.id !== id);
      localStorage.setItem("vigie_patients_v1", JSON.stringify(updated));

      // Remover questionários do paciente
      localStorage.removeItem(`questionarios_${cpf}`);

      // Remover respostas do paciente
      localStorage.removeItem(`respostas_${cpf}`);

      setPatients(updated);
      alert("✅ Paciente deletado completamente do sistema!");
    }
  };

  const unformatCPF = (cpf: string): string => {
    return cpf?.replace(/\D/g, "") || "";
  };

  const filteredPatients = patients.filter((p) => {
    if (!query) return true;
    const searchTerm = query.toLowerCase();
    const cpfLimpo = unformatCPF(p.cpf);
    return (
      p.name?.toLowerCase().includes(searchTerm) ||
      cpfLimpo.includes(searchTerm.replace(/\D/g, ""))
    );
  });

  const getRisk = (patient: any): RiskLevel => {
    return patient.finalRisk || "low";
  };

  // Função para pegar a última prescrição
  const getUltimaPrescricao = (patient: any) => {
    if (patient.prescricao) {
      const linhas = patient.prescricao.split("\n");
      const primeiraLinha = linhas[0];
      return primeiraLinha.length > 50
        ? primeiraLinha.substring(0, 50) + "..."
        : primeiraLinha;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cabeçalho */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() =>
                setLocation(
                  user?.specialty === "odontologia"
                    ? "/dentista/dashboard"
                    : "/medico/dashboard",
                )
              }
              className="p-2 -ml-2"
            >
              <ChevronRight size={24} className="rotate-180 text-[#7B2335]" />
            </button>
            <div>
              <h1 className="font-black text-xl text-[#7B2335]">Meus Pacientes</h1>
              <p className="text-slate-500 text-sm">Lista de pacientes já cadastrados no sistema.</p>
            </div>
            <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation(`/pacientes/novo/${user?.specialty || "medicina"}`)}
            className="text-xs uppercase font-bold text-white bg-[#7B2335] px-3 py-2 rounded-full hover:bg-[#8B2B45] transition"
          >
            Novo paciente
          </button>
          <button
            onClick={() => clearOldPatients()}
            className="text-xs uppercase font-bold text-slate-500 border border-slate-200 rounded-full px-3 py-2 hover:bg-slate-100 transition"
          >
            Limpar antigos
          </button>
        </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#7B2335] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="px-4 pt-4 pb-32">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              {patients.length === 0
                ? "Nenhum paciente cadastrado"
                : "Nenhum paciente encontrado"}
            </p>
            {patients.length === 0 && (
              <button
                onClick={() => setLocation("/pacientes/novo")}
                className="mt-4 px-6 py-3 bg-[#7B2335] text-white rounded-xl font-black text-sm"
              >
                + CADASTRAR PACIENTE
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => {
             const risk = getRisk(patient);
              
              // PROTEÇÃO: Garante que comorbidities seja sempre um Array, mesmo vindo do SheetDB
              let comorbidities: string[] = [];
              if (Array.isArray(patient.comorbidities)) {
                comorbidities = patient.comorbidities;
              } else if (typeof patient.comorbidities === 'string') {
                comorbidities = patient.comorbidities.split(',').map((c: string) => c.trim()).filter(Boolean);
              }

              const displayComorbidities = comorbidities.slice(0, 2);
              const hasMore = comorbidities.length > 2;
              const ultimaPrescricao = getUltimaPrescricao(patient);

              return (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() => setLocation(`/pacientes/${patient.id}`)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-lg"
                          style={{ background: RISK_COLOR[risk] || "#7B2335" }}
                        >
                          {patient.name?.charAt(0).toUpperCase() || "P"}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-black text-slate-800">
                                {patient.name || "Sem nome"}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {patient.cpf
                                  ? `CPF: ${patient.cpf}`
                                  : "Sem CPF"}
                              </p>
                            </div>
                            <RiskTag risk={risk} />
                          </div>

                          {/* Última Prescrição */}
                          {ultimaPrescricao && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                              <p className="text-[10px] font-black text-blue-600 uppercase">
                                Última Prescrição
                              </p>
                              <p className="text-xs text-slate-700 font-medium">
                                {ultimaPrescricao}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-1">
                                Dr(a). {patient.doctor || "Profissional"}
                              </p>
                            </div>
                          )}

                          {/* Comorbidades */}
                          {comorbidities.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {displayComorbidities.map((c: string) => (
                                <ComorbidityBadge key={c} name={c} />
                              ))}
                              {hasMore && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-600">
                                  +{comorbidities.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                            {patient.lastConsultDate && (
                              <span>
                                📅{" "}
                                {new Date(
                                  patient.lastConsultDate,
                                ).toLocaleDateString()}
                              </span>
                            )}
                            {patient.painLevel !== undefined && (
                              <span>😖 Dor: {patient.painLevel}/10</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botão Deletar */}
                    <button
                      onClick={() =>
                        deletePatient(patient.id, patient.name, patient.cpf)
                      }
                      className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-all shrink-0"
                      title="Deletar paciente"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão flutuante de novo paciente */}
      <button
        onClick={() => setLocation("/pacientes/novo")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#7B2335] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#8B2B45] transition-all z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
