
import { useState } from "react";

import "./App.css";

import ConsoleHeader from "./components/ConsoleHeader/ConsoleHeader";
import WelcomePanel from "./components/WelcomePanel/WelcomePanel";
import LoginForm from "./components/LoginForm/LoginForm";
import TaskManager from "./components/TaskManager/TaskManager";
import CalculatorPanel from "./components/CalculatorPanel/CalculatorPanel";
import EchoPanel from "./components/EchoPanel/EchoPanel";

function App() {
  const [accessToken, setAccessToken] = useState(null);

  return (
    <main className="app-shell">
      <div className="app-shell__container">
        <ConsoleHeader />

        <div className="app-shell__main">
          <WelcomePanel />

          {accessToken ? (
            <>
              <TaskManager
                accessToken={accessToken}
                onLogout={() => setAccessToken(null)}
              />
              <CalculatorPanel accessToken={accessToken} />
              <EchoPanel />
            </>
          ) : (
            <LoginForm onLoginSuccess={setAccessToken} />
          )}

          <footer className="app-shell__footer">
            <span>IDICorp Service Console</span>
            <span>WORKSPACE EDITION / 001</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default App;
