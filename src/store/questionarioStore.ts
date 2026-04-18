import { RespostaQuestionario, ConsultaHistorico, RemindRemedicacao } from "@/data/types";

// ============================================
// STORE DE RESPOSTAS DE QUESTIONÁRIOS
// ============================================

export function getRespostasQuestionarios(): RespostaQuestionario[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("vigie_respostas_questionarios");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function salvarRespostaQuestionario(resposta: RespostaQuestionario) {
  if (typeof window === "undefined") return;
  const respostas = getRespostasQuestionarios();
  const index = respostas.findIndex(r => r.id === resposta.id);
  
  if (index >= 0) {
    respostas[index] = resposta;
  } else {
    respostas.push(resposta);
  }
  
  localStorage.setItem("vigie_respostas_questionarios", JSON.stringify(respostas));
}

export function getRespostasDosPaciente(pacienteId: string): RespostaQuestionario[] {
  const respostas = getRespostasQuestionarios();
  return respostas.filter(r => r.pacienteId === pacienteId).sort((a, b) => 
    new Date(b.dataResposta).getTime() - new Date(a.dataResposta).getTime()
  );
}

export function getUltimaRespostaPaciente(pacienteId: string): RespostaQuestionario | null {
  const respostas = getRespostasDosPaciente(pacienteId);
  return respostas.length > 0 ? respostas[0] : null;
}

// ============================================
// STORE DE HISTÓRICO DE CONSULTAS
// ============================================

export function getConsultasHistorico(): ConsultaHistorico[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("vigie_historico_consultas");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function salvarConsultaHistorico(consulta: ConsultaHistorico) {
  if (typeof window === "undefined") return;
  const consultas = getConsultasHistorico();
  const index = consultas.findIndex(c => c.id === consulta.id);
  
  if (index >= 0) {
    consultas[index] = consulta;
  } else {
    consultas.push(consulta);
  }
  
  localStorage.setItem("vigie_historico_consultas", JSON.stringify(consultas));
}

export function getConsultasDoPaciente(pacienteId: string): ConsultaHistorico[] {
  const consultas = getConsultasHistorico();
  return consultas
    .filter(c => c.pacienteId === pacienteId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
}

export function getUltimaConsultaPaciente(pacienteId: string): ConsultaHistorico | null {
  const consultas = getConsultasDoPaciente(pacienteId);
  return consultas.length > 0 ? consultas[0] : null;
}

// ============================================
// STORE DE MEDICAÇÕES COM REMINDERS
// ============================================

export function getMedicacoes(): RemindRemedicacao[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("vigie_medicacoes_reminders");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function salvarMedicacao(medicacao: RemindRemedicacao) {
  if (typeof window === "undefined") return;
  const medicacoes = getMedicacoes();
  const index = medicacoes.findIndex(m => m.id === medicacao.id);
  
  if (index >= 0) {
    medicacoes[index] = medicacao;
  } else {
    medicacoes.push(medicacao);
  }
  
  localStorage.setItem("vigie_medicacoes_reminders", JSON.stringify(medicacoes));
}

export function getMedicacoesDoPaciente(pacienteId: string): RemindRemedicacao[] {
  const medicacoes = getMedicacoes();
  return medicacoes.filter(m => m.pacienteId === pacienteId && (!m.dataFim || new Date(m.dataFim) >= new Date()));
}

export function deletarMedicacao(medicacaoId: string) {
  if (typeof window === "undefined") return;
  const medicacoes = getMedicacoes();
  const filtered = medicacoes.filter(m => m.id !== medicacaoId);
  localStorage.setItem("vigie_medicacoes_reminders", JSON.stringify(filtered));
}

export function confirmarTomouMedicacao(medicacaoId: string, horario: string) {
  if (typeof window === "undefined") return;
  const medicacoes = getMedicacoes();
  const medicacao = medicacoes.find(m => m.id === medicacaoId);
  
  if (medicacao) {
    const hoje = new Date().toISOString().split("T")[0];
    medicacao.registrosTomadas.push({
      data: hoje,
      horario: horario,
      confirmado: true,
    });
    salvarMedicacao(medicacao);
  }
}

export function getMedicacoesAtrasadas(pacienteId: string): RemindRemedicacao[] {
  const medicacoes = getMedicacoesDoPaciente(pacienteId);
  const agora = new Date();
  const hoje = agora.toISOString().split("T")[0];
  const horaAtual = agora.getHours().toString().padStart(2, "0");

  return medicacoes.filter(med => {
    // Verifica se já foi registrada hoje
    const jaRegistradaHoje = med.registrosTomadas.some(r => r.data === hoje);
    if (jaRegistradaHoje) return false;

    // Verifica se passou da hora
    return med.horasDia.some(hora => hora < horaAtual);
  });
}
