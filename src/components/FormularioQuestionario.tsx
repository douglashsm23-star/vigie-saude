import { useState } from "react";
import * as Lucide from "lucide-react";
import { QuestionarioConfig, calcularPontuacaoRespostas, getClassificacaoRisco } from "@/data/questionariosConfig";

interface Props {
  questionario: QuestionarioConfig;
  onSubmit: (respostas: Record<string, string>, pontuacao: number, classificacao: any) => void;
}

export default function FormularioQuestionario({ questionario, onSubmit }: Props) {
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [currentPerguntaIndex, setCurrentPerguntaIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);

  const currentPergunta = questionario.perguntas[currentPerguntaIndex];
  const totalPerguntas = questionario.perguntas.length;
  const progressPercent = ((currentPerguntaIndex + 1) / totalPerguntas) * 100;

  const handleResposta = (opcao: string) => {
    setRespostas(prev => ({
      ...prev,
      [currentPergunta.id]: opcao,
    }));
  };

  const handleProxima = () => {
    if (!respostas[currentPergunta.id]) {
      alert("Por favor, selecione uma resposta.");
      return;
    }
    
    if (currentPerguntaIndex < totalPerguntas - 1) {
      setCurrentPerguntaIndex(prev => prev + 1);
    } else {
      setShowReview(true);
    }
  };

  const handleAnterior = () => {
    if (currentPerguntaIndex > 0) {
      setCurrentPerguntaIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const pontuacao = calcularPontuacaoRespostas(questionario.perguntas, respostas);
    const classificacao = getClassificacaoRisco(pontuacao);
    onSubmit(respostas, pontuacao, classificacao);
  };

  if (showReview) {
    const pontuacao = calcularPontuacaoRespostas(questionario.perguntas, respostas);
    const classificacao = getClassificacaoRisco(pontuacao);

    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className={`${classificacao.cor} text-white rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{classificacao.emoji}</span>
            <h2 className="text-2xl font-bold">{classificacao.alerta}</h2>
          </div>
          <p className="text-lg mb-4">{classificacao.mensagem}</p>
          <div className="bg-white/20 rounded p-4">
            <p className="text-sm font-semibold">Pontuação Total: <span className="text-2xl font-black">{pontuacao}</span></p>
            <p className="text-sm mt-2">Nível de Risco: <span className="font-bold">{classificacao.nivel}</span></p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h3 className="font-bold text-lg">Resumo de Respostas</h3>
          {questionario.perguntas.map(pergunta => (
            <div key={pergunta.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-sm text-gray-700">{pergunta.texto}</p>
              <p className="text-blue-600 font-bold">Sua resposta: {respostas[pergunta.id]}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowReview(false);
              setCurrentPerguntaIndex(0);
            }}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
          >
            ← Voltar
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-1 ${classificacao.cor} text-white font-bold py-3 rounded-lg transition hover:opacity-90 flex items-center justify-center gap-2`}
          >
            <Lucide.Check size={20} />
            Confirmar e Enviar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-2">{questionario.titulo}</h1>
        <p className="text-slate-600 text-sm">Comorbidade: <span className="font-semibold">{questionario.comorbidade}</span></p>
        {questionario.classificacaoInternacional && (
          <p className="text-slate-500 text-xs mt-1">📚 {questionario.classificacaoInternacional}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">
            Pergunta {currentPerguntaIndex + 1} de {totalPerguntas}
          </span>
          <span className="text-sm font-bold text-blue-600">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Pergunta Atual */}
      <div className="mb-8 py-6 border-l-4 border-blue-600 pl-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {currentPergunta.texto}
          {currentPergunta.alertaUrgente && (
            <span className="ml-2 text-red-600 font-black">⚠️ URGENTE</span>
          )}
        </h2>

        {/* Opções de Resposta */}
        <div className="space-y-3">
          {currentPergunta.opcoes.map(opcao => (
            <button
              key={opcao}
              onClick={() => handleResposta(opcao)}
              className={`w-full p-4 rounded-lg font-semibold transition-all ${
                respostas[currentPergunta.id] === opcao
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              {opcao}
            </button>
          ))}
        </div>
      </div>

      {/* Botões de Navegação */}
      <div className="flex gap-3">
        <button
          onClick={handleAnterior}
          disabled={currentPerguntaIndex === 0}
          className={`flex-1 py-3 rounded-lg font-bold transition ${
            currentPerguntaIndex === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-200 hover:bg-slate-300 text-slate-800"
          }`}
        >
          ← Anterior
        </button>
        <button
          onClick={handleProxima}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {currentPerguntaIndex === totalPerguntas - 1 ? (
            <>
              <Lucide.Eye size={18} />
              Revisar Respostas
            </>
          ) : (
            <>
              Próxima →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
