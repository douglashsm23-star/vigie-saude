export interface Pergunta {
  id: string;
  texto: string;
  opcoes: string[];
  peso?: Record<string, number>;
  alertaUrgente?: boolean;
}

export interface QuestionarioConfig {
  id: string;
  titulo: string;
  comorbidade: string;
  frequenciaDias: number;
  classificacaoInternacional?: string;
  perguntas: Pergunta[];
}

// ============================================
// CLASSIFICAÇÕES INTERNACIONAIS
// ============================================
export const classificacoesInternacionais = {
  pressaoArterial: (sistolica: number, diastolica: number) => {
    if (sistolica >= 180 || diastolica >= 120)
      return { categoria: "Crise Hipertensiva", risco: 5, alerta: true };
    if (sistolica >= 160 || diastolica >= 100)
      return { categoria: "Hipertensão Estágio 3", risco: 4, alerta: true };
    if (sistolica >= 140 || diastolica >= 90)
      return { categoria: "Hipertensão Estágio 2", risco: 3, alerta: false };
    if (sistolica >= 130 || diastolica >= 85)
      return { categoria: "Hipertensão Estágio 1", risco: 2, alerta: false };
    if (sistolica >= 120)
      return { categoria: "Pré-Hipertensão", risco: 1, alerta: false };
    return { categoria: "Normal", risco: 0, alerta: false };
  },
  glicemia: (glicemia: number) => {
    if (glicemia >= 200) return { categoria: "Hiperglicemia Grave", risco: 4 };
    if (glicemia >= 126) return { categoria: "Diabetes", risco: 3 };
    if (glicemia >= 100) return { categoria: "Pré-Diabetes", risco: 2 };
    return { categoria: "Normal", risco: 0 };
  },
  imc: (imc: number) => {
    if (imc >= 40) return { categoria: "Obesidade Grau 3 (Mórbida)", risco: 4 };
    if (imc >= 35) return { categoria: "Obesidade Grau 2 (Severa)", risco: 3 };
    if (imc >= 30) return { categoria: "Obesidade Grau 1", risco: 2 };
    if (imc >= 25) return { categoria: "Sobrepeso", risco: 1 };
    if (imc >= 18.5) return { categoria: "Normal", risco: 0 };
    return { categoria: "Abaixo do peso", risco: 1 };
  },
  hba1c: (valor: number) => {
    if (valor >= 8.0) return { categoria: "Muito Alto", risco: 4 };
    if (valor >= 6.5) return { categoria: "Diabetes", risco: 3 };
    if (valor >= 5.7) return { categoria: "Pré-Diabetes", risco: 2 };
    return { categoria: "Normal", risco: 0 };
  },
};

