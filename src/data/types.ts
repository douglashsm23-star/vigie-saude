// ============================================
// RESPOSTAS DE QUESTIONÁRIOS
// ============================================

export interface RespostaQuestionario {
  id: string;
  pacienteId: string;
  questionarioId: string;
  comorbidade: string;
  respostas: Record<string, string>;
  pontuacao: number;
  classificacaoRisco: {
    nivel: string;
    cor: string;
    mensagem: string;
    alerta: string;
    emoji: string;
  };
  dataResposta: string;
  dataProxima?: string;
}

// ============================================
// HISTÓRICO DE CONSULTAS
// ============================================

export interface ConsultaHistorico {
  id: string;
  pacienteId: string;
  data: string;
  profissionalNome: string;
  profissionalEspecialidade: string;
  motivo: string;
  conversa: string;
  vereditoGeral?: string;
  diagnostico?: string;
  prescricoes?: string[];
  medicacoes?: Array<{
    nome: string;
    dose: string;
    dias: string;
  }>;
  riskLevel?: "low" | "medium" | "high";
  comorbidities?: string[];
}

// ============================================
// MEDICAÇÕES E REMINDERS
// ============================================

export interface RemindRemedicacao {
  id: string;
  pacienteId: string;
  medicacao: string;
  dose: string;
  frequencia: "diaria" | "a_cada_12h" | "a_cada_8h" | "semanal";
  horasDia: string[];
  dataInicio: string;
  dataFim?: string;
  tomarAgora: boolean;
  registrosTomadas: Array<{
    data: string;
    horario: string;
    confirmado: boolean;
  }>;
}

// ============================================
// MONITORAMENTO DE PACIENTE
// ============================================

export interface MonitoramentoPaciente {
  pacienteId: string;
  ultimaResposta?: RespostaQuestionario;
  proximoQuestionario?: {
    questionarioId: string;
    comorbidade: string;
    dataPrevista: string;
  };
  ultimaConsulta?: ConsultaHistorico;
  medicacoesAtivas: RemindRemedicacao[];
  historicoCompleto: ConsultaHistorico[];
  respostasRecentes: RespostaQuestionario[];
}
