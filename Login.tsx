import { useState } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "@/contexts";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth() as any;
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const unformatCPF = (cpf: string): string => {
    return cpf.replace(/\D/g, "");
  };

  // NOVA FUNÇÃO: Formatar CPF para exibição
  const formatarCPF = (valor: string): string => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6)
      return numeros.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    if (numeros.length <= 9)
      return numeros.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  };

  // Função corrigida: guarda o valor sem formatação, mas mostra formatado
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorDigitado = e.target.value;
    const apenasNumeros = valorDigitado.replace(/\D/g, "");
    const cpfFormatado = formatarCPF(apenasNumeros);
    setCpf(cpfFormatado); // Salva formatado para exibir, mas na hora do login limpa
  };

  const handleLogin = async () => {
    setErrorMsg("");

    const cpfLimpo = unformatCPF(cpf); // Remove formatação na hora de comparar
    if (cpfLimpo.length !== 11) {
      setErrorMsg("CPF inválido! Digite 11 números.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Digite sua senha!");
      return;
    }

    setLoading(true);
    const success = await login(cpfLimpo, password);
    setLoading(false);

    if (success) {
      setLocation("/");
    } else {
      setErrorMsg("CPF ou senha incorretos!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full mb-4">
            <Lucide.Heart className="w-12 h-12 text-[#7B2335]" />
          </div>
          <h1 className="text-4xl font-black text-[#7B2335] uppercase italic">
            Vigie Health Monitor
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Sistema de Prontuário Integrado
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
          <h2 className="text-center font-black text-slate-700 text-xl">
            Entrar
          </h2>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500">CPF *</label>
              <input
                type="text"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] transition-all mt-1"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength={14}
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500">
                Senha *
              </label>
              <input
                type="password"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-[#7B2335] transition-all mt-1"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-4 py-5 bg-[#7B2335] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>

            <div className="text-center">
              <button
                onClick={() => setLocation("/register")}
                className="text-sm text-[#7B2335] font-bold"
              >
                Não tenho conta → Cadastrar
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-[10px] text-slate-300">
          Sistema seguro - Dados protegidos
        </div>
      </div>
    </div>
  );
}
