import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bell, AlertTriangle, ChevronRight, Clock, Calendar, Plus, ShieldAlert, Shield, ShieldCheck } from "lucide-react";
import { patients } from "@/data/patients";
import { StatusBadge } from "@/components/StatusBadge";
import { PainIndicator } from "@/components/PainIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredPatients, RISK_LABEL, type RiskLevel } from "@/store/patientStore";

const WINE = "#7B2335";
const COLOR_RED = "#EF4444";    // ALTO RISCO (Vermelho)
const COLOR_ORANGE = "#F59E0B"; // ALERTA (Laranja)
const COLOR_GREEN = "#10B981";  // ESTÁVEL (Verde)

// MAPEAMENTO DE CORES PARA O SEMÁFORO
const RISK_COLOR_MAP: Record<RiskLevel, string> = {
  high: COLOR_RED,
  medium: COLOR_ORANGE,
  low: COLOR_GREEN
};

function statusToRisk(status: string): RiskLevel {
  return status === "critical" ? "high" : status === "attention" ? "medium" : "low";
}

function RiskTag({ risk }: { risk: RiskLevel }) {
  const color = RISK_COLOR_MAP[risk];
  const Icon = risk === "high" ? ShieldAlert : risk === "medium" ? Shield : ShieldCheck;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
      style={{ background: color }}
    >
      <Icon size={10} />
      {risk === "high" ? "Alto" : risk === "medium" ? "Medio" : "Baixo"}
    </span>
  );
}

export default function Dashboard() {
  const [notifOpen, setNotifOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const storedPatients = getStoredPatients();

  const critical = patients.filter((p) => p.status === "critical");
  const attention = patients.filter((p) => p.status === "attention");
  const stable = patients.filter((p) => p.status === "stable");

  const urgentActions = patients
    .filter((p) => p.status === "critical" || p.status === "attention")
    .sort((a, b) => b.painLevel - a.painLevel);

  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const recentStored = [...storedPatients]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-widest" style={{ color: WINE, letterSpacing: "0.18em" }}>VIGIE</span>
              <span className="text-[10px] font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5 tracking-wide uppercase">
                {user?.specialty || "ODONTO & MEDICINA"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground capitalize">
              {user?.name ? `Olá, ${user.name.split(" ")[0]}` : dateStr}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/pacientes/novo")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-[#7B2335]/20"
              style={{ background: WINE }}
            >
              <Plus size={14} /> Paciente
            </button>
            <button className="relative p-2 rounded-full hover:bg-secondary transition-colors" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={20} className="text-foreground" />
              {critical.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Visão Geral (Semáforo) */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Visao geral de hoje</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/pacientes?status=critical">
              <div className="rounded-xl p-3.5 cursor-pointer transition-transform active:scale-95 shadow-md" style={{ background: `linear-gradient(135deg, ${COLOR_RED}, #B91C1C)` }}>
                <div className="text-3xl font-bold text-white mb-1">{critical.length}</div>
                <div className="flex items-center gap-1 text-red-100 text-[10px] font-bold uppercase tracking-tighter"><AlertTriangle size={11} /> Criticos</div>
              </div>
            </Link>
            <Link href="/pacientes?status=attention">
              <div className="rounded-xl p-3.5 cursor-pointer transition-transform active:scale-95 shadow-md" style={{ background: `linear-gradient(135deg, ${COLOR_ORANGE}, #B45309)` }}>
                <div className="text-3xl font-bold text-white mb-1">{attention.length}</div>
                <div className="flex items-center gap-1 text-amber-100 text-[10px] font-bold uppercase tracking-tighter"><Clock size={11} /> Atencao</div>
              </div>
            </Link>
            <Link href="/pacientes?status=stable">
              <div className="rounded-xl p-3.5 cursor-pointer transition-transform active:scale-95 shadow-md" style={{ background: `linear-gradient(135deg, ${COLOR_GREEN}, #047857)` }}>
                <div className="text-3xl font-bold text-white mb-1">{stable.length}</div>
                <div className="flex items-center gap-1 text-emerald-100 text-[10px] font-bold uppercase tracking-tighter"><Calendar size={11} /> Estaveis</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Ações Urgentes (Pacientes Antigos) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-[#EF4444]" /> Acoes urgentes
            </h2>
            <Link href="/pacientes"><span className="text-xs text-[#7B2335] font-black uppercase flex items-center gap-0.5">Ver todos <ChevronRight size={13} /></span></Link>
          </div>
          <div className="space-y-2.5">
            {urgentActions.map((patient) => (
              <Link key={patient.id} href={`/pacientes/${patient.id}`}>
                <div className="bg-white rounded-2xl border border-border p-4 flex items-start gap-3 cursor-pointer hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-white" style={{ background: patient.status === "critical" ? COLOR_RED : COLOR_ORANGE }}>
                    {patient.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap"><p className="font-bold text-sm text-slate-800 truncate">{patient.name}</p><RiskTag risk={statusToRisk(patient.status)} /></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{patient.procedure}</p>
                      </div>
                      <StatusBadge status={patient.status} size="sm" />
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SEÇÃO CORRIGIDA: PACIENTES CADASTRADOS (COM CLIQUE) */}
        {recentStored.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Cadastrados recentemente</h2>
              <Link href="/pacientes"><span className="text-xs text-[#7B2335] font-black uppercase flex items-center gap-0.5">Todos <ChevronRight size={13} /></span></Link>
            </div>
            <div className="space-y-2">
              {recentStored.map((sp) => (
                <Link key={sp.id} href={`/pacientes/${sp.id}`}>
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm cursor-pointer hover:border-slate-400 active:scale-[0.98] transition-all relative overflow-hidden">
                    {/* Barra lateral do semáforo */}
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: RISK_COLOR_MAP[sp.finalRisk] || COLOR_GREEN }}></div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-xs text-white shadow-sm" style={{ background: RISK_COLOR_MAP[sp.finalRisk] || COLOR_GREEN }}>
                      {sp.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-sm text-slate-800 truncate">{sp.name}</p>
                        <RiskTag risk={sp.finalRisk} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {sp.age ? `${sp.age} anos` : "Idade N/A"} {sp.imcCategory ? `· IMC: ${sp.imcCategory}` : ""} · D+ 0
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas Rápidas */}
        <div className="bg-slate-900 rounded-3xl p-5 shadow-xl text-white">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/50">Estatísticas Operacionais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black">{Math.round(patients.reduce((a, p) => a + p.painLevel, 0) / (patients.length || 1) * 10) / 10}</div>
              <div className="text-[9px] font-bold uppercase text-white/60 tracking-widest">Média de Dor</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
              <div className="text-2xl font-black">{Math.round(patients.reduce((a, p) => a + p.daysPostProcedure, 0) / (patients.length || 1))}d</div>
              <div className="text-[9px] font-bold uppercase text-white/60 tracking-widest">Média Pós-Proc.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}