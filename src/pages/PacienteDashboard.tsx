import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  QuestionarioConfig,
  calcularPontuacaoRespostas,
  getClassificacaoRisco,
} from "@/data/questionariosConfig";
import { getRespostasDosPaciente, getConsultasDoPaciente, getMedicacoesDoPaciente, getUltimaRespostaPaciente } from "@/store/questionarioStore";
import { RespostaQuestionario, ConsultaHistorico, RemindRemedicacao } from "@/data/types";
import HistoricoQuestionarios from "@/components/HistoricoQuestionarios";
import HistoricoConsultas from "@/components/HistoricoConsultas";
import MedicacoesReminder from "@/components/MedicacoesReminder";

interface Prescricao {
  id: string;
  texto: string;
  data: string;
  medico: string;
  orientacoes?: string;
}

interface QuestionarioPendente extends QuestionarioConfig {
  id: string;
  dataEnvio: string;
  respondido?: boolean;
  pacienteCpf?: string;
  pacienteNome?: string;
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


export default function PacienteDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [ultimaConsulta, setUltimaConsulta] = useState<string>("");
  const [proximoRetorno, setProximoRetorno] = useState<string>("");
  const [consultas, setConsultas] = useState<any[]>([]);
  const [pendingQuestionarios, setPendingQuestionarios] = useState<QuestionarioPendente[]>([]);
  const [activeQuestionario, setActiveQuestionario] = useState<QuestionarioPendente | null>(null);
  const [questionarioRespostas, setQuestionarioRespostas] = useState<Record<string, string>>({});
  const [questionarioResultado, setQuestionarioResultado] = useState<any>(null);
  const [medicationStatus, setMedicationStatus] = useState<string | null>(null);
  const [showMedicineReminder, setShowMedicineReminder] = useState(false);
  // Novos estados para integração
  const [respostasQuestionarios, setRespostasQuestionarios] = useState<RespostaQuestionario[]>([]);
  const [historicoConsultas, setHistoricoConsultas] = useState<ConsultaHistorico[]>([]);
  const [medicacoesAtivas, setMedicacoesAtivas] = useState<RemindRemedicacao[]>([]);
  const [ultimaResposta, setUltimaResposta] = useState<RespostaQuestionario | null>(null);

  const saudacao = getMensagemSaudacao();
  const lembrete = getMensagemLembrete(prescricoes);

