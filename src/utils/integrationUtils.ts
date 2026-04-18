import { salvarConsultaHistorico, salvarRespostaQuestionario } from "@/store/questionarioStore";
import { ConsultaHistorico, RespostaQuestionario } from "@/data/types";

/**
 * Cria uma consulta inicial no histórico quando um paciente é cadastrado
 */
export function criarConsultaInicial(
  pacienteId: string,
  pacienteNome: string,
  profissionalNome: string,
  profissionalEspecialidade: string,
  motivo: string,
  comorbidities: string[],
  riskLevel: "low" | "medium" | "high"
): ConsultaHistorico {
  const consulta: ConsultaHistorico = {
    id: crypto.randomUUID(),
    pacienteId,
    data: new Date().toISOString(),
    profissionalNome,
    profissionalEspecialidade,
    motivo,
    conversa: `Paciente ${pacienteNome} cadastrado no sistema com comorbidades: ${comorbidities.join(", ")}`,
    riskLevel,
    comorbidities,
  };

  salvarConsultaHistorico(consulta);
  return consulta;
}

/**
 * Cria questionários respondidos inicialmente (com respostas vazias) para comorbidades
 * que precisam ser monitoradas
 */
export function criarQuestionariosIniciais(
  pacienteId: string,
  comorbidities: string[],
  questionariosConfig: any[]
): void {
  const hoje = new Date();
  
  comorbidities.forEach(comorbidade => {
    const config = questionariosConfig.find(q => 
      q.comorbidade.toLowerCase() === comorbidade.toLowerCase()
    );

    if (!config) return;

    const proximaData = new Date(hoje);
    proximaData.setDate(proximaData.getDate() + config.frequenciaDias);

    // Criar uma resposta "placeholder" indicando que o questionário precisa ser respondido
    const respostaInicial: RespostaQuestionario = {
      id: crypto.randomUUID(),
      pacienteId,
      questionarioId: config.id,
      comorbidade: config.comorbidade,
      respostas: {}, // Vazio, esperando resposta do paciente
      pontuacao: 0,
      classificacaoRisco: {
        nivel: "PENDENTE",
        cor: "bg-gray-500",
        mensagem: "⏳ Questionário aguardando resposta",
        alerta: "PENDENTE",
        emoji: "⏳",
      },
      dataResposta: hoje.toISOString(),
      dataProxima: proximaData.toISOString(),
    };

    salvarRespostaQuestionario(respostaInicial);
  });
}

/**
 * Função auxiliar para integrar o fluxo de cadastro com o novo sistema
 */
export function integrarCadastroComQuestionarios(
  novoPaciente: any,
  profissionalNome: string,
  profissionalEspecialidade: string,
  questionariosConfig: any[]
) {
  // Criar consulta inicial
  criarConsultaInicial(
    novoPaciente.cpf,
    novoPaciente.name,
    profissionalNome,
    profissionalEspecialidade,
    novoPaciente.motivoConsulta || "Consulta de cadastro",
    novoPaciente.comorbidities || [],
    novoPaciente.finalRisk || "low"
  );

  // Criar questionários iniciais
  criarQuestionariosIniciais(
    novoPaciente.cpf,
    novoPaciente.comorbidities || [],
    questionariosConfig
  );
}
