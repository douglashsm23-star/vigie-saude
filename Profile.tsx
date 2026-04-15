import { useLocation } from "wouter";
import {
  Settings,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Stethoscope,
  Heart,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts";

const menuItems = [
  {
    icon: Bell,
    label: "Notificações",
    sub: "Alertas e lembretes ativos",
    testid: "menu-notifications",
  },
  {
    icon: Shield,
    label: "Privacidade e LGPD",
    sub: "Gerenciar dados dos pacientes",
    testid: "menu-privacy",
  },
  {
    icon: Settings,
    label: "Configurações",
    sub: "Personalizar o sistema",
    testid: "menu-settings",
  },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  const specialtyLabel =
    user?.role === "estudante"
      ? `Estudante de ${user?.specialty === "odontologia" ? "Odontologia" : "Medicina"}`
      : user?.specialty === "odontologia"
        ? "Dentista"
        : user?.specialty === "medicina"
          ? "Médico"
          : "Paciente";

  const SpecialtyIcon =
    user?.specialty === "odontologia"
      ? Stethoscope
      : user?.specialty === "medicina"
        ? Heart
        : User;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-lg text-slate-800">Perfil</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {user?.photo ? (
              <img
                src={user.photo}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
                style={{ background: "#7B2335" }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base text-slate-800 truncate">
                {user?.name || "Usuário"}
              </h2>
              <p className="text-xs text-slate-500">{specialtyLabel}</p>
              <div className="flex items-center gap-1 mt-1">
                <SpecialtyIcon size={11} style={{ color: "#059669" }} />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "#059669" }}
                >
                  {user?.localTrabalho || "Clínica VIGIE"}
                </span>
              </div>
            </div>
          </div>

          {/* Professional ID (registroProfissional) */}
          {user?.registroProfissional && (
            <div className="mt-3 flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <ShieldCheck size={13} className="text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-800">
                {user.specialty === "odontologia" ? "CRO" : "CRM"}:{" "}
                {user.registroProfissional}
              </span>
              <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                Verificado
              </span>
            </div>
          )}

          {/* Matrícula (estudante) */}
          {user?.matricula && (
            <div
              className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "#3B82F610" }}
            >
              <ShieldCheck size={13} style={{ color: "#3B82F6" }} />
              <span className="text-[11px] font-semibold text-slate-800">
                Matrícula: {user.matricula}
              </span>
              {user.university && (
                <span className="ml-auto text-[9px] font-medium text-slate-500 truncate max-w-[40%]">
                  {user.university}
                </span>
              )}
            </div>
          )}

          {/* Endereço */}
          {user?.endereco && (
            <p className="mt-2 text-[11px] text-slate-500 ml-1">
              {user.endereco}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${i > 0 ? "border-t border-slate-200" : ""}`}
                data-testid={item.testid}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-slate-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
            );
          })}
        </div>

        {/* App info */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                VIGIE
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Versão 1.0.0 — Odonto & Medicina
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
              style={{ background: "#7B2335" }}
            >
              v1.0
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 font-medium text-sm hover:bg-red-50 transition-colors"
          style={{ color: "#7B2335" }}
          data-testid="button-logout"
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
