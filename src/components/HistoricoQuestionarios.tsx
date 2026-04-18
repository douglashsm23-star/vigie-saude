import { useState } from "react";
import * as Lucide from "lucide-react";
import { RespostaQuestionario } from "@/data/types";

interface Props {
  respostas: RespostaQuestionario[];
}

export default function HistoricoQuestionarios({ respostas }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (respostas.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-slate-50 rounded-lg p-8 text-center">
        <Lucide.ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-slate-900 mb-1">Sem Questionários Respondidos</h3>
        <p className="text-slate-600 text-sm">Comece a responder questionários para monitorar sua saúde.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <h2 className="text-2xl font-black text-slate-900 mb-4">📊 Histórico de Monitoramento</h2>

      {respostas.map((resposta) => (
        <div
          key={resposta.id}
          className={`rounded-lg border-2 shadow-sm overflow-hidden hover:shadow-md transition ${
            resposta.classificacaoRisco.nivel === "CRÍTICO"
              ? "border-red-300 bg-red-50"
              : resposta.classificacaoRisco.nivel === "MUITO ALTO"
              ? "border-red-200 bg-red-50"
              : resposta.classificacaoRisco.nivel === "ALTO"
              ? "border-orange-200 bg-orange-50"
              : resposta.classificacaoRisco.nivel === "MÉDIO"
              ? "border-yellow-200 bg-yellow-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          {/* Header */}
          <button
            onClick={() => setExpandedId(expandedId === resposta.id ? null : resposta.id)}
            className="w-full p-4 flex items-center justify-between hover:opacity-80 transition"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{resposta.classificacaoRisco.emoji}</span>
                <div>
                  <p className="font-black text-lg text-slate-900">{resposta.comorbidade}</p>
                  <p className="text-sm text-slate-600">
                    {new Date(resposta.dataResposta).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={`${resposta.classificacaoRisco.cor} text-white px-4 py-2 rounded-full font-bold text-sm ml-4 text-center`}>
              <p className="font-black">{resposta.classificacaoRisco.alerta}</p>
              <p className="text-xs">Pontuação: {resposta.pontuacao}</p>
            </div>

            <Lucide.ChevronDown
              size={24}
              className={`text-slate-400 transition ml-4 ${
                expandedId === resposta.id ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Detalhes Expandidos */}
          {expandedId === resposta.id && (
            <div className={`border-t-2 p-4 space-y-4 ${
              resposta.classificacaoRisco.nivel === "CRÍTICO"
                ? "border-red-300 bg-red-100/50"
                : resposta.classificacaoRisco.nivel === "MUITO ALTO"
                ? "border-red-200 bg-red-100/50"
                : resposta.classificacaoRisco.nivel === "ALTO"
                ? "border-orange-200 bg-orange-100/50"
                : resposta.classificacaoRisco.nivel === "MÉDIO"
                ? "border-yellow-200 bg-yellow-100/50"
                : "border-green-200 bg-green-100/50"
            }`}>
              {/* Mensagem de Classificação */}
              <div className={`${resposta.classificacaoRisco.cor} text-white rounded-lg p-4`}>
                <p className="font-bold text-lg mb-1">{resposta.classificacaoRisco.alerta}</p>
                <p className="text-sm">{resposta.classificacaoRisco.mensagem}</p>
              </div>

              {/* Score Detalhado */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-slate-900">Análise de Pontuação</p>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-600">{resposta.pontuacao}</p>
                    <p className="text-xs text-slate-600">pontos</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nível de Risco Identificado:</span>
                    <span className="font-bold">{resposta.classificacaoRisco.nivel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Comorbidade Monitorada:</span>
                    <span className="font-bold">{resposta.comorbidade}</span>
                  </div>
                </div>
              </div>

              {/* Respostas Detalhadas */}
              <div>
                <p className="font-bold text-slate-900 mb-3">Suas Respostas:</p>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(resposta.respostas).map(([perguntaId, resposta]) => (
                    <div
                      key={perguntaId}
                      className="bg-white rounded p-3 flex items-start gap-3 border-l-4 border-blue-400"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Pergunta: {perguntaId}</p>
                        <p className="text-sm text-blue-600 font-bold mt-1">Resposta: {resposta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximo Questionário */}
              {resposta.dataProxima && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-blue-900">
                    📅 Próximo Questionário Recomendado:
                  </p>
                  <p className="text-sm text-blue-700 font-bold mt-1">
                    {new Date(resposta.dataProxima).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                ⏰ Respondido em {new Date(resposta.dataResposta).toLocaleTimeString("pt-BR")}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
