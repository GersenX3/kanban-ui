import { useEffect } from "react";
import { GlobalTheme } from "@carbon/react";
import LoginPage from "./components/LoginPage";
import "./App.scss";

function App() {
  const theme = "g100"; // ← your implementation, e.g. fetching user settings

  useEffect(() => {
    document.documentElement.dataset.carbonTheme = theme;
  }, [theme]);

  return (
    <GlobalTheme theme={theme}>
      <LoginPage />
    </GlobalTheme>
  );
}

export default App;
