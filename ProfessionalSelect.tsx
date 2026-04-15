import { useLocation } from "wouter";
import { ChevronLeft, Stethoscope, Heart, GraduationCap } from "lucide-react";

export default function ProfessionalSelect() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            data-testid="btn-back"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-base text-foreground">Area de atuacao</h1>
            <p className="text-[11px] text-muted-foreground">Selecione sua categoria</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Logo compact */}
        <div className="mb-8 text-center">
          <span
            className="font-bold text-2xl tracking-widest"
            style={{ color: "#7B2335", letterSpacing: "0.18em" }}
          >
            VIGIE
          </span>
          <p className="text-xs text-muted-foreground mt-1">Profissional de Saude</p>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <p className="text-center text-sm font-semibold text-foreground mb-1">
            Qual e a sua area?
          </p>

          {/* Odontologia */}
          <button
            onClick={() => setLocation("/auth?role=profissional&specialty=odontologia")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/50 transition-all active:scale-[0.98]"
            data-testid="btn-odontologia"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#7B233520" }}
            >
              <Stethoscope size={24} style={{ color: "#7B2335" }} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm text-foreground">Odontologia</p>
              <p className="text-xs text-muted-foreground mt-0.5">Dentista, Periodontista, Especialista</p>
            </div>
            <div
              className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
              style={{ background: "#7B233515", color: "#7B2335" }}
            >
              CRO
            </div>
          </button>

          {/* Medicina */}
          <button
            onClick={() => setLocation("/auth?role=profissional&specialty=medicina")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-accent/50 transition-all active:scale-[0.98]"
            data-testid="btn-medicina"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#05966920" }}
            >
              <Heart size={24} style={{ color: "#059669" }} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm text-foreground">Medicina</p>
              <p className="text-xs text-muted-foreground mt-0.5">Medico, Especialista clinico</p>
            </div>
            <div
              className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
              style={{ background: "#05966915", color: "#059669" }}
            >
              CRM
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-medium">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Estudante */}
          <button
            onClick={() => setLocation("/auth?role=estudante")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-border hover:border-blue-300 transition-all active:scale-[0.98]"
            data-testid="btn-estudante"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#3B82F615" }}
            >
              <GraduationCap size={24} style={{ color: "#3B82F6" }} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-sm text-foreground">Estudante</p>
              <p className="text-xs text-muted-foreground mt-0.5">Graduacao em Odonto ou Medicina</p>
            </div>
            <div
              className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0"
              style={{ background: "#3B82F615", color: "#3B82F6" }}
            >
              Matricula
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
