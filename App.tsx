import { Route, Switch, Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/contexts";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DentistaDashboard from "@/pages/DentistaDashboard";
import MedicoDashboard from "@/pages/MedicoDashboard";
import PacienteDashboard from "@/pages/PacienteDashboard";
import EstudanteDashboard from "@/pages/EstudanteDashboard";
import NewPatient from "@/pages/NewPatient";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth() as any;

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
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  let defaultRoute = "/";
  if (user.specialty === "odontologia" && user.role === "profissional")
    defaultRoute = "/dentista/dashboard";
  else if (user.specialty === "medicina" && user.role === "profissional")
    defaultRoute = "/medico/dashboard";
  else if (user.role === "paciente") defaultRoute = "/paciente/dashboard";
  else if (user.role === "estudante")
    defaultRoute = `/estudante-${user.specialty}/dashboard`;

  return (
    <Switch>
      <Route path="/dentista/dashboard" component={DentistaDashboard} />
      <Route path="/medico/dashboard" component={MedicoDashboard} />
      <Route path="/paciente/dashboard" component={PacienteDashboard} />
      <Route
        path="/estudante-odonto/dashboard"
        component={EstudanteDashboard}
      />
      <Route
        path="/estudante-medico/dashboard"
        component={EstudanteDashboard}
      />
      <Route path="/pacientes/novo" component={NewPatient} />
      <Route path="/pacientes" component={Patients} />
      <Route path="/pacientes/:id" component={PatientDetail} />
      <Route path="/">
        <Redirect to={defaultRoute} />
      </Route>
    </Switch>
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
