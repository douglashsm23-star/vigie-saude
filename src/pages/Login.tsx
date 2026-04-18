import { useState } from "react";
import { useLocation } from "wouter";
import * as Lucide from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth() as any;
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasNumeros = e.target.value.replace(/\D/g, "").slice(0, 11);
    setCpf(apenasNumeros);
  };

  const handleLogin = async () => {
    setErrorMsg("");
    if (cpf.length !== 11) {
      setErrorMsg("CPF inválido! Digite 11 números.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Digite sua senha!");
      return;
    }
    setLoading(true);
    const success = await login(cpf, password);
    setLoading(false);
    if (success) {
      setLocation("/");
    } else {
      setErrorMsg("CPF ou senha incorretos!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-[24px] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
          <div className="pt-10 pb-6 text-center bg-white">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 mb-4">
              <Lucide.ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Vigília</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Monitoramento Integrado de Saúde</p>
          </div>

          <div className="px-8 pb-10 space-y-6 bg-white">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
                <Lucide.AlertCircle className="w-4 h-4" />
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">CPF</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-slate-700"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={11}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Senha</label>
                <input
                  type="password"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-xl py-4 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? "CARREGANDO..." : "ENTRAR NO SISTEMA"}
              </button>
            </div>

            <button
              onClick={() => setLocation("/register")}
              className="w-full text-sm text-slate-500 font-medium hover:text-blue-600 transition-colors text-center"
            >
              Novo por aqui? <span className="text-blue-600 font-bold">Crie sua conta</span>
            </button>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-2">Acessar como usuário de teste:</p>
              <p>Profissional Odontologia: <span className="font-bold">CPF 11122233344 / senha odont@123</span></p>
              <p>Profissional Medicina: <span className="font-bold">CPF 22233344455 / senha med@123</span></p>
              <p>Paciente: <span className="font-bold">CPF 33344455566 / senha paciente123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}