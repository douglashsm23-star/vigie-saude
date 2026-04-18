import { Route, Router, Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Logout from "@/pages/Logout";
import Register from "@/pages/Register";
import PacienteDashboard from "@/pages/PacienteDashboard";
import MedicoDashboard from "@/pages/MedicoDashboard";
import DentistaDashboard from "@/pages/DentistaDashboard";
import EstudanteDashboard from "@/pages/EstudanteDashboard";
import Patients from "@/pages/Patients";
import NewPatient from "@/pages/NewPatient";

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#7B2335] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Login} />
        <Route path="*" component={() => <Redirect to="/login" />} />
      </Router>
    );
  }

  return (
    <Router>
      <Route path="/pacientes/novo/:specialty" component={NewPatient} />
      <Route path="/pacientes/novo" component={NewPatient} />
      <Route path="/pacientes" component={Patients} />
      <Route path="/logout" component={Logout} />
      <Route path="/dentista/dashboard" component={DentistaDashboard} />
      <Route path="/medico/dashboard" component={MedicoDashboard} />
      <Route path="/estudante/dashboard" component={EstudanteDashboard} />
      <Route
        path="/"
        component={
          user?.role === "paciente"
            ? PacienteDashboard
            : user?.role === "profissional" && user?.specialty === "odontologia"
            ? DentistaDashboard
            : user?.role === "profissional"
            ? MedicoDashboard
            : EstudanteDashboard
        }
      />
      <Route path="*" component={() => <Redirect to="/" />} />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
