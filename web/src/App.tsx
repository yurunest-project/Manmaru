import { useEffect } from "react";
import { AppProvider, useApp } from "./state/AppProvider";
import { PairingScreen, SetupScreen, SignInScreen } from "./screens/AuthScreens";
import { CalendarScreen } from "./screens/CalendarScreen";
import { ScheduleScreen, SettingsScreen } from "./screens/ScheduleScreen";

function TabBar() {
  const { tab, setTab } = useApp();
  const items = [
    { id: "calendar" as const, label: "カレンダー", icon: "📅" },
    { id: "schedule" as const, label: "予定", icon: "♡" },
    { id: "settings" as const, label: "設定", icon: "⚙" },
  ];
  return (
    <nav className="tabbar">
      {items.map((item) => (
        <button
          key={item.id}
          className={`tab${tab === item.id ? " active" : ""}`}
          type="button"
          onClick={() => setTab(item.id)}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function Main() {
  const { tab } = useApp();
  return (
    <>
      {tab === "calendar" && <CalendarScreen />}
      {tab === "schedule" && <ScheduleScreen />}
      {tab === "settings" && <SettingsScreen />}
      <TabBar />
    </>
  );
}

function Root() {
  const { route, themeId, error, setError } = useApp();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
  }, [themeId]);

  return (
    <div className="app-shell" data-theme={themeId}>
      <div className="phone">
        {route === "loading" && (
          <section className="screen centered">
            <div className="hero-mark">
              <span />
              <i />
            </div>
            <h1 style={{ textAlign: "center" }}>まんまる</h1>
          </section>
        )}
        {route === "setup" && <SetupScreen />}
        {route === "signedOut" && <SignInScreen />}
        {route === "pairing" && <PairingScreen />}
        {route === "main" && <Main />}
        {error && (
          <button className="alert" type="button" onClick={() => setError(null)}>
            {error}
          </button>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
