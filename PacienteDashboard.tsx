import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "@/contexts";
import {
  calcularPontuacaoRespostas,
  getClassificacaoRisco,
} from "@/data/questionarios";
import DicaSaude from "@/components/DicaSaude";
import AtividadesRecomendadas from "@/components/AtividadesRecomendadas";

interface Prescricao {
  id: string;
  texto: string;
  data: string;
  medico: string;
  orientacoes?: string;
}

interface QuestionarioPendente {
  id: string;
  tipo: string;
  dataEnvio: string;
  perguntas: { id: string; texto: string; opcoes: string[] }[];
}

// Função auxiliar para limpar CPF
const unformatCPF = (cpf: string): string => {
  return cpf?.replace(/\D/g, "") || "";
};

// Funções para mensagens personalizadas
const getMensagemSaudacao = () => {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) {
    return {
      texto: "Bom dia! Comece o dia cuidando da sua saúde",
      emoji: "☀️",
      cor: "from-blue-50 to-indigo-50",
    };
  } else if (hora >= 12 && hora < 18) {
    return {
      texto: "Boa tarde! Não esqueça de beber água",
      emoji: "😊",
      cor: "from-yellow-50 to-orange-50",
    };
  } else if (hora >= 18 && hora < 24) {
    return {
      texto: "Boa noite! Hora de relaxar e cuidar de você",
      emoji: "🌙",
      cor: "from-purple-50 to-pink-50",
    };
  } else {
    return {
      texto: "Que bom ver você! Cuide do seu sono",
      emoji: "💤",
      cor: "from-slate-50 to-gray-50",
    };
  }
};

const getMensagemLembrete = (prescricoes: any[]) => {
  if (prescricoes.length === 0) {
    return {
      texto: "✅ Você não tem medicações ativas. Mantenha-se saudável!",
      cor: "text-green-600",
      bg: "bg-green-50",
    };
  } else if (prescricoes.length === 1) {
    return {
      texto: "💊 Hora da medicação? Não se esqueça!",
      cor: "text-blue-600",
      bg: "bg-blue-50",
    };
  } else {
    return {
      texto: "💊 Você tem várias medicações. Organize seus horários!",
      cor: "text-amber-600",
      bg: "bg-amber-50",
    };
  }
};

const getMensagemFeedback = (pontuacao: number, tipo: string) => {
  const mensagens = {
    baixo: [
      "🌟 Você arrasou! Continue assim, seu sorriso agradece!",
      "🎉 Parabéns! Você está no caminho certo para uma vida saudável!",
      "😁 Uhuuu! Seu coração está feliz com você!",
      "🏆 Você é um exemplo! Continue cuidando da sua saúde!",
    ],
    medio: [
      "📋 Vamos melhorar! Pequenas mudanças fazem grande diferença.",
      "💪 Você consegue! Continue acompanhando sua saúde.",
      "🍎 Que tal uma fruta hoje? Pequenos passos contam!",
      "🌟 Você está no caminho certo! Continue assim!",
    ],
    alto: [
      "⚠️ Atenção! Hora de ligar para seu médico e contar como está.",
      "🩺 Seu corpo está pedindo cuidados. Agende uma consulta!",
      "❤️ Não ignore os sinais. Você merece cuidado!",
      "📞 Entre em contato com seu médico o mais breve possível.",
    ],
    critico: [
      "🚨 URGENTE! Procure atendimento médico AGORA!",
      "🏥 Sua saúde é prioridade! Vá ao hospital imediatamente.",
      "⚠️ Não espere! Ligue para seu médico ou vá ao pronto-socorro.",
      "🆘 Sua vida é importante! Busque ajuda médica agora!",
    ],
  };

  const categoria =
    pontuacao <= 2
      ? "baixo"
      : pontuacao <= 5
        ? "medio"
        : pontuacao <= 9
          ? "alto"
          : "critico";
  const lista = mensagens[categoria];
  const emoji =
    categoria === "baixo"
      ? "🎉"
      : categoria === "medio"
        ? "📋"
        : categoria === "alto"
          ? "⚠️"
          : "🚨";
  return { texto: lista[Math.floor(Math.random() * lista.length)], emoji };
};

