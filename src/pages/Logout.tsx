import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    logout();
    setLocation("/login");
  }, [logout, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <p className="text-lg font-bold text-slate-900">Saindo...</p>
        <p className="mt-3 text-slate-500">Aguarde enquanto finalizamos sua sessão.</p>
      </div>
    </div>
  );
}
