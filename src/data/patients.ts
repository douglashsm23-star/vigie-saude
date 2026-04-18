export const patients: any[] = [];

export const protocols = [
  {
    id: "protocol-1",
    specialty: "Odontologia",
    name: "Protocolo de acompanhamento pós-operatório",
    duration: "7 dias",
    description:
      "Protocolos para orientar o paciente no pós-operatório, com foco em higiene e retorno seguro.",
    checkpoints: [
      "Avaliar dor e inflamação",
      "Orientar higiene bucal adequada",
      "Verificar uso de medicação prescrita",
      "Agendar retorno em 7 dias",
    ],
  },
  {
    id: "protocol-2",
    specialty: "Medicina",
    name: "Protocolo de monitoramento de sinais vitais",
    duration: "14 dias",
    description:
      "Protocolo de acompanhamento para monitorar pressão arterial, frequência cardíaca e sintomas.",
    checkpoints: [
      "Registrar pressão arterial diária",
      "Anotar frequência cardíaca",
      "Observar sintomas de risco",
      "Revisar medicação com o médico",
    ],
  },
];
