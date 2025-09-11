import { useEffect, useState } from "react";
import { GlobalTheme } from "@carbon/react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard"; // ← página después del login
import "./App.scss";

function App() {
  const theme = "g100";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.carbonTheme = theme;

    // Si ya hay token en localStorage, asumimos login
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, [theme]);

  return (
    <GlobalTheme theme={theme}>
      {isAuthenticated ? (
        <Dashboard /> // ← aquí irá tu página principal
      ) : (
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </GlobalTheme>
  );
}

export default App;