  useEffect(() => {
    const cpfLimpo = unformatCPF(user?.cpf || "");
    const allPatients = JSON.parse(localStorage.getItem("patients") || "[]");
    const meusDados = allPatients.find(
      (p: any) => unformatCPF(p.cpf) === cpfLimpo,
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

    const historicoConsultasLocal = JSON.parse(
      localStorage.getItem(`consultas_${cpfLimpo}`) || "[]",
    );
    setConsultas(historicoConsultasLocal);

    const carregados = JSON.parse(
      localStorage.getItem(`questionarios_${cpfLimpo}`) || "[]",
    );
    setPendingQuestionarios(carregados);

    const medStatus = localStorage.getItem(`medicacao_status_${cpfLimpo}`);
    setMedicationStatus(medStatus);

    // Carregar dados do novo sistema de questionários
    if (user?.cpf) {
      const respostas = getRespostasDosPaciente(user.cpf);
      setRespostasQuestionarios(respostas);
      
      const ultimaResposta = getUltimaRespostaPaciente(user.cpf);
      setUltimaResposta(ultimaResposta);

      const consultas = getConsultasDoPaciente(user.cpf);
      setHistoricoConsultas(consultas);

      const medicacoes = getMedicacoesDoPaciente(user.cpf);
      setMedicacoesAtivas(medicacoes);
    }
  }, [user]);

  const handleStartQuestionario = (questionario: QuestionarioPendente) => {
    setActiveQuestionario(questionario);
    setQuestionarioRespostas({});
    setQuestionarioResultado(null);
    setShowMedicineReminder(false);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    setQuestionarioRespostas((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuestionario = () => {
    if (!activeQuestionario) return;
    const cpfLimpo = unformatCPF(user?.cpf || "");
    const pontuacao = calcularPontuacaoRespostas(
      activeQuestionario.perguntas,
      questionarioRespostas,
    );
    const classificacao = getClassificacaoRisco(pontuacao);

    const historicoRespostas = JSON.parse(
      localStorage.getItem(`respostas_${cpfLimpo}`) || "[]",
    );
    historicoRespostas.push({
      questionarioId: activeQuestionario.id,
      titulo: activeQuestionario.titulo,
      comorbidade: activeQuestionario.comorbidade,
      respostas: questionarioRespostas,
      pontuacao,
      classificacao: classificacao.nivel,
      data: new Date().toISOString(),
    });
    localStorage.setItem(
      `respostas_${cpfLimpo}`,
      JSON.stringify(historicoRespostas),
    );

    const nextPending = pendingQuestionarios.filter(
      (q) => q.id !== activeQuestionario.id,
    );
    setPendingQuestionarios(nextPending);
    localStorage.setItem(`questionarios_${cpfLimpo}`, JSON.stringify(nextPending));

    const medQuestion = activeQuestionario.perguntas.find((pergunta) =>
      pergunta.texto.toLowerCase().includes("medicação") ||
      pergunta.texto.toLowerCase().includes("medicacao") ||
      pergunta.texto.toLowerCase().includes("medicamentos")
    );
    if (medQuestion && questionarioRespostas[medQuestion.id]) {
      localStorage.setItem(
        `medicacao_status_${cpfLimpo}`,
        questionarioRespostas[medQuestion.id],
      );
      setMedicationStatus(questionarioRespostas[medQuestion.id]);
    }

    setQuestionarioResultado({
      pontuacao,
      nivel: classificacao.nivel,
      mensagem: classificacao.mensagem,
      alerta: classificacao.alerta,
      emoji: classificacao.emoji,
      cor: classificacao.cor,
    });
    setActiveQuestionario(null);
  };

  const medicationMessage = () => {
    if (!medicationStatus) {
      return "Responda o questionário para atualizar o status da medicação.";
    }
    if (medicationStatus.toLowerCase() === "sim") {
      return "✅ Você está tomando a medicação corretamente.";
    }
    return "⚠️ Você não tomou a medicação hoje. Consulte seu médico ou retome o tratamento.";
  };

  const toggleMedicineReminder = () => {
    setShowMedicineReminder((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b-2 border-vigie-green">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vigie-green to-green-600 flex items-center justify-center shadow-lg">
              <Lucide.Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-xl">Vigie</h1>
              <p className="text-xs text-slate-500">Meu Prontuário</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setLocation("/login");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
          >
            <Lucide.LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* TITLE */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">
            {user?.name}
          </h2>
          <p className="text-slate-600 mt-2">
            Seu prontuário eletrônico seguro e acessível
          </p>
        </div>

        {/* GREETING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{saudacao.emoji}</span>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] font-bold text-slate-500">
                  Boas-vindas
                </p>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {saudacao.texto}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Sua última consulta foi em {ultimaConsulta || "ainda não registrada"}.
            </p>
            {proximoRetorno && (
              <p className="text-sm text-slate-600 mt-2">
                Próximo retorno previsto: {new Date(proximoRetorno).toLocaleDateString()}.
              </p>
            )}
          </div>

          <div className={`rounded-3xl p-6 shadow-sm border ${lembrete.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center text-2xl">
                💊
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] font-bold text-slate-500">
                  Lembrete de saúde
                </p>
                <h3 className={`text-lg font-bold ${lembrete.cor}`}>
                  {lembrete.texto}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Continue acompanhando suas prescrições e marque consultas regulares.
            </p>
          </div>
        </div>

        {/* USER INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-vigie-green hover:shadow-md transition-shadow">
            <p className="text-xs text-slate-500 font-bold uppercase">CPF</p>
            <p className="text-lg font-bold text-slate-800 mt-1 break-all">{user?.cpf}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-vigie-green hover:shadow-md transition-shadow">
            <p className="text-xs text-slate-500 font-bold uppercase">Endereço</p>
            <p className="text-lg font-bold text-slate-800 mt-1 truncate">{user?.endereco}</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-vigie-green hover:shadow-md transition-shadow">
            <p className="text-xs text-slate-500 font-bold uppercase">Status</p>
            <p className="text-lg font-bold text-vigie-green mt-1">✅ Ativo</p>
          </div>
        </div>

        {/* PENDING QUESTIONNAIRES & HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">
                  Questionários pendentes
                </p>
                <h3 className="text-xl font-extrabold text-slate-800">
                  {pendingQuestionarios.length} pendente(s)
                </h3>
              </div>
            </div>

            {pendingQuestionarios.length === 0 && (
              <p className="text-sm text-slate-600">
                Nenhum questionário pendente no momento. Continue acompanhando sua saúde.
              </p>
            )}

            <div className="space-y-4">
              {pendingQuestionarios.map((questionario) => (
                <div
                  key={questionario.id}
                  className="rounded-3xl border border-slate-200 p-4 bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500 uppercase tracking-[0.24em] font-semibold">
                        {questionario.comorbidade}
                      </p>
                      <h4 className="text-lg font-bold text-slate-800">
                        {questionario.titulo}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleStartQuestionario(questionario)}
                      className="rounded-full bg-vigie-green px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {activeQuestionario && (
              <div className="mt-6 rounded-3xl border border-slate-200 p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">
                      Questionário em andamento
                    </p>
                    <h4 className="text-lg font-bold text-slate-800">
                      {activeQuestionario.titulo}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveQuestionario(null)}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="space-y-5">
                  {activeQuestionario.perguntas.map((pergunta) => (
                    <div key={pergunta.id} className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">{pergunta.texto}</p>
                      <div className="flex flex-wrap gap-2">
                        {pergunta.opcoes.map((opcao) => (
                          <button
                            key={opcao}
                            type="button"
                            onClick={() => handleSelectOption(pergunta.id, opcao)}
                            className={`rounded-full border px-3 py-2 text-sm transition ${
                              questionarioRespostas[pergunta.id] === opcao
                                ? "border-vigie-green bg-vigie-green/10 text-vigie-green"
                                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                            }`}
                          >
                            {opcao}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-500">
                    Selecione uma resposta para cada pergunta antes de enviar.
                  </p>
                  <button
                    onClick={handleSubmitQuestionario}
                    className="rounded-2xl bg-vigie-green px-5 py-2 text-white font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Enviar respostas
                  </button>
                </div>
              </div>
            )}

            {questionarioResultado && (
              <div className="mt-6 rounded-3xl border border-slate-200 p-5 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{questionarioResultado.emoji}</span>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {questionarioResultado.nivel}
                    </h4>
                    <p className="text-sm text-slate-500">{questionarioResultado.mensagem}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Pontuação: {questionarioResultado.pontuacao}.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">
                  Histórico de consultas
                </p>
                <h3 className="text-xl font-extrabold text-slate-800">
                  Últimas consultas
                </h3>
              </div>
              <button
                onClick={toggleMedicineReminder}
                className="rounded-full bg-vigie-green px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                {showMedicineReminder ? "Fechar lembrete" : "Lembrete de medicação"}
              </button>
            </div>

            {consultas.length === 0 ? (
              <p className="text-sm text-slate-600">
                Nenhuma consulta registrada ainda — assim que o profissional atualizar seu prontuário, você verá o histórico aqui.
              </p>
            ) : (
              <div className="space-y-4">
                {consultas.map((consulta, index) => (
                  <div key={index} className="rounded-3xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-sm text-slate-500">{new Date(consulta.data).toLocaleDateString()}</p>
                    <p className="text-base font-semibold text-slate-800">{consulta.motivo || consulta.descricao || "Consulta registrada"}</p>
                    <p className="text-sm text-slate-600 mt-1">{consulta.profissional || "Profissional de saúde"}</p>
                  </div>
                ))}
              </div>
            )}

            {showMedicineReminder && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-vigie-green/5 p-5">
                <p className="text-sm text-slate-700">{medicationMessage()}</p>
              </div>
            )}
          </div>
        </div>

        {/* ÚLTIMAS RESPOSTAS E STATUS DE RISCO */}
        {ultimaResposta && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>{ultimaResposta.classificacaoRisco.emoji}</span>
              Último Status de Monitoramento
            </h3>
            <div className={`${ultimaResposta.classificacaoRisco.cor} text-white rounded-lg p-4 mb-4`}>
              <p className="font-bold text-lg mb-1">{ultimaResposta.classificacaoRisco.alerta}</p>
              <p className="text-sm mb-2">{ultimaResposta.classificacaoRisco.mensagem}</p>
              <p className="text-xs">Pontuação: {ultimaResposta.pontuacao} | Comorbidade: {ultimaResposta.comorbidade}</p>
            </div>
            <button
              onClick={() => setLocation(`/questionarios/${user?.cpf}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              <Lucide.BarChart3 size={18} />
              Ver Histórico Completo
            </button>
          </div>
        )}

        {/* MEDICAÇÕES ATIVAS COM REMINDERS */}
        {medicacoesAtivas.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lucide.Pill size={20} />
              Medicações Ativas - Reminders
            </h3>
            <MedicacoesReminder medicacoes={medicacoesAtivas} />
          </div>
        )}

        {/* HISTÓRICO DE CONSULTAS */}
        {historicoConsultas.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lucide.Calendar size={20} />
              Histórico de Consultas
            </h3>
            <HistoricoConsultas consultas={historicoConsultas} />
          </div>
        )}

        {/* HISTÓRICO DE QUESTIONÁRIOS RESPONDIDOS */}
        {respostasQuestionarios.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lucide.ClipboardList size={20} />
              Histórico de Monitoramento
            </h3>
            <HistoricoQuestionarios respostas={respostasQuestionarios} />
          </div>
        )}

        {/* BOTÃO PARA RESPONDER QUESTIONÁRIOS */}
        <div className="mb-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Lucide.ArrowRight size={20} />
            Comece seu Monitoramento
          </h3>
          <p className="text-sm text-blue-100 mb-4">
            Responda aos questionários de saúde para monitorar suas comorbidades e receber alertas em caso de risco.
          </p>
          <button
            onClick={() => setLocation(`/questionarios/${user?.cpf}`)}
            className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-bold transition"
          >
            <Lucide.BarChart3 size={20} />
            Ir para Questionários
          </button>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border-l-4 border-vigie-green p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-vigie-green/10 flex items-center justify-center">
                <Lucide.Heart className="w-6 h-6 text-vigie-green" />
              </div>
              <h3 className="font-bold text-slate-700">Status de Saúde</h3>
            </div>
            <p className="text-sm text-slate-600">Acompanhamento em dia</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Lucide.Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-700">Consultas</h3>
            </div>
            <p className="text-sm text-slate-600">{historicoConsultas.length} registrada(s)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-l-4 border-purple-500 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Lucide.Pill className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-700">Medicações</h3>
            </div>
            <p className="text-sm text-slate-600">{medicacoesAtivas.length} ativa(s)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
