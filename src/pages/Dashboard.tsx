import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { patients } from "@/data/patients";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredPatients } from "@/store/patientStore";

export default function Dashboard() {
  const { user } = useAuth() as any;
  const [, setLocation] = useLocation();
  const [realPatients, setRealPatients] = useState<any[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const data = getStoredPatients();
    setRealPatients(data || []);
  }, []);

  const criticalCount = (patients as any[]).filter(p => p.status === "critical").length;
  const attentionCount = (patients as any[]).filter(p => p.status === "attention").length;
  const stableCount = (patients as any[]).filter(p => p.status === "stable").length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-10 font-sans">
      {/* Navbar Moderna */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-[#7B2335] p-2 rounded-xl shadow-lg shadow-red-900/20">
            <Lucide.ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800">VIGIE SAÚDE</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAlertVisible(!alertVisible)}
            className="bg-[#F87171] hover:bg-[#EF4444] text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Lucide.AlertTriangle size={18} /> ALERTA
          </button>
          <button onClick={() => setLocation("/logout")} className="bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-200">
            <Lucide.LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      {alertVisible && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-600 text-white rounded-[32px] p-6 shadow-xl shadow-red-200 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] font-black">Alerta de Prioridade</p>
              <p className="mt-2 text-base">Todos os pacientes críticos devem ser revisados imediatamente.</p>
            </div>
            <button
              onClick={() => setAlertVisible(false)}
              className="text-white/80 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        
        {/* Banner Principal - Douglas */}
        <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200 border border-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-2">
              {user?.specialty === "odontologia"
                ? "Cirurgião-Dentista Responsável"
                : user?.specialty === "medicina"
                ? "Médico Responsável"
                : "Profissional de Saúde Responsável"}
            </p>
            <h1 className="text-4xl font-black text-slate-900 uppercase leading-none tracking-tight">
              {user?.role === "profissional" ? `Dr(a). ${user?.name}` : user?.name || "Usuário"}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={() => setLocation(`/pacientes/novo/${user?.specialty || "medicina"}`)}
              className="bg-[#7B2335] hover:scale-105 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-red-900/20 transition-all flex items-center gap-3"
            >
              <Lucide.UserPlus size={24} />
              NOVO PACIENTE
            </button>
            <button
              onClick={() => setLocation("/pacientes")}
              className="bg-slate-800 hover:bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-slate-900/20 transition-all flex items-center gap-3"
            >
              <Lucide.Users size={24} />
              MEUS PACIENTES
            </button>
          </div>
        </div>

        {/* Alerta de Risco */}
        {criticalCount > 0 && (
          <div className="bg-red-600 rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl shadow-red-200 animate-pulse">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 p-4 rounded-2xl"><Lucide.AlertCircle size={32} /></div>
              <div>
                <p className="text-sm font-black uppercase opacity-80 tracking-widest">Alerta Crítico</p>
                <p className="text-xl font-bold">{criticalCount} pacientes precisam de atenção imediata</p>
              </div>
            </div>
            <Lucide.ArrowRightCircle size={32} className="opacity-50" />
          </div>
        )}

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <Lucide.Users className="text-blue-600 mb-4" size={32} />
            <p className="text-5xl font-black text-slate-800">{realPatients.length + patients.length}</p>
            <p className="font-bold text-slate-400 uppercase text-xs tracking-widest mt-2">Total de Pacientes</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <Lucide.Activity className="text-amber-500 mb-4" size={32} />
            <p className="text-5xl font-black text-slate-800">{attentionCount}</p>
            <p className="font-bold text-slate-400 uppercase text-xs tracking-widest mt-2">Em Observação</p>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <Lucide.CheckCircle2 className="text-green-500 mb-4" size={32} />
            <p className="text-5xl font-black text-slate-800">{stableCount}</p>
            <p className="font-bold text-slate-400 uppercase text-xs tracking-widest mt-2">Casos Estáveis</p>
          </div>
        </div>

        {/* Rodapé Nestor Piva */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Unidade de Saúde</p>
            <p className="text-xl font-bold italic tracking-tighter">UNIDADE NESTOR PIVA</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Identificação</p>
            <p className="text-lg font-bold">CRO-SE 12345</p>
          </div>
        </div>
      </main>
    </div>
  );
}