import { Link, useParams } from "wouter";
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  Calendar,
  User,
  AlertCircle,
  FlaskConical,
  Heart,
  Pill,
  AlertTriangle,
} from "lucide-react";
import { patients } from "@/data/patients";
import { getStoredPatients } from "@/store/patientStore";
import HistoricoRespostas from "../components/HistoricoRespostas";

const pathologyColors: Record<string, string> = {
  Diabetes: "bg-blue-100 text-blue-800 border-blue-300",
  Hipertensão: "bg-red-100 text-red-800 border-red-300",
  "Hipertensão Arterial": "bg-red-100 text-red-800 border-red-300",
  "Renal Crônico": "bg-orange-100 text-orange-800 border-orange-300",
  Obesidade: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Saúde Mental": "bg-gray-100 text-gray-800 border-gray-300",
  "Problemas Respiratórios": "bg-purple-100 text-purple-800 border-purple-300",
  Neoplasias: "bg-pink-100 text-pink-800 border-pink-300",
  "Infarto Prévio": "bg-red-100 text-red-800 border-red-300",
  AVC: "bg-red-100 text-red-800 border-red-300",
  Arritmia: "bg-red-100 text-red-800 border-red-300",
  Asma: "bg-purple-100 text-purple-800 border-purple-300",
  DPOC: "bg-purple-100 text-purple-800 border-purple-300",
  Próstata: "bg-pink-100 text-pink-800 border-pink-300",
  Mama: "bg-pink-100 text-pink-800 border-pink-300",
  Leucemia: "bg-pink-100 text-pink-800 border-pink-300",
  Depressão: "bg-gray-100 text-gray-800 border-gray-300",
  Ansiedade: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function PatientDetail() {
  const params = useParams<{ id: string }>();
  const storedPatients = getStoredPatients();
  const allPatients = [...patients, ...storedPatients];
  const patient = allPatients.find((p) => String(p.id) === String(params.id)) as any;

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <p className="text-slate-400 font-bold">Paciente não encontrado</p>
          <Link href="/pacientes">
            <span className="text-[#EF4444] text-xs mt-4 block font-black uppercase underline tracking-widest cursor-pointer">
              Voltar para a lista
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = patient.status === "critical" || patient.finalRisk === "high"
    ? "#EF4444"
    : patient.status === "attention" || patient.finalRisk === "medium"
      ? "#F59E0B"
      : "#10B981";

  const getComorbidityColor = (comorbidity: string) => {
    return pathologyColors[comorbidity] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/pacientes">
            <button className="p-2 rounded-full hover:bg-slate-100">
              <ChevronLeft size={22} className="text-slate-700" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="font-black text-base text-slate-900 leading-tight uppercase truncate">
              {patient.name}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {patient.procedure || "Avaliação Geral"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Card de Identificação */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2.5 h-full" style={{ backgroundColor: statusColor }}></div>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ background: statusColor }}>
              {patient.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  patient.status === "critical" || patient.finalRisk === "high"
                    ? "bg-red-100 text-red-700"
                    : patient.status === "attention" || patient.finalRisk === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}>
                  {patient.status === "critical" || patient.finalRisk === "high"
                    ? "Crítico"
                    : patient.status === "attention" || patient.finalRisk === "medium"
                      ? "Atenção"
                      : "Estável"}
                </span>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  D+{patient.daysPostProcedure || 0}
                </span>
              </div>
              <p className="text-sm font-black text-slate-800">{patient.age || "N/A"} anos</p>
              <p className="text-xs font-bold text-slate-400 italic">
                Dr(a). {patient.doctor || patient.responsible || "Douglas"}
              </p>
            </div>
          </div>

          {/* Nível de dor */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-slate-500 uppercase">Nível de dor atual</span>
              <span className="text-sm font-black" style={{ color: statusColor }}>{patient.painLevel || 0}/10</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-[#7B2335] transition-all" style={{ width: `${Math.min(Math.max(patient.painLevel || 0, 0), 10) * 10}%` }} />
            </div>
          </div>
        </div>
{/* Só renderiza se o paciente tiver CPF, caso contrário mostra um aviso ou nada */}
        {patient?.cpf ? (
          <HistoricoRespostas pacienteCpf={patient.cpf} />
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-700 rounded-[28px] text-xs font-bold border border-yellow-200 text-center">
            Nenhum CPF vinculado para carregar o histórico.
          </div>
        )}
        {/* -------------------------------- */}
        {/* COMORBIDADES */}
        {patient.comorbidities && patient.comorbidities.length > 0 && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <Heart size={14} /> Condições de Saúde
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.comorbidities.map((cond: string) => (
                <span key={cond} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getComorbidityColor(cond)} shadow-sm`}>
                  {cond}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* HISTÓRICO FAMILIAR */}
        {patient.historicoFamiliar && patient.historicoFamiliar.length > 0 && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <User size={14} /> Histórico Familiar
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.historicoFamiliar.map((hist: string) => (
                <span key={hist} className="px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
                  {hist}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PRESCRIÇÕES */}
        {patient.prescricao && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <Pill size={14} /> Prescrições
            </h3>
            <div className="space-y-3">
              {patient.prescricao.split("\n\n").map((presc: string, idx: number) => (
                <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-bold text-slate-800 whitespace-pre-line">{presc}</p>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                    <span>Dr(a). {patient.doctor || "Profissional"}</span>
                    <span>{new Date(patient.registeredAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENCAMINHAMENTO */}
        {patient.encaminhamento && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <AlertCircle size={14} /> Encaminhamento
            </h3>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm font-bold text-amber-800">{patient.encaminhamento}</p>
            </div>
          </div>
        )}

        {/* Laudos e Laboratório */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <FlaskConical size={14} /> Laudos e Laboratório
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-[#EF4444] uppercase mb-2">Resultados Laboratoriais</p>
            <p className="text-xs font-bold text-slate-600 leading-relaxed italic whitespace-pre-line">
              {patient.bloodValues || "Nenhum registro de sangue encontrado."}
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase">Imagens de Exames</p>
            <div className="flex gap-1">
              {patient.imageTypes?.map((img: string) => (
                <span key={img} className="text-[8px] bg-white px-2 py-1 rounded-md border font-black">{img}</span>
              )) || "---"}
            </div>
          </div>
        </div>

        {/* Evolução Clínica */}
        <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Evolução Clínica</h3>
          <div className="p-4 bg-slate-900 rounded-2xl">
            <p className="text-xs font-bold text-white italic opacity-90">
              "{patient.notes || patient.evolution || "Sem notas registradas."}"
            </p>
          </div>
        </div>

        {/* Medicamentos Contínuos */}
        {patient.medications && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <Pill size={14} /> Medicamentos Contínuos
            </h3>
            <p className="text-xs font-bold text-slate-700">{patient.medications}</p>
          </div>
        )}

        {/* Alergias */}
        {patient.allergies && (
          <div className="bg-white rounded-[28px] border border-slate-200 p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
              <AlertTriangle size={14} /> Alergias
            </h3>
            <p className="text-xs font-bold text-red-600">{patient.allergies}</p>
          </div>
        )}

 
        {/* Ações e Telefone */}
        <div className="grid grid-cols-2 gap-3">
          <a href={`tel:${patient.phone || ""}`} className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-black text-[11px] uppercase text-slate-700 bg-white">
            <Phone size={16} className="text-[#10B981]" /> Ligar
          </a>
          <a href={`https://wa.me/55${patient.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-black text-[11px] uppercase text-slate-700 bg-white">
            <MessageSquare size={16} className="text-[#F59E0B]" /> Mensagem
          </a>
          <button className="col-span-2 py-5 rounded-[22px] text-white font-black text-xs uppercase" style={{ background: "#7B2335" }}>
            <Calendar size={16} className="inline mr-2" /> Agendar Retorno
          </button>
        </div>
      </div>
    </div>
  );
}
