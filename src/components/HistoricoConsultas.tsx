import { useState } from "react";
import * as Lucide from "lucide-react";
import { ConsultaHistorico } from "@/data/types";

interface Props {
  consultas: ConsultaHistorico[];
}

export default function HistoricoConsultas({ consultas }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (consultas.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-slate-50 rounded-lg p-8 text-center">
        <Lucide.FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 mb-1">Sem Consultas Registradas</h3>
        <p className="text-slate-600 text-sm">Nenhuma consulta foi registrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <h2 className="text-2xl font-black text-slate-900 mb-4">📋 Histórico de Consultas</h2>
      
      {consultas.map((consulta) => (
        <div
          key={consulta.id}
          className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          {/* Header da Consulta */}
          <button
            onClick={() => setExpandedId(expandedId === consulta.id ? null : consulta.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-bold text-slate-900">
                    {new Date(consulta.data).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {consulta.profissionalNome} - {consulta.profissionalEspecialidade}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-500 ml-11">
                <span className="font-semibold">Motivo:</span> {consulta.motivo}
              </p>
            </div>

            {/* Risk Badge */}
            {consulta.riskLevel && (
              <div
                className={`ml-4 px-3 py-1 rounded-full font-bold text-sm text-white ${
                  consulta.riskLevel === "high"
                    ? "bg-red-600"
                    : consulta.riskLevel === "medium"
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
              >
                {consulta.riskLevel === "high"
                  ? "🔴 Alto"
                  : consulta.riskLevel === "medium"
                  ? "🟡 Médio"
                  : "🟢 Baixo"}
              </div>
            )}

            <Lucide.ChevronDown
              size={24}
              className={`text-slate-400 transition ${
                expandedId === consulta.id ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Detalhes expandidos */}
          {expandedId === consulta.id && (
            <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
              {/* Comorbidades */}
              {consulta.comorbidities && consulta.comorbidities.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-2">Comorbidades Registradas:</p>
                  <div className="flex flex-wrap gap-2">
                    {consulta.comorbidities.map((comorbidade) => (
                      <span
                        key={comorbidade}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        {comorbidade}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnóstico */}
              {consulta.diagnostico && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">Diagnóstico:</p>
                  <p className="text-slate-700 text-sm bg-white p-3 rounded">{consulta.diagnostico}</p>
                </div>
              )}

              {/* Veredicto Geral */}
              {consulta.vereditoGeral && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">Veredicto Geral:</p>
                  <p className="text-slate-700 text-sm bg-white p-3 rounded">{consulta.vereditoGeral}</p>
                </div>
              )}

              {/* Conversa */}
              {consulta.conversa && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">Anotações:</p>
                  <p className="text-slate-700 text-sm bg-white p-3 rounded italic">{consulta.conversa}</p>
                </div>
              )}

              {/* Prescrições/Medicações */}
              {(consulta.prescricoes?.length || 0) > 0 && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-2">💊 Prescrições:</p>
                  <div className="bg-white rounded p-3 space-y-2">
                    {consulta.prescricoes?.map((prescricao, idx) => (
                      <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        {prescricao}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicações com Detalhes */}
              {(consulta.medicacoes?.length || 0) > 0 && (
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-2">💉 Medicações:</p>
                  <div className="bg-white rounded p-3 space-y-3">
                    {consulta.medicacoes?.map((med, idx) => (
                      <div key={idx} className="border-l-2 border-slate-300 pl-3">
                        <p className="font-semibold text-slate-900">{med.nome}</p>
                        <p className="text-sm text-slate-700">Dose: {med.dose}</p>
                        <p className="text-sm text-slate-700">Por: {med.dias}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
                ⏰ Registrado em {new Date(consulta.data).toLocaleTimeString("pt-BR")}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
