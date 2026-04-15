import { useLocation } from "wouter";
import { useAuth } from "@/contexts";

export default function NewPatientSimples() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSalvar = () => {
    alert("Paciente salvo com sucesso!");
    if (user?.specialty === "odontologia") {
      setLocation("/dentista/dashboard");
    } else {
      setLocation("/medico/dashboard");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Nova Consulta - Teste</h1>
      <p>Usuário: {user?.name}</p>
      <p>Especialidade: {user?.specialty}</p>
      <button onClick={() => setLocation(user?.specialty === "odontologia" ? "/dentista/dashboard" : "/medico/dashboard")}>
        Voltar
      </button>
      <button onClick={handleSalvar} style={{ marginLeft: "10px", background: "green", color: "white", padding: "10px" }}>
        Salvar Paciente
      </button>
    </div>
  );
}