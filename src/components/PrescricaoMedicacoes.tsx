import { useState } from "react";
import * as Lucide from "lucide-react";
import { salvarMedicacao } from "@/store/questionarioStore";
import { RemindRemedicacao } from "@/data/types";

interface Props {
  pacienteId: string;
  onMedicacaoAdicionada?: (medicacao: RemindRemedicacao) => void;
}

const medicacoesComunsOdonto = [
  "Amoxicilina 500mg",
  "Amoxicilina + Clavulanato 875mg",
  "Metronidazol 400mg",
  "Ibuprofeno 600mg",
  "Nimesulida 100mg",
  "Cetorolaco 10mg (S.L)",
  "Dipirona Sódica 500mg",
  "Paracetamol 750mg",
  "Dexametasona 4mg",
];

const medicacoesComunsMedicas = [
  "Losartana 50mg",
  "Atenolol 25mg",
  "Omeprazol 20mg",
  "Metformina 500mg",
  "Sinvastatina 20mg",
  "Amoxicilina 500mg",
  "Azitromicina 500mg",
  "Prednisona 20mg",
  "Fluoxetina 20mg",
];

export default function PrescricaoMedicacoes({ pacienteId, onMedicacaoAdicionada }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [medicacoes, setMedicacoes] = useState<RemindRemedicacao[]>([]);
  
  const [formData, setFormData] = useState({
    medicacao: "",
    dose: "",
    frequencia: "diaria" as "diaria" | "a_cada_12h" | "a_cada_8h" | "semanal",
    horasDia: ["08"],
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "",
  });

  const handleAddMedicacao = () => {
    if (!formData.medicacao || !formData.dose) {
      alert("Preencha medicação e dose!");
      return;
    }

    const novaMedicacao: RemindRemedicacao = {
      id: crypto.randomUUID(),
      pacienteId,
      medicacao: formData.medicacao,
      dose: formData.dose,
      frequencia: formData.frequencia,
      horasDia: formData.horasDia,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || undefined,
      tomarAgora: true,
      registrosTomadas: [],
    };

    salvarMedicacao(novaMedicacao);
    setMedicacoes([...medicacoes, novaMedicacao]);

    if (onMedicacaoAdicionada) {
      onMedicacaoAdicionada(novaMedicacao);
    }

    // Reset form
    setFormData({
      medicacao: "",
      dose: "",
      frequencia: "diaria",
      horasDia: ["08"],
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: "",
    });

    alert("✅ Medicação adicionada com sucesso!");
  };

  const handleRemoveMedicacao = (id: string) => {
    setMedicacoes(medicacoes.filter(m => m.id !== id));
  };

  const frequenciaDescricao = {
    diaria: "Uma vez ao dia",
    a_cada_12h: "A cada 12 horas",
    a_cada_8h: "A cada 8 horas (3x ao dia)",
    semanal: "Uma vez por semana",
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lucide.Pill size={20} />
          Prescrição de Medicações
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold transition"
        >
          <Lucide.Plus size={18} />
          {showForm ? "Cancelar" : "Adicionar"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          {/* Medicação */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Medicação</label>
            <input
              type="text"
              list="medicacoes-list"
              value={formData.medicacao}
              onChange={(e) => setFormData({ ...formData, medicacao: e.target.value })}
              placeholder="Digite ou selecione uma medicação"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <datalist id="medicacoes-list">
              {medicacoesComunsOdonto.concat(medicacoesComunsMedicas).map(med => (
                <option key={med} value={med} />
              ))}
            </datalist>
          </div>

          {/* Dose */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dose</label>
            <input
              type="text"
              value={formData.dose}
              onChange={(e) => setFormData({ ...formData, dose: e.target.value })}
              placeholder="Ex: 1 comprimido, 5ml, 2 cápsulas"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Frequência */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Frequência</label>
            <select
              value={formData.frequencia}
              onChange={(e) => {
                const freq = e.target.value as any;
                setFormData({ 
                  ...formData, 
                  frequencia: freq,
                  horasDia: freq === "semanal" ? ["sexta"] : ["08"]
                });
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="diaria">Diária</option>
              <option value="a_cada_12h">A cada 12 horas</option>
              <option value="a_cada_8h">A cada 8 horas (3x ao dia)</option>
              <option value="semanal">Semanal</option>
            </select>
            <p className="text-xs text-slate-600 mt-1">{frequenciaDescricao[formData.frequencia]}</p>
          </div>

          {/* Horários */}
          {formData.frequencia !== "semanal" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Horários</label>
              <div className="space-y-2">
                {formData.horasDia.map((hora, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={hora + ":00"}
                      onChange={(e) => {
                        const horas = [...formData.horasDia];
                        horas[idx] = e.target.value.split(":")[0];
                        setFormData({ ...formData, horasDia: horas });
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                    />
                    {formData.horasDia.length > 1 && (
                      <button
                        onClick={() => {
                          const horas = formData.horasDia.filter((_, i) => i !== idx);
                          setFormData({ ...formData, horasDia: horas });
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Lucide.X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {formData.frequencia === "diaria" && formData.horasDia.length < 1 && (
                  <button
                    onClick={() => setFormData({ ...formData, horasDia: [...formData.horasDia, "14"] })}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                  >
                    + Adicionar horário
                  </button>
                )}
                {formData.frequencia === "a_cada_12h" && formData.horasDia.length < 2 && (
                  <button
                    onClick={() => setFormData({ ...formData, horasDia: [...formData.horasDia, "20"] })}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                  >
                    + Adicionar horário
                  </button>
                )}
                {formData.frequencia === "a_cada_8h" && formData.horasDia.length < 3 && (
                  <button
                    onClick={() => {
                      const nextHour = (parseInt(formData.horasDia[formData.horasDia.length - 1]) + 8) % 24;
                      setFormData({ 
                        ...formData, 
                        horasDia: [...formData.horasDia, nextHour.toString().padStart(2, "0")] 
                      });
                    }}
                    className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                  >
                    + Adicionar horário
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data de Início</label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Data de Fim (opcional)</label>
              <input
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleAddMedicacao}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Lucide.Check size={20} />
            Salvar Medicação
          </button>
        </div>
      )}

      {/* Lista de Medicações */}
      {medicacoes.length > 0 && (
        <div className="p-6 space-y-3">
          <h4 className="font-bold text-slate-900 mb-4">Medicações Prescritas ({medicacoes.length})</h4>
          {medicacoes.map(med => (
            <div key={med.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{med.medicacao}</p>
                <p className="text-sm text-slate-600">Dose: {med.dose}</p>
                <p className="text-sm text-slate-600">
                  Horários: {med.horasDia.join(", ")}h
                </p>
              </div>
              <button
                onClick={() => handleRemoveMedicacao(med.id)}
                className="text-red-600 hover:text-red-700 p-2"
              >
                <Lucide.Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {medicacoes.length === 0 && !showForm && (
        <div className="p-6 text-center text-slate-600">
          <p className="text-sm">Nenhuma medicação prescrita ainda</p>
        </div>
      )}
    </div>
  );
}
