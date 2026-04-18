import { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import { RemindRemedicacao } from "@/data/types";
import { confirmarTomouMedicacao, deletarMedicacao } from "@/store/questionarioStore";

interface Props {
  medicacoes: RemindRemedicacao[];
  onUpdateMedicacao?: (medicacao: RemindRemedicacao) => void;
}

export default function MedicacoesReminder({ medicacoes, onUpdateMedicacao }: Props) {
  const [atrasadas, setAtrasadas] = useState<RemindRemedicacao[]>([]);

  useEffect(() => {
    // Atualizar medicações atrasadas a cada minuto
    const updateAtrasadas = () => {
      const agora = new Date();
      const hoje = agora.toISOString().split("T")[0];
      const horaAtual = agora.getHours().toString().padStart(2, "0");

      const novasAtrasadas = medicacoes.filter(med => {
        const jaRegistradaHoje = med.registrosTomadas.some(r => r.data === hoje);
        if (jaRegistradaHoje) return false;

        return med.horasDia.some(hora => hora < horaAtual);
      });

      setAtrasadas(novasAtrasadas);
    };

    updateAtrasadas();
    const interval = setInterval(updateAtrasadas, 60000);
    return () => clearInterval(interval);
  }, [medicacoes]);

  const handleConfirmarMedicacao = (medicacao: RemindRemedicacao, horario: string) => {
    confirmarTomouMedicacao(medicacao.id, horario);
    if (onUpdateMedicacao) {
      const updated = { ...medicacao };
      const hoje = new Date().toISOString().split("T")[0];
      updated.registrosTomadas.push({
        data: hoje,
        horario: horario,
        confirmado: true,
      });
      onUpdateMedicacao(updated);
    }
  };

  const handleDeletarMedicacao = (medicacaoId: string) => {
    if (confirm("Tem certeza que deseja remover esta medicação?")) {
      deletarMedicacao(medicacaoId);
      if (onUpdateMedicacao) {
        // Trigger refresh parent component
      }
    }
  };

  if (medicacoes.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Sem Medicações</h3>
        <p className="text-slate-600">Nenhuma medicação ativa registrada.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Medicações Atrasadas */}
      {atrasadas.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-center gap-2 mb-3">
            <Lucide.AlertCircle className="text-red-600" size={20} />
            <h3 className="font-bold text-red-800">Medicações Atrasadas</h3>
          </div>
          <div className="space-y-3">
            {atrasadas.map(med => (
              <div key={med.id} className="bg-white rounded p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{med.medicacao}</p>
                  <p className="text-sm text-slate-600">{med.dose}</p>
                </div>
                <button
                  onClick={() => handleConfirmarMedicacao(med, new Date().getHours().toString().padStart(2, "0") + ":" + new Date().getMinutes().toString().padStart(2, "0"))}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2"
                >
                  <Lucide.Check size={18} />
                  Confirmar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medicações Por Horário */}
      <div className="max-w-2xl mx-auto space-y-3">
        {medicacoes.map(medicacao => {
          const hoje = new Date().toISOString().split("T")[0];
          const jaRegistradaHoje = medicacao.registrosTomadas.some(r => r.data === hoje);

          return (
            <div
              key={medicacao.id}
              className={`p-4 rounded-lg border-2 transition ${
                jaRegistradaHoje
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-slate-900">{medicacao.medicacao}</h4>
                    {jaRegistradaHoje && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">
                        ✓ Tomada
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Dose: {medicacao.dose}</p>
                  <p className="text-sm text-slate-600 mb-3">
                    Horários: {medicacao.horasDia.join(", ")}h
                  </p>

                  {/* Registro de histórico */}
                  {medicacao.registrosTomadas.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Últimas tomadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {medicacao.registrosTomadas
                          .slice(-5)
                          .reverse()
                          .map((registro, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                            >
                              {registro.data} {registro.horario}h
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {!jaRegistradaHoje && (
                    <button
                      onClick={() => {
                        const horario = medicacao.horasDia[0] || new Date().getHours().toString().padStart(2, "0");
                        handleConfirmarMedicacao(medicacao, horario);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold transition flex items-center gap-1"
                    >
                      <Lucide.Check size={16} />
                      Tomei
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletarMedicacao(medicacao.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded font-semibold transition flex items-center gap-1"
                  >
                    <Lucide.Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
