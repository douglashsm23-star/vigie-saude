export function calcularPontuacaoRespostas(respostas: any) {
  if (!respostas || typeof respostas !== "object") return 0;

  return Object.values(respostas).reduce<number>((total, value) => {
    if (typeof value === "number") {
      return total + value;
    }
    if (typeof value === "string") {
      const parsed = parseInt(value.replace(/\D/g, ""), 10);
      return total + (Number.isNaN(parsed) ? 0 : parsed);
    }
    return total;
  }, 0);
}

export function getClassificacaoRisco(pontuacao: number) {
  if (pontuacao >= 8) return "Alto";
  if (pontuacao >= 4) return "Médio";
  return "Baixo";
}