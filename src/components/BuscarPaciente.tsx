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
  const [pacienteEncontrado, setPacienteEncontrado] = useState<any>(null);

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return numeros.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    if (numeros.length <= 9) return numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  };

  const buscarPaciente = async () => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11 && !nome && !dataNascimento) {
      alert("Digite pelo menos CPF, Nome ou Data de Nascimento!");
      return;
    }

    setBuscando(true);
    try {
      let paciente = null;
      if (cpfLimpo.length === 11) {
        paciente = await getPatientByCPF(cpfLimpo);
      }
      
      if (paciente) {
        setPacienteEncontrado(paciente);
        onPacienteEncontrado(paciente);
      } else {
        alert("Paciente não encontrado. Deseja cadastrar um novo?");
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
    <div className="space-y-6">
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
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7B2335] focus:border-transparent"
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
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7B2335] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#7B2335] focus:border-transparent"
            />
          </div>
          
          <button
            onClick={buscarPaciente}
            disabled={buscando}
            className="w-full bg-[#7B2335] text-white py-3 rounded-xl font-bold hover:bg-[#8B2B45] transition-all disabled:opacity-50"
          >
            {buscando ? "BUSCANDO..." : "PROSSEGUIR"}
          </button>
        </div>
      </div>

      {pacienteEncontrado && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Lucide.User size={20} className="text-[#7B2335]" />
            INFORMAÇÕES DO PACIENTE
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#7B2335] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {pacienteEncontrado.name?.charAt(0) || "P"}
            </div>
            <div>
              <p className="font-bold text-xl">{pacienteEncontrado.name}</p>
              <p className="text-slate-500">{pacienteEncontrado.cpf}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-slate-500">CADASTRO INICIAL</p>
              <p className="font-bold">{pacienteEncontrado.registeredBy || "Não informado"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-xs text-slate-500">ÚLTIMO ATENDIMENTO</p>
              <p className="font-bold">{pacienteEncontrado.lastDoctor || "Não informado"}</p>
              <p className="text-xs text-slate-400">{pacienteEncontrado.lastConsultDate || ""}</p>
            </div>
          </div>
          
          {pacienteEncontrado.alergias && (
            <div className="bg-amber-50 p-4 rounded-xl mb-4">
              <p className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                <Lucide.AlertCircle size={16} /> ALERTAS
              </p>
              <p className="text-red-600 flex items-center gap-2">
                <Lucide.AlertTriangle size={14} /> Reação alérgica: {pacienteEncontrado.alergias}
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={() => onPacienteEncontrado(pacienteEncontrado)}
              className="flex-1 bg-[#7B2335] text-white py-3 rounded-xl font-bold hover:bg-[#8B2B45] transition-all"
            >
              INICIAR CONSULTA
            </button>
            <button
              onClick={() => {/* Abrir exames */}}
              className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
            >
              VER EXAMES
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
