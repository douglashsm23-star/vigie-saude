import { useState, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "@/contexts";
import { getPatientByCPF, savePatient } from "@/services/googleSheets";
import { getQuestionarioPorComorbidade } from "@/data/questionariosConfig";

// ============================================
// FUNÇÕES AUXILIARES (TODAS JUNTAS AQUI)
// ============================================

// Remove formatação do CPF
const unformatCPF = (cpf: string): string => {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "");
};

// Formata CPF para exibição
const formatCPF = (cpf: string): string => {
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return numeros.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  if (numeros.length <= 9)
    return numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
};

// Valida CPF
// Função para validar CPF (com dígito verificador)
const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");

  // Verificar se tem 11 dígitos
  if (numbers.length !== 11) return false;

  // Verificar se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  if (firstDigit !== parseInt(numbers.charAt(9))) return false;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  if (secondDigit !== parseInt(numbers.charAt(10))) return false;

  return true;
};

// Calcula idade a partir da data de nascimento
const calcularIdade = (dataNascimento: string): number => {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  const dia = hoje.getDate() - nascimento.getDate();

  if (mes < 0 || (mes === 0 && dia < 0)) {
    idade--;
  }
  return idade;
};

// Mapeamento de cores para cada patologia
const pathologyColors: Record<string, string> = {
  Diabetes: "bg-blue-100 text-blue-800 border-blue-300",
  Hipertensão: "bg-red-100 text-red-800 border-red-300",
  "Renal Crônico": "bg-orange-100 text-orange-800 border-orange-300",
  Obesidade: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Saúde Mental": "bg-gray-100 text-gray-800 border-gray-300",
  "Problemas Respiratórios": "bg-purple-100 text-purple-800 border-purple-300",
  Neoplasias: "bg-pink-100 text-pink-800 border-pink-300",
};