export default function PacienteDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth() as any;
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [orientacoes, setOrientacoes] = useState<string[]>([]);
  const [questionarios, setQuestionarios] = useState<QuestionarioPendente[]>(
    [],
  );
  const [showQuestionario, setShowQuestionario] = useState(false);
  const [questionarioAtivo, setQuestionarioAtivo] =
    useState<QuestionarioPendente | null>(null);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [ultimaConsulta, setUltimaConsulta] = useState<string>("");
  const [proximoRetorno, setProximoRetorno] = useState<string>("");
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostasTemp, setRespostasTemp] = useState<Record<string, string>>(
    {},
  );
  const [showResultado, setShowResultado] = useState(false);
  const [resultadoData, setResultadoData] = useState<any>(null);
  const [showConquista, setShowConquista] = useState(false);
  const [conquistaMsg, setConquistaMsg] = useState("");
  const [consultas, setConsultas] = useState<any[]>([]);
  const [condicoesPaciente, setCondicoesPaciente] = useState<string[]>([]);

  const saudacao = getMensagemSaudacao();
  const lembrete = getMensagemLembrete(prescricoes);

  // Função para identificar condições do paciente
  const getCondicoesPaciente = (cpf: string) => {
    const condicoes: string[] = [];
    const allPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    const meusDados = allPatients.find(
      (p: any) => unformatCPF(p.cpf) === unformatCPF(cpf),
    );

    if (meusDados) {
      // Verifica comorbidades
      const comorbidades = meusDados.comorbidades || [];

      if (comorbidades.includes("diabetes") || meusDados.diabetes === "sim") {
        condicoes.push("diabetes");
      }
      if (
        comorbidades.includes("hipertensao") ||
        meusDados.hipertensao === "sim"
      ) {
        condicoes.push("hipertensao");
      }
      if (
        meusDados.tratamentoOdontologico === "sim" ||
        comorbidades.includes("odontologico")
      ) {
        condicoes.push("odontologico");
      }

      // Log para debug
      console.log("Condições do paciente:", condicoes);
    }

    return condicoes;
  };

  useEffect(() => {
    const allPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    const meusDados = allPatients.find(
      (p: any) => unformatCPF(p.cpf) === unformatCPF(user?.cpf),
    );

    if (meusDados) {
      if (meusDados.prescricao) {
        setPrescricoes([
          {
            id: Date.now().toString(),
            texto: meusDados.prescricao,
            data: meusDados.registeredAt,
            medico: meusDados.doctor || "Profissional",
            orientacoes:
              meusDados.encaminhamento || "Siga as orientações médicas",
          },
        ]);
      }
      if (meusDados.encaminhamento) {
        setOrientacoes([meusDados.encaminhamento]);
      }
      if (meusDados.lastConsultDate) {
        setUltimaConsulta(meusDados.lastConsultDate);
      } else if (meusDados.registeredAt) {
        setUltimaConsulta(meusDados.registeredAt);
      }
      if (meusDados.lastConsultDate || meusDados.registeredAt) {
        const dataBase = new Date(
          meusDados.lastConsultDate || meusDados.registeredAt,
        );
        const proximo = new Date(dataBase);
        proximo.setDate(dataBase.getDate() + 30);
        setProximoRetorno(proximo.toISOString());
      }
    }

    // Carregar histórico de consultas
    const cpfLimpo = unformatCPF(user?.cpf);
    const historicoConsultas = JSON.parse(
      localStorage.getItem(`consultas_${cpfLimpo}`) || "[]",
    );
    setConsultas(historicoConsultas);

    // Carregar questionários
    const pendentes = JSON.parse(
      localStorage.getItem(`questionarios_${cpfLimpo}`) || "[]",
    );
    setQuestionarios(pendentes);

    // Verificar conquistas
    const respostasSalvas = JSON.parse(
      localStorage.getItem(`respostas_${cpfLimpo}`) || "[]",
    );
    if (
      respostasSalvas.length >= 3 &&
      !localStorage.getItem(`conquista_3respostas_${cpfLimpo}`)
    ) {
      setConquistaMsg("🎖️ Você é dedicado! 3 questionários respondidos!");
      setShowConquista(true);
      localStorage.setItem(`conquista_3respostas_${cpfLimpo}`, "true");
      setTimeout(() => setShowConquista(false), 5000);
    }

    // Carregar condições do paciente
    if (user?.cpf) {
      const condicoes = getCondicoesPaciente(user.cpf);
      setCondicoesPaciente(condicoes);
    }
  }, [user]);

  const handleResponderQuestionario = (q: QuestionarioPendente) => {
    setQuestionarioAtivo(q);
    setShowQuestionario(true);
    setPerguntaAtual(0);
    setRespostasTemp({});
    setRespostas({});
  };

  const proximaPergunta = () => {
    if (perguntaAtual + 1 < (questionarioAtivo?.perguntas.length || 0)) {
      setPerguntaAtual(perguntaAtual + 1);
    } else {
      handleEnviarRespostas();
    }
  };

  const voltarPergunta = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(perguntaAtual - 1);
    }
  };

  const handleEnviarRespostas = () => {
    if (!questionarioAtivo) return;

    const pontuacao = calcularPontuacaoRespostas(
      questionarioAtivo.perguntas,
      respostas,
    );
    const classificacao = getClassificacaoRisco(pontuacao);
    const feedback = getMensagemFeedback(pontuacao, questionarioAtivo.tipo);

    const respostasSalvas = {
      questionarioId: questionarioAtivo.id,
      tipo: questionarioAtivo.tipo,
      respostas,
      pontuacao: pontuacao,
      classificacao: classificacao.nivel,
      data: new Date().toISOString(),
      pacienteCpf: user?.cpf,
    };

    const historico = JSON.parse(
      localStorage.getItem(`respostas_${user?.cpf}`) || "[]",
    );
    historico.push(respostasSalvas);
    localStorage.setItem(`respostas_${user?.cpf}`, JSON.stringify(historico));

    const novosPendentes = questionarios.filter(
      (q) => q.id !== questionarioAtivo.id,
    );
    setQuestionarios(novosPendentes);
    localStorage.setItem(
      `questionarios_${user?.cpf}`,
      JSON.stringify(novosPendentes),
    );

    setResultadoData({
      pontuacao,
      classificacao: classificacao.nivel,
      mensagem: feedback.texto,
      emoji: feedback.emoji,
      tipo: questionarioAtivo.tipo,
      cor:
        pontuacao <= 2
          ? "bg-green-500"
          : pontuacao <= 5
            ? "bg-yellow-500"
            : pontuacao <= 9
              ? "bg-orange-500"
              : "bg-red-600",
    });
    setShowResultado(true);

    setShowQuestionario(false);
    setQuestionarioAtivo(null);
    setPerguntaAtual(0);
    setRespostasTemp({});
    setRespostas({});
  };

  const getRiscoPaciente = () => {
    const allPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    const meusDados = allPatients.find(
      (p: any) => unformatCPF(p.cpf) === unformatCPF(user?.cpf),
    );
    const risco = meusDados?.finalRisk || "low";

    switch (risco) {
      case "high":
        return {
          texto: "ALTO RISCO",
          cor: "bg-red-100 text-red-700 border-red-300",
        };
      case "medium":
        return {
          texto: "RISCO MÉDIO",
          cor: "bg-orange-100 text-orange-700 border-orange-300",
        };
      default:
        return {
          texto: "RISCO BAIXO",
          cor: "bg-green-100 text-green-700 border-green-300",
        };
    }
  };

  const risco = getRiscoPaciente();

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Cabeçalho */}
      <div className="sticky top-0 z-50 bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#7B2335] flex items-center gap-2">
            <Lucide.User size={28} /> Meu Prontuário
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
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Mensagem de saudação */}
        <div className={`bg-gradient-to-r ${saudacao.cor} rounded-2xl p-4`}>
          <p className="text-lg font-black text-slate-700">
            {saudacao.emoji} {saudacao.texto}
          </p>
        </div>

        {/* Mensagem de lembrete de medicação */}
        <div
          className={`${lembrete.bg} rounded-2xl p-4 border-l-4 ${prescricoes.length > 0 ? "border-l-amber-500" : "border-l-green-500"}`}
        >
          <p className={`font-black ${lembrete.cor}`}>{lembrete.texto}</p>
        </div>

        {/* Boas-vindas */}
        <div className="bg-gradient-to-r from-[#7B2335] to-[#4a1520] rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black">Olá, {user?.name}!</h2>
          <p className="text-white/80 text-sm mt-1">
            Aqui você acompanha suas prescrições e orientações.
          </p>
          <div
            className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${risco.cor} bg-white/10`}
          >
            {risco.texto}
          </div>
        </div>

        {/* Consultas */}
        {(ultimaConsulta || proximoRetorno) && (
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lucide.Calendar size={20} className="text-blue-600" />
              <h3 className="font-black text-blue-800">Minhas Consultas</h3>
            </div>
            {ultimaConsulta && (
              <p className="text-sm text-slate-600">
                📅 Última consulta:{" "}
                {new Date(ultimaConsulta).toLocaleDateString()}
              </p>
            )}
            {proximoRetorno && (
              <p className="text-sm text-slate-600 mt-1">
                🔄 Próximo retorno:{" "}
                {new Date(proximoRetorno).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Orientações */}
        {orientacoes.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lucide.ClipboardList size={20} className="text-amber-600" />
              <h3 className="font-black text-amber-800">Orientações</h3>
            </div>
            {orientacoes.map((o, i) => (
              <p key={i} className="text-sm text-slate-700">
                • {o}
              </p>
            ))}
          </div>
        )}

        {/* Prescrições */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lucide.Pill size={20} className="text-blue-600" />
            <h3 className="font-black text-blue-800">Minhas Prescrições</h3>
          </div>
          {prescricoes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">
              Nenhuma prescrição ativa
            </p>
          ) : (
            prescricoes.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl p-4 mb-3 border border-blue-100"
              >
                <p className="text-sm font-bold text-slate-800 whitespace-pre-line">
                  {p.texto}
                </p>
                {p.orientacoes && (
                  <p className="text-xs text-amber-700 mt-2">
                    ⚠️ {p.orientacoes}
                  </p>
                )}
                <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                  <span>Dr(a). {p.medico}</span>
                  <span>{new Date(p.data).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============================================ */}
        {/* NOVOS COMPONENTES - DICAS E ATIVIDADES */}
        {/* ============================================ */}

        {/* Dicas de Saúde Personalizadas */}
        {condicoesPaciente.length > 0 && (
          <DicaSaude condicoes={condicoesPaciente} />
        )}

        {/* Atividades Recomendadas */}
        {user?.cpf && (
          <AtividadesRecomendadas
            condicoes={condicoesPaciente}
            userCpf={unformatCPF(user.cpf)}
          />
        )}

        {/* Questionários Pendentes */}
        {questionarios.length > 0 && (
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lucide.ClipboardList size={20} className="text-green-600" />
              <h3 className="font-black text-green-800">
                Questionários Pendentes
              </h3>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                {questionarios.length}
              </span>
            </div>
            {questionarios.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-xl p-4 mb-3 border border-green-100"
              >
                <p className="font-bold text-green-800">{q.tipo}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Enviado em: {new Date(q.dataEnvio).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleResponderQuestionario(q)}
                  className="mt-3 px-4 py-2 bg-[#7B2335] text-white rounded-xl font-black text-xs w-full"
                >
                  RESPONDER AGORA
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Histórico de Consultas */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lucide.Calendar size={20} className="text-slate-600" />
            <h3 className="font-black text-slate-700">
              Histórico de Consultas
            </h3>
          </div>
          {consultas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-2">
              Suas consultas aparecerão aqui após o atendimento.
            </p>
          ) : (
            consultas.map((consulta) => (
              <div
                key={consulta.id}
                className="bg-white rounded-xl p-3 mb-2 border border-slate-100"
              >
                <p className="text-xs font-bold text-[#7B2335]">
                  {new Date(consulta.data).toLocaleDateString()}
                </p>
                <p className="text-xs text-slate-600">
                  Dr(a). {consulta.profissional}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {consulta.procedimento}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal do Questionário */}
      {showQuestionario && questionarioAtivo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-[#7B2335] to-[#4a1520] p-6 text-white">
              <div className="flex justify-between items-center mb-3">
                <Lucide.ClipboardList size={24} />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  {perguntaAtual + 1} de {questionarioAtivo.perguntas.length}
                </span>
                <button
                  onClick={() => {
                    setShowQuestionario(false);
                    setQuestionarioAtivo(null);
                    setPerguntaAtual(0);
                    setRespostasTemp({});
                  }}
                  className="text-white/70 hover:text-white"
                >
                  <Lucide.X size={24} />
                </button>
              </div>
              <h3 className="font-black text-xl">{questionarioAtivo.tipo}</h3>
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${((perguntaAtual + 1) / questionarioAtivo.perguntas.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <p className="text-xl font-black text-slate-800 text-center leading-relaxed">
                  {questionarioAtivo.perguntas[perguntaAtual]?.texto}
                </p>
              </div>

              <div className="space-y-3">
                {questionarioAtivo.perguntas[perguntaAtual]?.opcoes.map(
                  (opcao) => (
                    <button
                      key={opcao}
                      onClick={() => {
                        const novaResposta = {
                          ...respostasTemp,
                          [questionarioAtivo.perguntas[perguntaAtual].id]:
                            opcao,
                        };
                        setRespostasTemp(novaResposta);
                        setRespostas(novaResposta);
                        setTimeout(() => proximaPergunta(), 200);
                      }}
                      className={`w-full p-5 rounded-2xl text-center font-bold text-lg transition-all transform active:scale-95 ${
                        respostasTemp[
                          questionarioAtivo.perguntas[perguntaAtual]?.id
                        ] === opcao
                          ? "bg-[#7B2335] text-white shadow-lg"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {opcao}
                    </button>
                  ),
                )}
              </div>

              <div className="flex justify-between mt-8">
                {perguntaAtual > 0 && (
                  <button
                    onClick={voltarPergunta}
                    className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-black hover:bg-slate-300"
                  >
                    ← Voltar
                  </button>
                )}
                <div className="flex-1" />
                {respostasTemp[
                  questionarioAtivo.perguntas[perguntaAtual]?.id
                ] && (
                  <button
                    onClick={proximaPergunta}
                    className="px-6 py-3 bg-[#7B2335] text-white rounded-xl font-black hover:bg-[#8B2B45]"
                  >
                    {perguntaAtual + 1 === questionarioAtivo.perguntas.length
                      ? "✓ FINALIZAR"
                      : "PRÓXIMA →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado */}
      {showResultado && resultadoData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`${resultadoData.cor} p-6 text-white text-center`}>
              <div className="text-6xl mb-4">{resultadoData.emoji}</div>
              <h3 className="text-2xl font-black">Questionário Respondido!</h3>
              <p className="text-lg mt-2">{resultadoData.tipo}</p>
            </div>

            <div className="p-6 text-center">
              <div className="mb-4">
                <span className="text-3xl font-black text-[#7B2335]">
                  {resultadoData.pontuacao}
                </span>
                <span className="text-slate-500"> pontos</span>
              </div>

              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-black mb-4 ${
                  resultadoData.pontuacao <= 2
                    ? "bg-green-100 text-green-700"
                    : resultadoData.pontuacao <= 5
                      ? "bg-yellow-100 text-yellow-700"
                      : resultadoData.pontuacao <= 9
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                Risco: {resultadoData.classificacao}
              </div>

              <p className="text-slate-700 leading-relaxed">
                {resultadoData.mensagem}
              </p>

              <button
                onClick={() => {
                  setShowResultado(false);
                  setResultadoData(null);
                }}
                className="w-full mt-6 py-4 bg-[#7B2335] text-white rounded-2xl font-black text-sm uppercase tracking-wider"
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conquista */}
      {showConquista && (
        <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-xl animate-bounce z-50">
          <p className="text-white font-black text-center">{conquistaMsg}</p>
        </div>
      )}
    </div>
  );
}
