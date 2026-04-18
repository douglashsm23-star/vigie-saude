import { useLocation } from "wouter";
import { Stethoscope, SmilePlus, ShieldCheck } from "lucide-react";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top brand area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="mb-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
            style={{ background: "linear-gradient(135deg, #7B2335, #9B2E44)" }}
          >
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1
            className="text-4xl font-bold tracking-widest text-center"
            style={{ color: "#7B2335", letterSpacing: "0.22em" }}
            data-testid="logo-welcome"
          >
            VIGIE
          </h1>
          
        </div>

        {/* Divider */}
        <div className="my-10 w-full max-w-xs">
          <div className="h-px bg-border" />
        </div>

        {/* Choice cards */}
        <div className="w-full max-w-xs space-y-3">
          <p className="text-center text-sm font-semibold text-foreground mb-4">
            Como voce esta acessando?
          </p>

          {/* Profissional */}
          <button
            onClick={() => setLocation("/profissional")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 transition-all active:scale-[0.98] group"
            style={{ background: "white" }}
            data-testid="btn-profissional"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
              style={{ background: "#7B233315" }}
            >
              <Stethoscope size={24} style={{ color: "#7B2335" }} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Sou Profissional</p>
              <p className="text-xs text-muted-foreground mt-0.5">Cirurgiao Dentista e Medico</p>
            </div>
            <div
              className="ml-auto w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#7B233315" }}
            >
              <span style={{ color: "#7B2335", fontSize: "14px", fontWeight: "bold" }}>›</span>
            </div>
          </button>

          {/* Paciente */}
          <button
            onClick={() => setLocation("/auth?role=paciente")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-accent/50 transition-all active:scale-[0.98] group"
            style={{ background: "white" }}
            data-testid="btn-paciente"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#05966915" }}
            >
              <SmilePlus size={24} style={{ color: "#059669" }} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Sou Paciente</p>
              <p className="text-xs text-muted-foreground mt-0.5">Acompanhe sua recuperacao</p>
            </div>
            <div
              className="ml-auto w-6 h-6 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#05966915" }}
            >
              <span style={{ color: "#059669", fontSize: "14px", fontWeight: "bold" }}>›</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-10 text-center">
        <p className="text-[11px] text-muted-foreground">
          Plataforma segura conforme LGPD
        </p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <ShieldCheck size={10} style={{ color: "#059669" }} />
          <span className="text-[10px]" style={{ color: "#059669" }}>Dados protegidos</span>
        </div>
      </div>
    </div>
  );
}
