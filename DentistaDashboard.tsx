import { useAuth } from "@/contexts";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function DentistaDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-[#7B2335] flex items-center gap-2">
          <Lucide.Smile size={28} /> Painel do Dentista
        </h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={() => {
              logout();
              setLocation("/");
            }}
            className="text-red-500 text-sm font-bold flex items-center gap-1"
          >
            <Lucide.LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-2xl mb-6">
        <p className="text-slate-600">
          Bem-vindo, <span className="font-bold">Dr(a). {user?.name}</span>
        </p>
        {user?.registroProfissional && (
          <p className="text-xs text-slate-400">
            CRO: {user.registroProfissional}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-4">
        <button
          onClick={() => setLocation("/pacientes/novo")}
          className="w-full p-5 bg-[#7B2335] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-[#8B2B45] transition-all"
        >
          <Lucide.PlusCircle size={20} /> NOVA CONSULTA ODONTOLÓGICA
        </button>

        <button
          onClick={() => setLocation("/pacientes")}
          className="w-full p-5 bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 transition-all"
        >
          <Lucide.Users size={20} /> MEUS PACIENTES
        </button>

        <button className="w-full p-5 border-2 border-slate-200 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:border-[#7B2335] hover:text-[#7B2335] transition-all">
          <Lucide.Calendar size={20} /> AGENDA
        </button>

        <button className="w-full p-5 border-2 border-slate-200 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:border-[#7B2335] hover:text-[#7B2335] transition-all">
          <Lucide.ClipboardList size={20} /> PROTOCOLOS
        </button>
      </div>
    </div>
  );
}
