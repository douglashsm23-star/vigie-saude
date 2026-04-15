import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { protocols } from "@/data/patients";

function ProtocolCard({ protocol }: { protocol: typeof protocols[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white rounded-xl border border-border shadow-sm overflow-hidden transition-all"
      data-testid={`protocol-card-${protocol.id}`}
    >
      <button
        className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
        data-testid={`protocol-toggle-${protocol.id}`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#7B233520", color: "#7B2335" }}
            >
              {protocol.specialty}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock size={10} /> {protocol.duration}
            </span>
          </div>
          <p className="font-semibold text-sm text-foreground">{protocol.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{protocol.description}</p>
        </div>
        <div className="shrink-0 mt-1">
          {expanded
            ? <ChevronUp size={18} className="text-muted-foreground" />
            : <ChevronDown size={18} className="text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 pt-3">{protocol.description}</p>
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Checkpoints
          </h4>
          <div className="space-y-2">
            {protocol.checkpoints.map((checkpoint, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-[#059669] shrink-0 mt-0.5" />
                <span className="text-xs text-foreground">{checkpoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Protocols() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-bold text-lg text-foreground">Protocolos</h1>
          <p className="text-xs text-muted-foreground">Protocolos de monitoramento pos-procedimento</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <BookOpen size={12} />
          <span>{protocols.length} protocolos cadastrados</span>
        </div>

        {protocols.map((protocol) => (
          <ProtocolCard key={protocol.id} protocol={protocol} />
        ))}

        <div
          className="rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
          data-testid="button-add-protocol"
        >
          <p className="text-xs font-medium text-muted-foreground">+ Adicionar novo protocolo</p>
        </div>
      </div>
    </div>
  );
}
