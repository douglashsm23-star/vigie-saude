import { useAuth } from "@/contexts";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";

export default function EstudanteDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-[#7B2335] flex items-center gap-2">
          <Lucide.GraduationCap size={28} /> Painel do Estudante
        </h1>
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

      <div className="bg-amber-50 p-4 rounded-2xl mb-6">
        <p className="text-slate-600">
          Bem-vindo, <span className="font-bold">{user?.name}</span>
        </p>
        {user?.matricula && (
          <p className="text-xs text-slate-400">Matrícula: {user.matricula}</p>
        )}
        {user?.university && (
          <p className="text-xs text-slate-400">
            Universidade: {user.university}
          </p>
        )}
        <p className="text-xs text-amber-700 mt-2">
          ⚠️ Todos os atendimentos devem ser supervisionados por um professor.
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        <button
          onClick={() => setLocation("/pacientes/novo")}
          className="w-full p-5 bg-[#7B2335] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-[#8B2B45] transition-all"
        >
          <Lucide.PlusCircle size={20} /> NOVA CONSULTA
        </button>

        <button
          onClick={() => setLocation("/pacientes")}
          className="w-full p-5 bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 transition-all"
        >
          <Lucide.Users size={20} /> MEUS PACIENTES
        </button>
      </div>
    </div>
  );
}
