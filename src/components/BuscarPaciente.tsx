import { useState } from "react";
import * as Lucide from "lucide-react";
import { getPatientByCPF } from "../services/firestoreService";

interface BuscarPacienteProps {
  onPacienteEncontrado: (paciente: any) => void;
  onNovoCadastro: () => void;
}

export default function BuscarPaciente({ onPacienteEncontrado, onNovoCadastro }: BuscarPacienteProps) {
  const [cpf, setCpf] = useState("");
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [buscando, setBuscando] = useState(false);

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return numeros.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    if (numeros.length <= 9) return numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  };

  const buscarPaciente = async () => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfLimpo && !nome && !dataNascimento) {
      alert("Digite pelo menos um campo para busca!");
      return;
    }

    setBuscando(true);
    try {
      let paciente = null;
      if (cpfLimpo.length === 11) {
        paciente = await getPatientByCPF(cpfLimpo);
      }
      
      if (paciente) {
        onPacienteEncontrado(paciente);
      } else {
        alert("Paciente não encontrado. Deseja cadastrar?");
        onNovoCadastro();
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar paciente.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Lucide.Search size={20} className="text-[#7B2335]" />
        LOCALIZAR PACIENTE
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
          <input
            type="text"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatarCPF(e.target.value))}
            className="w-full p-3 border border-slate-300 rounded-xl"
            maxLength={14}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
          <input
            type="text"
            placeholder="Digite o nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl"
          />
        </div>
        
        <button
          onClick={buscarPaciente}
          disabled={buscando}
          className="w-full bg-[#7B2335] text-white py-3 rounded-xl font-bold hover:bg-[#8B2B45] transition-all"
        >
          {buscando ? "BUSCANDO..." : "PROSSEGUIR"}
        </button>
      </div>
    </div>
  );
}