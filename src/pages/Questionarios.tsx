import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import * as Lucide from "lucide-react";
import { getQuestionarioPorComorbidade, questionariosConfig } from "@/data/questionariosConfig";
import { salvarRespostaQuestionario, getRespostasDosPaciente } from "@/store/questionarioStore";
import { RespostaQuestionario } from "@/data/types";
import FormularioQuestionario from "@/components/FormularioQuestionario";
import HistoricoQuestionarios from "@/components/HistoricoQuestionarios";

export default function QuestionarioPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/questionarios/:pacienteId/:comorbidade?");

  const pacienteId = params?.pacienteId ?? "";
  const comorbidadeSelecionada = params?.comorbidade;

  const [questionarioAtual, setQuestionarioAtual] = useState<any>(null);
  const [respostasHistorico, setRespostasHistorico] = useState<RespostaQuestionario[]>([]);
  const [showFormulario, setShowFormulario] = useState(false);

  useEffect(() => {
    if (!match || !pacienteId) {
      setLocation("/pacientes");
      return;
    }

    // Carregar histórico
    const historico = getRespostasDosPaciente(pacienteId);
    setRespostasHistorico(historico);

    // Se tem comorbidade específica, carregar aquele questionário
    if (comorbidadeSelecionada) {
      const questionario = getQuestionarioPorComorbidade(decodeURIComponent(comorbidadeSelecionada));
      if (questionario) {
        setQuestionarioAtual(questionario);
        setShowFormulario(true);
      }
    }
  }, [match, pacienteId, comorbidadeSelecionada]);

  const handleSelecionarQuestionario = (comorbidade: string) => {
    const questionario = getQuestionarioPorComorbidade(comorbidade);
    if (questionario) {
      setQuestionarioAtual(questionario);
      setShowFormulario(true);
    }
  };

  const handleSubmitQuestionario = (
    respostas: Record<string, string>,
    pontuacao: number,
    classificacao: any
  ) => {
    const dataProxima = new Date();
    dataProxima.setDate(dataProxima.getDate() + questionarioAtual.frequenciaDias);

    const novaResposta: RespostaQuestionario = {
      id: crypto.randomUUID(),
      pacienteId,
      questionarioId: questionarioAtual.id,
      comorbidade: questionarioAtual.comorbidade,
      respostas,
      pontuacao,
      classificacaoRisco: classificacao,
      dataResposta: new Date().toISOString(),
      dataProxima: dataProxima.toISOString(),
    };

    salvarRespostaQuestionario(novaResposta);

    // Atualizar histórico
    const novoHistorico = [novaResposta, ...respostasHistorico];
    setRespostasHistorico(novoHistorico);

    // Voltar para seleção
    setShowFormulario(false);
    setQuestionarioAtual(null);

    alert("✅ Questionário respondido com sucesso!");
  };

  if (showFormulario && questionarioAtual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => {
              setShowFormulario(false);
              setQuestionarioAtual(null);
            }}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition"
          >
            <Lucide.ChevronLeft size={20} />
            Voltar
          </button>
          <FormularioQuestionario
            questionario={questionarioAtual}
            onSubmit={handleSubmitQuestionario}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">📊 Questionários de Saúde</h1>
            <p className="text-slate-600 text-sm">Monitore sua saúde respondendo aos questionários</p>
          </div>
          <button
            onClick={() => setLocation("/pacientes")}
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-semibold transition"
          >
            <Lucide.X size={18} />
            Fechar
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Seleção de Questionários */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-black text-slate-900 mb-4">Escolha um questionário</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questionariosConfig.map((q) => {
              const ultimaResposta = respostasHistorico.find(r => r.questionarioId === q.id);
              const podeResponder = !ultimaResposta || new Date(ultimaResposta.dataProxima || '') <= new Date();

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelecionarQuestionario(q.comorbidade)}
                  disabled={!podeResponder}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    podeResponder
                      ? "bg-white border-blue-300 hover:border-blue-600 hover:shadow-md cursor-pointer"
                      : "bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                  }`}
                >
                  <h3 className="font-bold text-slate-900 mb-1">{q.titulo}</h3>
                  <p className="text-sm text-slate-600 mb-2">{q.comorbidade}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {q.perguntas.length} perguntas • {q.frequenciaDias} dias
                    </span>
                    {podeResponder ? (
                      <Lucide.ArrowRight className="text-blue-600" size={18} />
                    ) : (
                      <span className="text-xs text-slate-500">
                        {ultimaResposta ? `Próxima: ${new Date(ultimaResposta.dataProxima!).toLocaleDateString("pt-BR")}` : ""}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Histórico */}
        {respostasHistorico.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <HistoricoQuestionarios respostas={respostasHistorico} />
          </div>
        )}
      </main>
    </div>
  );
}