// ============================================
// QUESTIONÁRIOS POR COMORBIDADE
// ============================================
export const questionariosConfig: QuestionarioConfig[] = [
  {
    id: "hipertensao",
    titulo: "Monitoramento de Hipertensão",
    comorbidade: "Hipertensão",
    frequenciaDias: 7,
    classificacaoInternacional: "WHO - Classificação de Pressão Arterial",
    perguntas: [
      { id: "h1", texto: "Você aferiu sua pressão recentemente?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
      { id: "h2", texto: "Qual o valor da sua pressão arterial? (Sistólica)", opcoes: ["<120", "120-129", "130-139", "140-159", "160-179", "≥180"], peso: { "<120": 0, "120-129": 1, "130-139": 2, "140-159": 3, "160-179": 4, "≥180": 5 } },
      { id: "h3", texto: "Qual o valor da sua pressão arterial? (Diastólica)", opcoes: ["<80", "80-84", "85-89", "90-99", "100-109", "≥110"], peso: { "<80": 0, "80-84": 0, "85-89": 1, "90-99": 2, "100-109": 3, "≥110": 4 } },
      { id: "h4", texto: "Sua pressão arterial está controlada?", opcoes: ["Sim", "Não", "Não sei"], peso: { Sim: 0, Não: 2, "Não sei": 1 } },
      { id: "h5", texto: "Teve dor de cabeça nas últimas 24h?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "h6", texto: "Sentiu tontura ao levantar?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "h7", texto: "Teve palpitação ou coração acelerado?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "h8", texto: "Tomou sua medicação hoje?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
    ],
  },
  {
    id: "diabetes",
    titulo: "Monitoramento de Diabetes",
    comorbidade: "Diabetes",
    frequenciaDias: 7,
    classificacaoInternacional: "WHO - Classificação de Glicemia",
    perguntas: [
      { id: "d1", texto: "Você aferiu sua glicemia recentemente?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
      { id: "d2", texto: "Qual o valor da sua glicemia em jejum? (mg/dL)", opcoes: ["<100", "100-125", "126-199", "≥200"], peso: { "<100": 0, "100-125": 2, "126-199": 3, "≥200": 4 } },
      { id: "d3", texto: "Qual o valor da sua Hemoglobina Glicada (HbA1c)? (%)", opcoes: ["<5.7", "5.7-6.4", "6.5-7.9", "≥8.0"], peso: { "<5.7": 0, "5.7-6.4": 2, "6.5-7.9": 3, "≥8.0": 4 } },
      { id: "d4", texto: "Sua glicemia está controlada?", opcoes: ["Sim", "Não", "Não sei"], peso: { Sim: 0, Não: 2, "Não sei": 1 } },
      { id: "d5", texto: "Teve formigamento nos pés ou mãos?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "d6", texto: "Sentiu visão turva?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "d7", texto: "Teve sede excessiva ou urina frequente?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "d8", texto: "Tomou sua medicação para diabetes hoje?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
    ],
  },
  {
    id: "odontologico",
    titulo: "Monitoramento Odontológico",
    comorbidade: "Odontológico",
    frequenciaDias: 7,
    perguntas: [
      { id: "od1", texto: "A dor está controlada com a medicação?", opcoes: ["Sim", "Não", "Não estou tomando medicação"], peso: { Sim: 0, Não: 2, "Não estou tomando medicação": 1 } },
      { id: "od2", texto: "Teve sangramento que não parou em até 10 minutos?", opcoes: ["Sim", "Não"], peso: { Sim: 4, Não: 0 }, alertaUrgente: true },
      { id: "od3", texto: "Teve febre ou inchaço no rosto?", opcoes: ["Sim", "Não"], peso: { Sim: 4, Não: 0 }, alertaUrgente: true },
      { id: "od4", texto: "Sentiu gosto ruim ou secreção no local?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "od5", texto: "A prótese está causando desconforto ou ferida?", opcoes: ["Sim", "Não", "Não uso prótese"], peso: { Sim: 2, Não: 0, "Não uso prótese": 0 } },
      { id: "od6", texto: "Consegue mastigar normalmente?", opcoes: ["Sim", "Com dificuldade", "Não consigo"], peso: { Sim: 0, "Com dificuldade": 1, "Não consigo": 2 } },
      { id: "od7", texto: "A dor na mandíbula piorou nas últimas 24h?", opcoes: ["Sim", "Não", "Não tenho dor na mandíbula"], peso: { Sim: 2, Não: 0, "Não tenho dor na mandíbula": 0 } },
      { id: "od8", texto: "Consegue abrir a boca completamente?", opcoes: ["Sim", "Com dificuldade", "Não consigo"], peso: { Sim: 0, "Com dificuldade": 1, "Não consigo": 3 }, alertaUrgente: true },
      { id: "od9", texto: "Suas gengivas estão sangrando ao escovar?", opcoes: ["Sim", "Não"], peso: { Sim: 1, Não: 0 } },
      { id: "od10", texto: "Teve mobilidade nos dentes (dente mole)?", opcoes: ["Sim", "Não"], peso: { Sim: 4, Não: 0 }, alertaUrgente: true },
    ],
  },
  {
    id: "respiratorio",
    titulo: "Monitoramento Respiratório",
    comorbidade: "Respiratória",
    frequenciaDias: 7,
    perguntas: [
      { id: "r1", texto: "Teve falta de ar nas últimas 24h?", opcoes: ["Sim", "Não"], peso: { Sim: 3, Não: 0 }, alertaUrgente: true },
      { id: "r2", texto: "Usou a medicação de resgate (bombinha) mais de 2x ao dia?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "r3", texto: "Acordou com chiado no peito?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "r4", texto: "Teve tosse seca persistente?", opcoes: ["Sim", "Não"], peso: { Sim: 1, Não: 0 } },
      { id: "r5", texto: "Teve febre associada à falta de ar?", opcoes: ["Sim", "Não"], peso: { Sim: 3, Não: 0 }, alertaUrgente: true },
    ],
  },
  {
    id: "saude_mental",
    titulo: "Monitoramento de Saúde Mental",
    comorbidade: "Saúde Mental",
    frequenciaDias: 15,
    perguntas: [
      { id: "m1", texto: "Como está seu humor nos últimos dias?", opcoes: ["Bom", "Regular", "Ruim"], peso: { Bom: 0, Regular: 1, Ruim: 3 } },
      { id: "m2", texto: "Teve dificuldade para dormir?", opcoes: ["Sim", "Não"], peso: { Sim: 1, Não: 0 } },
      { id: "m3", texto: "Sentiu ansiedade ou preocupação excessiva?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "m4", texto: "Sentiu-se para baixo ou sem esperança?", opcoes: ["Sim", "Não"], peso: { Sim: 2, Não: 0 } },
      { id: "m5", texto: "Teve pensamentos negativos recorrentes?", opcoes: ["Sim", "Não"], peso: { Sim: 3, Não: 0 }, alertaUrgente: true },
    ],
  },
  {
    id: "obesidade",
    titulo: "Monitoramento de Obesidade",
    comorbidade: "Obesidade",
    frequenciaDias: 15,
    perguntas: [
      { id: "o1", texto: "Seu peso mudou significativamente?", opcoes: ["Aumentou", "Mesmo", "Diminuiu"], peso: { "Aumentou": 2, "Mesmo": 0, "Diminuiu": 1 } },
      { id: "o2", texto: "Praticou atividade física esta semana?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
      { id: "o3", texto: "Manteve alimentação saudável?", opcoes: ["Sim", "Não", "Às vezes"], peso: { Sim: 0, Não: 2, "Às vezes": 1 } },
      { id: "o4", texto: "Tomou sua medicação de emagrecimento ou controle?", opcoes: ["Sim", "Não"], peso: { Sim: 0, Não: 2 } },
    ],
  },
];

export function getQuestionarioPorComorbidade(
  comorbidade: string,
): QuestionarioConfig | null {
  const comorbLower = comorbidade.toLowerCase();
  if (comorbLower.includes("hipertensão"))
    return questionariosConfig.find((q) => q.id === "hipertensao") || null;
  if (comorbLower === "diabetes")
    return questionariosConfig.find((q) => q.id === "diabetes") || null;
  if (comorbLower.includes("odontologico"))
    return questionariosConfig.find((q) => q.id === "odontologico") || null;
  if (comorbLower.includes("respiratória") || comorbLower.includes("asma"))
    return questionariosConfig.find((q) => q.id === "respiratorio") || null;
  if (
    comorbLower.includes("saúde mental") ||
    comorbLower.includes("depressão") ||
    comorbLower.includes("ansiedade")
  )
    return questionariosConfig.find((q) => q.id === "saude_mental") || null;
  if (comorbLower.includes("obesidade"))
    return questionariosConfig.find((q) => q.id === "obesidade") || null;
  return null;
}

export function calcularPontuacaoRespostas(
  perguntas: Pergunta[],
  respostas: Record<string, string>,
): number {
  return perguntas.reduce((total, pergunta) => {
    const resposta = respostas[pergunta.id];
    if (!resposta || !pergunta.peso) return total;
    return total + (pergunta.peso[resposta] ?? 0);
  }, 0);
}

export function getClassificacaoRisco(pontuacao: number) {
  if (pontuacao >= 15) {
    return {
      nivel: "CRÍTICO",
      cor: "bg-red-700",
      mensagem: "🚨 Procure atendimento médico imediatamente!",
      alerta: "URGÊNCIA",
      emoji: "🚨",
    };
  }
  if (pontuacao >= 10) {
    return {
      nivel: "MUITO ALTO",
      cor: "bg-red-600",
      mensagem: "⚠️ Risco muito elevado. Procure atendimento em até 24 horas.",
      alerta: "ALTO RISCO",
      emoji: "🔴",
    };
  }
  if (pontuacao >= 6) {
    return {
      nivel: "ALTO",
      cor: "bg-orange-500",
      mensagem: "⚠️ Risco elevado. Entre em contato com seu médico.",
      alerta: "RISCO ELEVADO",
      emoji: "🟠",
    };
  }
  if (pontuacao >= 3) {
    return {
      nivel: "MÉDIO",
      cor: "bg-yellow-500",
      mensagem: "📋 Risco moderado. Continue o monitoramento.",
      alerta: "MONITORAMENTO",
      emoji: "📋",
    };
  }
  return {
    nivel: "BAIXO",
    cor: "bg-green-500",
    mensagem: "✅ Risco controlado. Continue assim!",
    alerta: "CONTROLE ADEQUADO",
    emoji: "✅",
  };
}