interface ComorbidityDetail {
  type: string;
  year: string;
  controlled: string;
  lastConsult: string;
  pressaoSistolica?: string;
  pressaoDiastolica?: string;
  medicacaoPressao?: string;
  ultimaGlicemia?: string;
  tipoDiabetes?: string;
  medicacaoDiabetes?: string;
}

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/pacientes/novo/:specialty");
  const { user } = useAuth();
  const photoRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [lastConsultDate, setLastConsultDate] = useState("");
  const [painLevel, setPainLevel] = useState(0);

  // Estado para o CPF na tela (formatado)
  const [cpfTela, setCpfTela] = useState("");

  // Função para quando o usuário digita o CPF (CORRIGIDO: agora chama formatCPF)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasNumeros = e.target.value.replace(/\D/g, "");
    setCpfTela(formatCPF(apenasNumeros)); // ← Mudei de formatCPFparaExibir para formatCPF
  };

  // NOVOS ESTADOS PARA PROFESSOR SUPERVISOR (SÓ PARA ESTUDANTES)
  const [professorCrm, setProfessorCrm] = useState("");
  const [professorNome, setProfessorNome] = useState("");
  const [buscandoProfessor, setBuscandoProfessor] = useState(false);

  const requestedSpecialty = (params as any)?.specialty as string | undefined;
  const selectedSpecialty = requestedSpecialty || user?.specialty || "medicina";
  const consultaType = selectedSpecialty === "odontologia" ? "odonto" : "medico";
  const isDentista = consultaType === "odonto";

  const [selectedLab, setSelectedLab] = useState("Glicemia");
  const [labValue, setLabValue] = useState("");
  const [labDate, setLabDate] = useState("");

  const [s1, setS1] = useState({
    name: "",
    cpf: "",
    email: "",
    dob: "",
    phone: "",
    weight: "",
    height: "",
    sex: "",
    address: "",
    motivoConsulta: "",
    exameStatus: "normal" as string,
    historicoFamiliar: [] as string[],
  });

  const [s2, setS2] = useState({
    comorbidities: [] as string[],
    details: {} as Record<string, ComorbidityDetail>,
    medications: "",
    allergies: "",
  });

  const [s3, setS3] = useState({
    bloodValues: "",
    imageTypes: [] as string[],
    examPhoto: null as string | null,
  });

  const [s4, setS4] = useState({
    queixa: "",
    extraoral: "",
    intraoral: "",
    oclusal: "",
    encaminhamento: "",
    doresATM: [] as string[],
    habitos: [] as string[],
    prescricaoTexto: "",
    vereditoGeral: "",
    pressaoArterial: "",
    frequenciaCardiaca: "",
  });

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothData, setToothData] = useState<
    Record<number, { diag: string; conduta: string }>
  >({});
  const [tempMed, setTempMed] = useState<{
    nome: string;
    dose: string;
    dias: string;
  } | null>(null);

  const medicamentosOdonto = [
    "Amoxicilina 500mg",
    "Amoxicilina + Clavulanato 875mg",
    "Metronidazol 400mg",
    "Ibuprofeno 600mg",
    "Nimesulida 100mg",
    "Cetorolaco 10mg (S.L)",
    "Dipirona Sódica 500mg",
    "Paracetamol 750mg",
    "Dexametasona 4mg",
    "Clorexidina 0.12% (Solução)",
    "Clorexidina 0.2% (Gel)",
  ];

  const medicamentosMedicina = [
    "Losartana 50mg",
    "Atenolol 25mg",
    "Omeprazol 20mg",
    "Metformina 500mg",
    "Sinvastatina 20mg",
    "Amoxicilina 500mg",
    "Azitromicina 500mg",
    "Prednisona 20mg",
    "Diazepam 5mg",
    "Fluoxetina 20mg",
  ];

  const medicamentosAtuais = isDentista
    ? medicamentosOdonto
    : medicamentosMedicina;

  // Função para buscar professor pelo CRM/CRO
  const buscarProfessorPorCRM = async (crm: string) => {
    if (crm.length < 5) return;

    setBuscandoProfessor(true);
    try {
      const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const professor = allUsers.find(
        (u: any) => u.registroProfissional === crm && u.role === "profissional",
      );

      if (professor) {
        setProfessorNome(professor.name);
        alert(`Professor encontrado: ${professor.name}`);
      } else {
        setProfessorNome("");
        alert(
          `Professor não encontrado! Verifique o ${user?.specialty === "odontologia" ? "CRO" : "CRM"}.`,
        );
      }
    } catch (error) {
      console.error("Erro ao buscar professor:", error);
      alert("Erro ao buscar professor.");
    } finally {
      setBuscandoProfessor(false);
    }
  };

  const getComorbidityColor = (comorbidityType: string) => {
    if (comorbidityType === "Diabetes") return pathologyColors.Diabetes;
    if (
      comorbidityType === "Hipertensão" ||
      comorbidityType === "Cardiovascular"
    )
      return pathologyColors.Hipertensão;
    if (comorbidityType === "Renal" || comorbidityType === "Renal Crônico")
      return pathologyColors["Renal Crônico"];
    if (comorbidityType === "Obesidade") return pathologyColors.Obesidade;
    if (comorbidityType === "Saúde Mental")
      return pathologyColors["Saúde Mental"];
    if (
      comorbidityType === "Respiratória" ||
      comorbidityType === "Problemas Respiratórios"
    )
      return pathologyColors["Problemas Respiratórios"];
    if (comorbidityType === "Câncer" || comorbidityType === "Neoplasias")
      return pathologyColors.Neoplasias;
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const buscarPacientePorCPF = () => {
    const cpfLimpo = s1.cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      alert("Digite um CPF válido com 11 números!");
      return;
    }

    try {
      const allPatients = JSON.parse(localStorage.getItem("patients") || "[]");
      const pacienteExistente = allPatients.find(
        (p: any) => p.cpf === cpfLimpo,
      );

      if (pacienteExistente) {
        if (
          confirm("Paciente encontrado! Deseja carregar os dados anteriores?")
        ) {
          setS1({
            ...s1,
            name: pacienteExistente.name || "",
            cpf: pacienteExistente.cpf || "",
            dob: pacienteExistente.dob || "",
            phone: pacienteExistente.phone || "",
            address: pacienteExistente.address || "",
            weight: pacienteExistente.weight || "",
            height: pacienteExistente.height || "",
            historicoFamiliar: pacienteExistente.historicoFamiliar || [],
            motivoConsulta: pacienteExistente.motivoConsulta || "",
          });

          setS2({
            ...s2,
            comorbidities: pacienteExistente.comorbidities || [],
            medications: pacienteExistente.medications || "",
            allergies: pacienteExistente.allergies || "",
          });

          if (pacienteExistente.lastConsultDate) {
            setLastConsultDate(pacienteExistente.lastConsultDate);
          }

          if (pacienteExistente.painLevel) {
            setPainLevel(pacienteExistente.painLevel);
          }

          alert("Dados carregados com sucesso!");
        }
      } else {
        alert("Paciente não encontrado. Preencha os dados normalmente.");
      }
    } catch (error) {
      console.error("Erro ao buscar paciente:", error);
      alert("Erro ao buscar paciente.");
    }
  };

  const enviarWhatsApp = () => {
    const phone = s1.phone.replace(/\D/g, "");
    if (phone.length < 10) {
      alert("Número de telefone inválido! Cadastre um número com DDD.");
      return;
    }

    const message = `🏥 *VIGIE HEALTH MONITOR* 🏥
*TIPO:* ${isDentista ? "🦷 ODONTOLOGIA" : "🩺 MEDICINA"}

*PACIENTE:* ${s1.name}
*CPF:* ${s1.cpf}
*DATA:* ${new Date().toLocaleDateString()}

*📊 AVALIAÇÃO:*
${s4.vereditoGeral.substring(0, 300)}...

*😖 NÍVEL DE DOR:* ${painLevel}/10
*📅 PRÓXIMA CONSULTA:* ${lastConsultDate || "A agendar"}

*👨‍⚕️ Profissional:* ${user?.name || "Dr(a)"}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, "_blank");
  };

  const checkDTMRisk = () => {
    if (!isDentista) return null;

    const sintomasGraves = [
      "Estalo ATM",
      "Dor Ouvido",
      "Dor Miofacial",
      "Dor Cabeça",
    ];
    const selecionados = s4.doresATM.filter((d) => sintomasGraves.includes(d));
    if (selecionados.length >= 2)
      return {
        status: "ALTO RISCO DTM",
        color: "text-red-600",
        bg: "bg-red-50",
        desc: "Suspeita clínica de DTM. Realizar palpação muscular.",
      };
    if (selecionados.length === 1)
      return {
        status: "RISCO MODERADO",
        color: "text-amber-600",
        bg: "bg-amber-50",
        desc: "Sintomatologia isolada. Monitorar hábitos.",
      };
    return null;
  };

  const gerarEvolucaoAutomatica = () => {
    let texto = `SINAIS VITAIS: PA ${s4.pressaoArterial || "N/A"} mmHg | FC ${s4.frequenciaCardiaca || "N/A"} bpm\n\n`;
    texto += `NÍVEL DE DOR: ${painLevel}/10\n\n`;
    texto += `TIPO DE CONSULTA: ${isDentista ? "ODONTOLOGIA" : "MEDICINA"}\n\n`;

    if (isDentista) {
      texto += "EVOLUÇÃO CLÍNICA ODONTOLÓGICA:\n";
      const achados = Object.entries(toothData).filter(
        ([_, data]) => data.diag !== "" || data.conduta !== "",
      );
      if (achados.length > 0) {
        achados.forEach(([dente, data]) => {
          texto += `- Unidade ${dente}: ${data.diag ? "Diag: " + data.diag : ""} ${data.conduta ? "| Cond: " + data.conduta : ""}\n`;
        });
      }
      texto += `\nOCLUSÃO: ${s4.oclusal || "Classe I"}\n`;
      const dtmRisk = checkDTMRisk();
      if (dtmRisk) texto += `ATM: ${dtmRisk.status}\n`;
      if (s4.habitos.length > 0) texto += `HÁBITOS: ${s4.habitos.join(", ")}\n`;
    } else {
      texto += "EVOLUÇÃO CLÍNICA MÉDICA:\n";
      texto += `${s4.vereditoGeral || "Aguardando avaliação"}\n`;
    }

    if (s4.encaminhamento) texto += `\nENCAMINHAMENTO: ${s4.encaminhamento}\n`;
    setS4({ ...s4, vereditoGeral: texto });
  };

  const toggle = (
    val: string,
    category: "comorbidities" | "historicoFamiliar",
  ) => {
    if (category === "comorbidities") {
      const exists = s2.comorbidities.includes(val);
      setS2((prev) => ({
        ...prev,
        comorbidities: exists
          ? prev.comorbidities.filter((x) => x !== val)
          : [...prev.comorbidities, val],
        details: exists
          ? Object.fromEntries(
              Object.entries(prev.details).filter(([k]) => k !== val),
            )
          : {
              ...prev.details,
              [val]: { type: "", year: "", controlled: "", lastConsult: "" },
            },
      }));
    } else {
      setS1((prev) => ({
        ...prev,
        historicoFamiliar: prev.historicoFamiliar.includes(val)
          ? prev.historicoFamiliar.filter((x) => x !== val)
          : [...prev.historicoFamiliar, val],
      }));
    }
  };

  const updateDetail = (
    cond: string,
    field: keyof ComorbidityDetail,
    value: string,
  ) => {
    setS2((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [cond]: { ...prev.details[cond], [field]: value },
      },
    }));
  };

  const handleAddLab = () => {
    if (!labValue) return;
    const v = parseFloat(labValue);
    let alt =
      (selectedLab === "Glicemia" && v > 99) ||
      (selectedLab === "INR" && v > 1.2) ||
      (selectedLab === "Plaquetas" && v < 150000);
    const txt = `${selectedLab}: ${v} ${alt ? "(Alt)" : "(Ok)"} - ${labDate}`;
    setS3((prev) => ({
      ...prev,
      bloodValues: (prev.bloodValues ? prev.bloodValues + "\n" : "") + txt,
    }));
    if (alt) setS1((prev) => ({ ...prev, exameStatus: "alterado" }));
    setLabValue("");
  };

  const addMedToPrescription = () => {
    if (!tempMed?.dose || !tempMed.dias) return;
    const novoTexto = `• ${tempMed.nome}\nPosologia: Tomar de ${tempMed.dose} por ${tempMed.dias}.\n\n`;
    setS4({ ...s4, prescricaoTexto: s4.prescricaoTexto + novoTexto });
    setTempMed(null);
  };

  const getImcData = () => {
    const w = parseFloat(s1.weight);
    const h = parseFloat(s1.height) / 100;
    if (w > 0 && h > 1) {
      const imcVal = parseFloat((w / (h * h)).toFixed(1));
      const category =
        imcVal < 25 ? "Normal" : imcVal < 30 ? "Sobrepeso" : "Obesidade";
      return {
        imc: imcVal,
        category: category,
      };
    }
    return null;
  };

  // ========== FUNÇÃO PARA CRIAR QUESTIONÁRIOS ==========
  const criarQuestionarios = (
    comorbidades: string[],
    pacienteCpf: string,
    pacienteNome: string,
  ) => {
    const questionariosPendentes: any[] = [];
    const comorbidadesUnicas = Array.from(new Set(comorbidades.map((c) => c.trim())));

    comorbidadesUnicas.forEach((comorbidade) => {
      const config = getQuestionarioPorComorbidade(comorbidade);
      if (!config) return;

      questionariosPendentes.push({
        ...config,
        id: `${config.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        dataEnvio: new Date().toISOString(),
        respondido: false,
        pacienteNome,
        pacienteCpf,
        perguntas: config.perguntas.map((pergunta) => ({ ...pergunta })),
      });
    });

    if (questionariosPendentes.length > 0) {
      const chave = `questionarios_${pacienteCpf}`;
      const existentes = JSON.parse(localStorage.getItem(chave) || "[]");
      localStorage.setItem(
        chave,
        JSON.stringify([...existentes, ...questionariosPendentes]),
      );
    }
  };
  // ========== FUNÇÃO handleFinish (VERSÃO CORRIGIDA) ==========
  const handleFinish = async () => {
    try {
      console.log("=== HANDLEFINISH INICIADO ===");

      if (!s1.name.trim()) {
        alert("Por favor, preencha o nome do paciente antes de finalizar!");
        setStep(0);
        return;
      }

      if (user?.role === "estudante" && !professorNome) {
        alert(
          `Por favor, informe e valide o ${user?.specialty === "odontologia" ? "CRO" : "CRM"} do Professor Supervisor!`,
        );
        setStep(0);
        return;
      }

      const imcObj = getImcData();

      let comorbidities = Object.values(s2.details)
        .filter((d) => d.type && d.type !== "")
        .map((d) => d.type);

      if (
        imcObj?.category === "Obesidade" &&
        !comorbidities.includes("Obesidade")
      ) {
        comorbidities.push("Obesidade");
      }

      if (isDentista) {
        comorbidities.push("Odontológico");
        console.log("✅ Adicionado monitoramento odontológico");
      }

      console.log("Comorbidades salvas:", comorbidities);

      // ========== VALIDAÇÃO E FORMATAÇÃO DO CPF ==========
      const cpfLimpo = unformatCPF(cpfTela);
      if (!isValidCPF(cpfLimpo)) {
        alert("❌ CPF inválido! Digite um CPF válido com 11 dígitos.");
        setStep(0);
        return;
      }

      // Verificar duplicado no banco de dados
      const pacienteExistente = await getPatientByCPF(cpfLimpo);

      if (pacienteExistente) {
        alert(
          `❌ JÁ EXISTE UM PACIENTE COM ESTE CPF!\n\nPaciente: ${pacienteExistente.name}\nCPF: ${pacienteExistente.cpf}\nUse um CPF diferente.`,
        );
        setStep(0);
        return;
      }

      // Criar objeto do paciente
      const computedRisk = comorbidities.length >= 2 ? "high" : comorbidities.length === 1 ? "medium" : "low";
      const novoPaciente = {
        id: Date.now().toString(),
        name: s1.name,
        cpf: cpfLimpo,
        password: cpfLimpo.slice(-6) || "123456",
        email: s1.email || "",
        dob: s1.dob,
        phone: s1.phone,
        weight: s1.weight,
        height: s1.height,
        sex: s1.sex,
        address: s1.address,
        motivoConsulta: s1.motivoConsulta,
        exameStatus: s1.exameStatus,
        historicoFamiliar: s1.historicoFamiliar,
        comorbidities: comorbidities,
        medications: s2.medications,
        allergies: s2.allergies,
        prescricao: s4.prescricaoTexto,
        encaminhamento: s4.encaminhamento,
        vereditoGeral: s4.vereditoGeral,
        pressaoArterial: s4.pressaoArterial,
        frequenciaCardiaca: s4.frequenciaCardiaca,
        lastConsultDate: lastConsultDate,
        painLevel: painLevel,
        registeredAt: new Date().toISOString(),
        registeredBy: user?.name || user?.cpf,
        finalRisk: computedRisk,
      };

      // Salvar no banco de dados
      await savePatient(novoPaciente);

      // Criar questionários
      criarQuestionarios(comorbidities, cpfLimpo, s1.name);

      alert("✅ Paciente cadastrado com sucesso!");

      // Redirecionar para o dashboard correto
      setLocation("/");
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
      alert("❌ Erro ao salvar paciente! Tente novamente.");
    }
  };
  // ==========================================

  const totalSteps = 5;

  const ComorbidityBadge = ({ name }: { name: string }) => {
    const colorClass = getComorbidityColor(name);
    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-bold border ${colorClass} shadow-sm`}
      >
        {name}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-40">
      <div className="sticky top-0 z-50 bg-white border-b p-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={() =>
            setLocation(
              user?.specialty === "odontologia"
                ? "/dentista/dashboard"
                : "/medico/dashboard",
            )
          }
        >
          <Lucide.ChevronLeft size={24} className="text-[#7B2335]" />
        </button>
        <h1 className="font-black text-sm text-[#7B2335] uppercase italic">
          {isDentista ? "Nova Consulta Odontológica" : "Nova Consulta Médica"}
        </h1>
        <button
          onClick={enviarWhatsApp}
          className="ml-auto p-2 bg-green-100 rounded-full hover:bg-green-200 transition-all"
          title="Enviar resumo por WhatsApp"
        >
          <Lucide.MessageCircle size={18} className="text-green-600" />
        </button>
        <div className="text-xs font-bold text-slate-400">
          Step {step + 1}/{totalSteps}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-8">
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center block">
              Identificação Civil
            </label>

            <div className="flex gap-2">
              <input
                className="flex-1 p-5 bg-slate-50 border rounded-[22px] font-bold outline-none"
                placeholder="Nome Completo"
                value={s1.name}
                onChange={(e) => setS1({ ...s1, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none pr-12"
                  placeholder="CPF"
                  value={cpfTela}
                  onChange={handleCpfChange}
                  maxLength={14}
                />
                <button
                  onClick={buscarPacientePorCPF}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#7B2335] text-white rounded-full"
                  title="Buscar paciente pelo CPF"
                >
                  <Lucide.Search size={16} />
                </button>
              </div>
              <input
                type="date"
                className="p-5 bg-slate-50 border rounded-[22px] text-sm font-bold"
                value={s1.dob}
                onChange={(e) => setS1({ ...s1, dob: e.target.value })}
              />
            </div>

            {/* Idade calculada */}
            {s1.dob && (
              <div className="p-3 bg-slate-100 rounded-xl text-center">
                <span className="text-xs font-black text-slate-500">
                  Idade calculada:
                </span>
                <span className="ml-2 font-black text-[#7B2335]">
                  {calcularIdade(s1.dob)} anos
                </span>
              </div>
            )}

            <div className="space-y-4 mt-4">
              <input
                type="tel"
                className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none"
                placeholder="Telefone de Contato"
                value={s1.phone}
                onChange={(e) => setS1({ ...s1, phone: e.target.value })}
              />
              <input
                className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none"
                placeholder="Endereço Completo"
                value={s1.address}
                onChange={(e) => setS1({ ...s1, address: e.target.value })}
              />

              <div>
                <label className="text-[10px] font-black text-slate-400 mb-1 block ml-2">
                  📅 Data da Última Consulta
                </label>
                <input
                  type="date"
                  className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none"
                  value={lastConsultDate}
                  onChange={(e) => setLastConsultDate(e.target.value)}
                />
              </div>

              {/* Nível de Dor */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lucide.Activity size={14} className="text-red-500" /> Nível
                  de Dor (0-10)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPainLevel(level)}
                      className={`w-10 h-10 rounded-full font-bold transition-all ${
                        painLevel === level
                          ? level > 7
                            ? "bg-red-600 text-white"
                            : level > 4
                              ? "bg-orange-500 text-white"
                              : "bg-green-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-green-600">Sem Dor</span>
                  <span className="text-orange-500">Dor Moderada</span>
                  <span className="text-red-600">Dor Intensa</span>
                </div>
              </div>

              <textarea
                className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none min-h-[100px] resize-none"
                placeholder="Motivo inicial da consulta (Queixa principal / Anamnese)"
                value={s1.motivoConsulta}
                onChange={(e) =>
                  setS1({ ...s1, motivoConsulta: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                className="p-5 bg-slate-50 border rounded-[22px] font-bold"
                placeholder="Peso (kg)"
                value={s1.weight}
                onChange={(e) => setS1({ ...s1, weight: e.target.value })}
              />
              <input
                type="number"
                className="p-5 bg-slate-50 border rounded-[22px] font-bold"
                placeholder="Altura (cm)"
                value={s1.height}
                onChange={(e) => setS1({ ...s1, height: e.target.value })}
              />
            </div>

            {/* CAMPO PARA PROFESSOR SUPERVISOR (SÓ PARA ESTUDANTES) */}
            {user?.role === "estudante" && (
              <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <label className="text-[11px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                  <Lucide.GraduationCap size={14} /> Professor Supervisor
                  (Obrigatório)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-4 bg-white border border-amber-200 rounded-xl font-bold outline-none focus:border-[#7B2335] transition-all"
                    placeholder={
                      user?.specialty === "odontologia"
                        ? "CRO do Professor"
                        : "CRM do Professor"
                    }
                    value={professorCrm}
                    onChange={(e) => {
                      setProfessorCrm(e.target.value);
                      setProfessorNome("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => buscarProfessorPorCRM(professorCrm)}
                    disabled={buscandoProfessor || professorCrm.length < 5}
                    className="px-4 bg-[#7B2335] text-white rounded-xl font-black text-sm disabled:opacity-50"
                  >
                    {buscandoProfessor ? "..." : "BUSCAR"}
                  </button>
                </div>
                <p className="text-[10px] text-amber-700">
                  {user?.specialty === "odontologia"
                    ? "Digite o CRO do professor responsável pela supervisão"
                    : "Digite o CRM do professor responsável pela supervisão"}
                </p>
                {professorNome && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs font-black text-green-700">
                      ✓ Professor vinculado: {professorNome}
                    </p>
                  </div>
                )}
                {!professorNome && professorCrm.length >= 5 && (
                  <p className="text-xs text-red-500">
                    ⚠️ Professor não encontrado. Verifique o{" "}
                    {user?.specialty === "odontologia" ? "CRO" : "CRM"}.
                  </p>
                )}
              </div>
            )}

            {getImcData() && (
              <div className="p-5 bg-[#7B2335] rounded-[22px] flex items-center justify-between text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black text-lg">
                    {getImcData()?.imc}
                  </div>
                  <span className="font-black uppercase tracking-tighter">
                    {getImcData()?.category}
                  </span>
                </div>
                <Lucide.CheckCircle2 size={24} className="opacity-40" />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lucide.User size={14} className="text-[#7B2335]" /> Histórico
                Familiar
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Diabetes",
                  "Hipertensão",
                  "Infarto",
                  "AVC",
                  "Câncer",
                  "Doença Renal",
                  "Asma",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(c, "historicoFamiliar")}
                    className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${s1.historicoFamiliar.includes(c) ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-100"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lucide.Heart size={14} className="text-[#7B2335]" /> Condições
                Sistêmicas
              </label>

              {s2.comorbidities.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
                  {s2.comorbidities.map((cond) => (
                    <ComorbidityBadge key={cond} name={cond} />
                  ))}
                </div>
              )}

              <select
                className="w-full p-5 bg-slate-50 border rounded-[22px] font-black outline-none"
                onChange={(e) => {
                  if (e.target.value) {
                    toggle(e.target.value, "comorbidities");
                    e.target.value = "";
                  }
                }}
              >
                <option value="">+ Selecionar Doença</option>
                {[
                  "Cardiovascular",
                  "Diabetes",
                  "Respiratória",
                  "Câncer",
                  "Saúde Mental",
                  "Renal",
                  "Outro",
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {s2.comorbidities.map((cond) => (
                <div
                  key={cond}
                  className="p-6 bg-white border-2 border-slate-100 rounded-[32px] space-y-4 shadow-md relative animate-in zoom-in-95"
                  style={{ borderLeftColor: "#7B2335", borderLeftWidth: "4px" }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(cond, "comorbidities")}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                  >
                    <Lucide.X size={16} />
                  </button>
                  <h4 className="font-black text-[10px] text-[#7B2335] uppercase border-b pb-2">
                    {cond}
                  </h4>
                  <select
                    className="w-full p-4 bg-slate-50 border rounded-xl text-sm font-bold outline-none"
                    value={s2.details[cond]?.type || ""}
                    onChange={(e) => updateDetail(cond, "type", e.target.value)}
                  >
                    <option value="">Escolha a Patologia...</option>
                    {cond === "Cardiovascular" &&
                      [
                        "Hipertensão Arterial",
                        "Infarto Prévio",
                        "AVC",
                        "Arritmia",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    {cond === "Diabetes" &&
                      ["Tipo 1", "Tipo 2", "Gestacional", "Pré-Diabetes"].map(
                        (d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ),
                      )}
                    {cond === "Respiratória" &&
                      [
                        "Asma",
                        "DPOC",
                        "Bronquite",
                        "Problemas Respiratórios",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    {cond === "Câncer" &&
                      [
                        "Próstata",
                        "Mama",
                        "Pulmão",
                        "Leucemia",
                        "Neoplasias",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    {cond === "Saúde Mental" &&
                      [
                        "Depressão",
                        "Ansiedade",
                        "Bipolaridade",
                        "Pânico",
                        "Saúde Mental",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    {cond === "Renal" &&
                      [
                        "Insuficiência Renal",
                        "Dialítico",
                        "Rim Único",
                        "Renal Crônico",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    {cond === "Outro" && (
                      <option value="Outro">Outra Condição</option>
                    )}
                  </select>

                  {/* ========== CAMPOS ESPECÍFICOS POR COMORBIDADE ========== */}
                  {cond === "Cardiovascular" && (
                    <div className="space-y-3 p-3 bg-blue-50 rounded-xl">
                      <label className="text-[10px] font-black text-blue-700">
                        Última medição de Pressão Arterial
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Sistólica"
                          className="flex-1 p-3 bg-white border rounded-xl text-sm"
                          value={s2.details[cond]?.pressaoSistolica || ""}
                          onChange={(e) =>
                            updateDetail(
                              cond,
                              "pressaoSistolica",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="Diastólica"
                          className="flex-1 p-3 bg-white border rounded-xl text-sm"
                          value={s2.details[cond]?.pressaoDiastolica || ""}
                          onChange={(e) =>
                            updateDetail(
                              cond,
                              "pressaoDiastolica",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <label className="text-[10px] font-black text-blue-700">
                        Medicação para pressão
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Losartana 50mg"
                        className="w-full p-3 bg-white border rounded-xl text-sm"
                        value={s2.details[cond]?.medicacaoPressao || ""}
                        onChange={(e) =>
                          updateDetail(cond, "medicacaoPressao", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {cond === "Diabetes" && (
                    <div className="space-y-3 p-3 bg-green-50 rounded-xl">
                      <label className="text-[10px] font-black text-green-700">
                        Última glicemia (mg/dL)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 110"
                        className="w-full p-3 bg-white border rounded-xl text-sm"
                        value={s2.details[cond]?.ultimaGlicemia || ""}
                        onChange={(e) =>
                          updateDetail(cond, "ultimaGlicemia", e.target.value)
                        }
                      />
                      <label className="text-[10px] font-black text-green-700">
                        Tipo de Diabetes
                      </label>
                      <select
                        className="w-full p-3 bg-white border rounded-xl text-sm"
                        value={s2.details[cond]?.tipoDiabetes || ""}
                        onChange={(e) =>
                          updateDetail(cond, "tipoDiabetes", e.target.value)
                        }
                      >
                        <option value="">Selecione</option>
                        <option value="tipo1">Tipo 1</option>
                        <option value="tipo2">Tipo 2</option>
                        <option value="gestacional">Gestacional</option>
                      </select>
                      <label className="text-[10px] font-black text-green-700">
                        Medicação para diabetes
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Metformina 500mg, Insulina..."
                        className="w-full p-3 bg-white border rounded-xl text-sm"
                        value={s2.details[cond]?.medicacaoDiabetes || ""}
                        onChange={(e) =>
                          updateDetail(
                            cond,
                            "medicacaoDiabetes",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  )}
                  {/* ========================================================= */}

                  <div className="flex gap-2">
                    {["Controlada", "Não Controlada"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => updateDetail(cond, "controlled", opt)}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all ${s2.details[cond]?.controlled === opt ? "bg-[#7B2335] text-white border-[#7B2335]" : "bg-white text-slate-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2">
                <Lucide.Pill size={12} /> Medicamentos
              </label>
              <textarea
                className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm min-h-[80px] outline-none font-bold"
                placeholder="Liste remédios..."
                value={s2.medications}
                onChange={(e) => setS2({ ...s2, medications: e.target.value })}
              />
              <label className="text-[11px] font-black text-red-400 uppercase ml-2 flex items-center gap-2">
                <Lucide.AlertTriangle size={12} /> Alergias
              </label>
              <textarea
                className="w-full p-5 bg-red-50/10 border border-red-100 rounded-[22px] text-sm min-h-[80px] outline-none font-bold text-red-900"
                placeholder="Alergias..."
                value={s2.allergies}
                onChange={(e) => setS2({ ...s2, allergies: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4 shadow-sm">
              <label className="text-[11px] font-black uppercase text-[#7B2335] flex items-center gap-2">
                <Lucide.FlaskConical size={14} /> Exames Laboratoriais
              </label>
              <select
                className="w-full p-4 bg-white border rounded-2xl text-sm font-black outline-none shadow-inner"
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
              >
                <option value="Glicemia">Glicemia Jejum (70-99)</option>
                <option value="Hemoglobina Glicada">
                  HbA1c (Normal até 5.7)
                </option>
                <option value="Creatinina">Creatinina (0.7-1.3)</option>
                <option value="Ureia">Ureia (15-45)</option>
                <option value="INR">INR (1.0-1.2)</option>
                <option value="Plaquetas">Plaquetas (Min 150k)</option>
                <option value="Hemoglobina">Hemoglobina (Anemia)</option>
                <option value="PCR">PCR (Inflamação)</option>
                <option value="Leucócitos">Leucócitos (Infecção)</option>
                <option value="TGO/TGP">TGO/TGP (Fígado)</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="p-4 border rounded-2xl text-xs font-bold outline-none"
                  value={labDate}
                  onChange={(e) => setLabDate(e.target.value)}
                />
                <input
                  type="number"
                  className="p-4 border rounded-2xl font-bold outline-none"
                  placeholder="Valor"
                  value={labValue}
                  onChange={(e) => setLabValue(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleAddLab}
                className="w-full py-5 bg-[#7B2335] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg"
              >
                + Analisar Resultado
              </button>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-3xl text-[10px] whitespace-pre-line text-slate-500 min-h-[60px] shadow-inner font-bold italic">
              {s3.bloodValues || "Nenhum exame inserido..."}
            </div>
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4">
              <label className="text-[11px] font-black uppercase text-[#7B2335] flex items-center gap-2">
                <Lucide.Camera size={14} /> Exames de Imagem
              </label>
              <div className="flex flex-wrap gap-2">
                {["Raio-X", "Tomografia", "Ressonância", "Ultrassom"].map(
                  (img) => (
                    <button
                      key={img}
                      onClick={() =>
                        setS3((p) => ({
                          ...p,
                          imageTypes: p.imageTypes.includes(img)
                            ? p.imageTypes.filter((x) => x !== img)
                            : [...p.imageTypes, img],
                        }))
                      }
                      className={`px-4 py-2 rounded-xl border-2 text-[10px] font-black transition-all ${s3.imageTypes.includes(img) ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-100"}`}
                    >
                      {img}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => photoRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center gap-2 text-slate-400 hover:border-[#7B2335]"
              >
                <Lucide.Camera size={32} />
                <span className="text-[10px] font-black uppercase font-bold">
                  {s3.examPhoto ? "LAUDO CAPTURADO ✅" : "FOTO DO LAUDO"}
                </span>
              </button>
              <input
                ref={photoRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setS3({ ...s3, examPhoto: "ok" });
                }}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right pb-10">
            <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[32px] space-y-4 shadow-sm">
              <label className="text-[11px] font-black uppercase text-amber-900 flex items-center gap-2">
                <Lucide.Activity size={14} /> Sinais Vitais
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="p-4 bg-white border-amber-200 border rounded-2xl font-black text-center text-[#7B2335]"
                  placeholder="PA Ex: 120/80"
                  value={s4.pressaoArterial}
                  onChange={(e) =>
                    setS4({ ...s4, pressaoArterial: e.target.value })
                  }
                />
                <input
                  className="p-4 bg-white border-amber-200 border rounded-2xl font-black text-center text-[#7B2335]"
                  placeholder="FC bpm"
                  value={s4.frequenciaCardiaca}
                  onChange={(e) =>
                    setS4({ ...s4, frequenciaCardiaca: e.target.value })
                  }
                />
              </div>
            </div>

            {isDentista && (
              <>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] shadow-sm">
                  <label className="text-[11px] font-black uppercase text-[#7B2335] mb-4 block text-center">
                    Mapa Dentário FDI
                  </label>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 ml-1 italic">
                    Arcada Superior
                  </p>
                  <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
                    {[
                      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26,
                      27, 28,
                    ].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedTooth(d)}
                        className={`min-w-[35px] h-10 rounded-lg border-2 font-black text-[10px] transition-all ${selectedTooth === d ? "bg-[#7B2335] text-white border-[#7B2335]" : "bg-white text-slate-400 border-slate-100"}`}
                      >
                        {d}
                        <div
                          className={`w-1 h-1 rounded-full mx-auto ${toothData[d] ? "bg-amber-500" : ""}`}
                        ></div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 mt-2 ml-1 italic">
                    Arcada Inferior
                  </p>
                  <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
                    {[
                      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36,
                      37, 38,
                    ].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedTooth(d)}
                        className={`min-w-[35px] h-10 rounded-lg border-2 font-black text-[10px] transition-all ${selectedTooth === d ? "bg-[#7B2335] text-white border-[#7B2335]" : "bg-white text-slate-400 border-slate-100"}`}
                      >
                        {d}
                        <div
                          className={`w-1 h-1 rounded-full mx-auto ${toothData[d] ? "bg-amber-500" : ""}`}
                        ></div>
                      </button>
                    ))}
                  </div>
                  {selectedTooth && (
                    <div className="mt-4 p-5 bg-white border-2 border-[#7B2335]/20 rounded-[28px] shadow-lg space-y-4 animate-in zoom-in">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-black text-[#7B2335] text-xs">
                          Unidade {selectedTooth}
                        </h4>
                        <button
                          onClick={() => setSelectedTooth(null)}
                          className="text-[10px] font-black text-slate-300"
                        >
                          FECHAR
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[8px] font-black text-slate-400 uppercase underline italic">
                            Diagnóstico
                          </p>
                          {[
                            "Cárie",
                            "Fratura",
                            "Ausente",
                            "Hígido",
                            "Pulpíte",
                          ].map((op) => (
                            <button
                              key={op}
                              onClick={() =>
                                setToothData({
                                  ...toothData,
                                  [selectedTooth]: {
                                    ...(toothData[selectedTooth] || {
                                      conduta: "",
                                    }),
                                    diag: op,
                                  },
                                })
                              }
                              className={`w-full p-2 border rounded-lg text-[9px] font-bold uppercase ${toothData[selectedTooth]?.diag === op ? "bg-slate-800 text-white" : "bg-slate-50"}`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[8px] font-black text-slate-400 uppercase underline italic">
                            Conduta
                          </p>
                          {[
                            "Restauração",
                            "Exodontia",
                            "Endo",
                            "Limpeza",
                            "Provisório",
                          ].map((op) => (
                            <button
                              key={op}
                              onClick={() =>
                                setToothData({
                                  ...toothData,
                                  [selectedTooth]: {
                                    ...(toothData[selectedTooth] || {
                                      diag: "",
                                    }),
                                    conduta: op,
                                  },
                                })
                              }
                              className={`w-full p-2 border rounded-lg text-[9px] font-bold uppercase ${toothData[selectedTooth]?.conduta === op ? "bg-[#7B2335] text-white" : "bg-slate-50"}`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const n = { ...toothData };
                          delete n[selectedTooth];
                          setToothData(n);
                          setSelectedTooth(null);
                        }}
                        className="w-full py-2 bg-slate-100 text-slate-400 text-[8px] font-black rounded-lg"
                      >
                        Reset Dente
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4 shadow-sm">
                  <label className="text-[11px] font-black uppercase text-[#7B2335] flex items-center gap-2">
                    <Lucide.Activity size={14} /> Classificação de Oclusão
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Classe I", "Classe II", "Classe III"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setS4({ ...s4, oclusal: item })}
                        className={`p-4 rounded-2xl border-2 text-[10px] font-black transition-all ${s4.oclusal === item ? "bg-[#7B2335] text-white border-[#7B2335]" : "bg-white text-slate-400 border-slate-100"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4 shadow-sm relative">
                  <label className="text-[11px] font-black uppercase text-[#7B2335] flex items-center gap-2">
                    <Lucide.UserSearch size={14} /> ATM e Sintomas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Estalo na abertura",
                      "Estalo no fechamento",
                      "Crepitação (ruído)",
                      "Dor à palpação",
                      "Dor ao mastigar",
                      "Dor de cabeça",
                      "Dor no ouvido",
                      "Limitação de abertura",
                      "Desvio na abertura",
                      "Travamento",
                      "Fadiga muscular",
                      "Bruxismo (rangeção)",
                      "Aperto dentário",
                    ].map((dor) => (
                      <button
                        key={dor}
                        onClick={() => {
                          const novo = s4.doresATM.includes(dor)
                            ? s4.doresATM.filter((d) => d !== dor)
                            : [...s4.doresATM, dor];
                          setS4({ ...s4, doresATM: novo });
                        }}
                        className={`px-3 py-2 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${
                          s4.doresATM.includes(dor)
                            ? "bg-[#7B2335] text-white border-[#7B2335]"
                            : "bg-white text-slate-500 border-slate-200 hover:border-[#7B2335]"
                        }`}
                      >
                        {dor}
                      </button>
                    ))}
                  </div>
                  {checkDTMRisk() && (
                    <div
                      className={`p-4 rounded-2xl border ${checkDTMRisk()?.bg} ${checkDTMRisk()?.color} animate-in zoom-in mt-2`}
                    >
                      <p className="text-[10px] font-black uppercase mb-1">
                        ⚠️ {checkDTMRisk()?.status}
                      </p>
                      <p className="text-[9px] font-bold opacity-80">
                        {checkDTMRisk()?.desc}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-900 rounded-[32px] space-y-4 shadow-xl">
                  <label className="text-[11px] font-black uppercase text-white flex items-center gap-2 tracking-[0.2em]">
                    <Lucide.Cigarette size={16} className="text-red-400" />{" "}
                    Hábitos Críticos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Fumante",
                      "Ex-Fumante",
                      "Bruxismo",
                      "Dieta Cariogênica",
                    ].map((h) => (
                      <button
                        key={h}
                        onClick={() =>
                          setS4({
                            ...s4,
                            habitos: s4.habitos.includes(h)
                              ? s4.habitos.filter((x) => x !== h)
                              : [...s4.habitos, h],
                          })
                        }
                        className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${s4.habitos.includes(h) ? "bg-white text-slate-900 border-white shadow-md font-black" : "border-white/20 text-white/70"}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="p-6 bg-white border-2 border-slate-100 rounded-[32px] space-y-5 shadow-sm">
              <label className="text-[11px] font-black uppercase text-[#7B2335] flex items-center gap-2">
                <Lucide.ClipboardEdit size={16} /> Prescrição Técnica
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {medicamentosAtuais.map((m) => (
                  <button
                    key={m}
                    onClick={() => setTempMed({ nome: m, dose: "", dias: "" })}
                    className="p-3 bg-slate-50 border rounded-xl text-[9px] font-black uppercase text-left hover:border-[#7B2335] transition-all"
                  >
                    + {m}
                  </button>
                ))}
              </div>
              {tempMed && (
                <div className="p-4 bg-slate-50 border-2 border-[#7B2335] rounded-2xl space-y-3 animate-in zoom-in">
                  <p className="text-[10px] font-black uppercase font-bold text-[#7B2335]">
                    {tempMed.nome}
                  </p>
                  <select
                    className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none"
                    onChange={(e) =>
                      setTempMed({ ...tempMed, dose: e.target.value })
                    }
                  >
                    <option value="">Intervalo...</option>
                    <option value="8 em 8 horas">8 em 8 horas</option>
                    <option value="12 em 12 horas">12 em 12 horas</option>
                    <option value="24 em 24 horas">24 em 24 horas</option>
                  </select>
                  <select
                    className="w-full p-2.5 border rounded-xl text-xs font-bold outline-none"
                    onChange={(e) =>
                      setTempMed({ ...tempMed, dias: e.target.value })
                    }
                  >
                    <option value="">Duração...</option>
                    <option value="3 dias">por 3 dias</option>
                    <option value="5 dias">por 5 dias</option>
                    <option value="7 dias">por 7 dias</option>
                  </select>
                  <button
                    onClick={addMedToPrescription}
                    className="w-full py-4 bg-[#7B2335] text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-[#7B2335]/20"
                  >
                    Adicionar
                  </button>
                </div>
              )}
              <textarea
                className="w-full p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[22px] text-xs min-h-[100px] font-bold text-slate-600 outline-none"
                value={s4.prescricaoTexto}
                readOnly
              />
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-3 shadow-inner">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase text-[#7B2335]">
                  Veredito / Evolução
                </label>
                <button
                  onClick={gerarEvolucaoAutomatica}
                  className="px-3 py-1 bg-slate-800 text-white text-[8px] font-black rounded-lg hover:bg-[#7B2335] transition-all"
                >
                  GERAR TEXTO ✨
                </button>
              </div>
              <textarea
                className="w-full p-5 bg-white border rounded-[22px] text-sm min-h-[220px] outline-none font-bold text-slate-700 shadow-sm"
                placeholder="Relate a consulta..."
                value={s4.vereditoGeral}
                onChange={(e) =>
                  setS4({ ...s4, vereditoGeral: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-700 pb-32">
            <div className="mt-4 mb-6">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block tracking-widest text-center">
                Encaminhamento / Conduta Final
              </label>
              <textarea
                className="w-full p-5 bg-slate-50 border rounded-[22px] text-sm font-bold outline-none min-h-[80px] resize-none"
                placeholder="Ex: Encaminhado para Bucomaxilo..."
                value={s4.encaminhamento}
                onChange={(e) =>
                  setS4({ ...s4, encaminhamento: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
              <div
                className="w-32 h-32 rounded-full border-8 flex items-center justify-center shadow-xl bg-white"
                style={{
                  borderColor:
                    checkDTMRisk()
                      ?.color?.replace("text", "border")
                      ?.replace("600", "500") || "#eee",
                }}
              >
                <div
                  className={`text-center font-black leading-tight ${checkDTMRisk()?.color || "text-slate-400"}`}
                >
                  <span className="text-xs uppercase block font-bold">
                    Risco
                  </span>
                  <span className="text-xl">
                    {checkDTMRisk()?.status?.split(" ")[1] || "---"}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase text-slate-800 leading-tight">
                  Resultado da Triagem
                </h2>
                <p className="text-sm text-slate-500 font-medium max-w-[280px]">
                  {checkDTMRisk()?.desc || "Análise clínica processada."}
                </p>
              </div>

              <div className="w-full bg-slate-50 rounded-[22px] p-5 border border-slate-100 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Paciente
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {s1.name || "Não informado"}
                  </span>
                </div>
                <div className="h-[1px] bg-slate-200 w-full" />
                <div className="text-[11px] text-slate-600 italic leading-relaxed">
                  {s4.vereditoGeral
                    ? s4.vereditoGeral.substring(0, 120) + "..."
                    : "Resumo gerado."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-md border-t z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-6 bg-slate-200 text-slate-600 rounded-[28px] font-black shadow-2xl uppercase tracking-widest text-xs transition-all active:scale-95"
            >
              VOLTAR
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step === 4) {
                handleFinish();
              } else {
                setStep(step + 1);
              }
            }}
            className={`${step > 0 ? "flex-1" : "w-full"} py-6 bg-[#7B2335] text-white rounded-[28px] font-black shadow-2xl uppercase tracking-widest text-xs transition-all active:scale-95`}
          >
            {step === 4 ? "FINALIZAR ATENDIMENTO" : "PRÓXIMO PASSO"}
          </button>
        </div>
      </div>
    </div>
  );
}
