import { useState, useEffect } from "react";
import * as Lucide from "lucide-react";

interface Resposta {
  id: string;
  questionarioId: string;
  tipo: string;
  respostas: Record<string, string>;
  pontuacao: number;
  classificacao: string;
  data: string;
}

interface HistoricoRespostasProps {
  pacienteCpf: string;
}

export default function HistoricoRespostas({ pacienteCpf }: HistoricoRespostasProps) {
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (pacienteCpf) {
      carregarHistorico();
    } else {
      setCarregando(false);
    }
  }, [pacienteCpf]);

  const carregarHistorico = async () => {
    setCarregando(true);
    try {
      const localRespostas = JSON.parse(localStorage.getItem(`respostas_${pacienteCpf}`) || "[]");
      // Garantir que é um array
      const respostasArray = Array.isArray(localRespostas) ? localRespostas : [];
      const ordenadas = respostasArray.sort((a: Resposta, b: Resposta) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      setRespostas(ordenadas);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setRespostas([]);
    } finally {
      setCarregando(false);
    }
  };

  const getCorClassificacao = (classificacao: string) => {
    switch (classificacao) {
      case "BAIXO": return "bg-green-100 text-green-700";
      case "MÉDIO": return "bg-yellow-100 text-yellow-700";
      case "ALTO": return "bg-orange-100 text-orange-700";
      case "MUITO ALTO": return "bg-red-100 text-red-700";
      case "CRÍTICO": return "bg-red-700 text-white";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getIconeClassificacao = (classificacao: string) => {
    switch (classificacao) {
      case "BAIXO": return <Lucide.CheckCircle className="w-4 h-4 text-green-600" />;
      case "MÉDIO": return <Lucide.Activity className="w-4 h-4 text-yellow-600" />;
      case "ALTO": return <Lucide.AlertCircle className="w-4 h-4 text-orange-600" />;
      case "MUITO ALTO": return <Lucide.AlertTriangle className="w-4 h-4 text-red-600" />;
      case "CRÍTICO": return <Lucide.ShieldAlert className="w-4 h-4 text-white" />;
      default: return <Lucide.ClipboardList className="w-4 h-4" />;
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B2335]"></div>
      </div>
    );
  }

  if (!respostas || respostas.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl">
        <Lucide.ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500">Nenhum questionário respondido ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
        <Lucide.ClipboardList className="w-5 h-5 text-[#7B2335]" />
        Histórico de Classificações de Risco
      </h3>
      
      <div className="space-y-3">
        {respostas.map((resp) => (
          <div 
            key={resp.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandido(expandido === resp.id ? null : resp.id)}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getCorClassificacao(resp.classificacao)}`}>
                    {getIconeClassificacao(resp.classificacao)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{resp.tipo || "Questionário"}</p>
                    <p className="text-xs text-slate-500">
                      {resp.data ? new Date(resp.data).toLocaleDateString() : "Data desconhecida"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#7B2335]">{resp.pontuacao || 0}</p>
                    <p className="text-[10px] text-slate-400">pontos</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCorClassificacao(resp.classificacao)}`}>
                    {resp.classificacao || "N/A"}
                  </span>
                  <Lucide.ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandido === resp.id ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            
            {expandido === resp.id && resp.respostas && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Respostas detalhadas</p>
                <div className="space-y-2">
                  {Object.entries(resp.respostas).map(([perguntaId, resposta]) => (
                    <div key={perguntaId} className="bg-white rounded-lg p-3 border border-slate-100">
                      <p className="text-xs font-medium text-slate-500">Pergunta:</p>
                      <p className="text-sm font-bold text-slate-700">{String(resposta)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
