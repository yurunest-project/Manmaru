import { useState } from "react";
import { useApp } from "../state/AppProvider";
import { LegalLinks } from "./LegalScreens";

export function SetupScreen() {
  const { enterPreview } = useApp();
  return (
    <section className="screen">
      <h1>まんまる</h1>
      <p className="muted" style={{ margin: "10px 0 24px" }}>
        Firebase の設定を入れると、2人で予定を共有できます。
      </p>
      <div className="card stack">
        <div className="row">
          <span className="step-num">1</span>
          <p>Firebase で Web アプリを登録する</p>
        </div>
        <div className="row">
          <span className="step-num">2</span>
          <p>
            <code>web/.env</code> に設定値を入れる
          </p>
        </div>
        <div className="row">
          <span className="step-num">3</span>
          <p>Authentication で Google を有効にする</p>
        </div>
        <div className="row">
          <span className="step-num">4</span>
          <p>Firestore ルールをデプロイする</p>
        </div>
      </div>
      <div style={{ height: 16 }} />
      <button className="primary" type="button" onClick={enterPreview}>
        サンプルデータでデザインを見る
      </button>
    </section>
  );
}

export function SignInScreen() {
  const { signInWithGoogle, switchAccount, busy, enterPreview } = useApp();
  return (
    <section className="screen centered">
      <div className="hero-mark">
        <span />
        <i />
        <b />
      </div>
      <h1 style={{ textAlign: "center" }}>まんまる</h1>
      <p className="muted" style={{ textAlign: "center", margin: "10px 0 36px" }}>
        ふたりの次のおでかけを、
        <br />
        いちばん近くに。
      </p>
      <div className="stack" style={{ width: "100%" }}>
        <button className="google-btn" type="button" onClick={() => void signInWithGoogle()} disabled={busy}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.5l6.3 5.2C38.9 37.4 44 31.4 44 24c0-1.2-.1-2.3-.4-3.5z" />
          </svg>
          {busy ? "接続中..." : "Google でサインイン"}
        </button>
        <button className="secondary" type="button" disabled={busy} onClick={() => void switchAccount()}>
          {busy ? "接続中..." : "別のアカウントでサインイン"}
        </button>
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>
        Google の画面でアカウント一覧が表示されます。
        <br />
        別のアカウントを使う場合は、そこから選んでください。
      </p>
      <p className="muted" style={{ textAlign: "center", marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
        iPhone の方へ: Safari で開いてください。
        <br />
        LINE などアプリ内ブラウザではログインできないことがあります。
      </p>
      <button className="muted" type="button" style={{ marginTop: 18 }} onClick={enterPreview}>
        サンプルで見る
      </button>
      <LegalLinks className="signin-legal" />
    </section>
  );
}

export function PairingScreen() {
  const { createCouple, joinCouple, signOut, switchAccount, busy } = useApp();
  const [mode, setMode] = useState<"choose" | "join">("choose");
  const [code, setCode] = useState("");

  return (
    <section className="screen centered">
      <div style={{ fontSize: 56, textAlign: "center", color: "var(--primary)" }}>🔗</div>
      <h1 style={{ textAlign: "center" }}>ふたりをつなぐ</h1>
      <p className="muted" style={{ textAlign: "center", margin: "10px 0 28px" }}>
        招待コードを発行するか、
        <br />
        相手のコードを入力してください。
      </p>
      {mode === "choose" ? (
        <div className="stack">
          <button className="primary" type="button" disabled={busy} onClick={() => void createCouple()}>
            招待コードを発行する
          </button>
          <button className="secondary" type="button" onClick={() => setMode("join")}>
            コードを入力する
          </button>
        </div>
      ) : (
        <div className="stack">
          <div className="card">
            <input
              className="field"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-HJ-NP-Z2-9]/g, "")
                    .slice(0, 6),
                )
              }
              placeholder="6桁のコード"
              style={{ textAlign: "center", fontSize: 28, fontWeight: 800, letterSpacing: "0.2em" }}
            />
          </div>
          <button
            className="primary"
            type="button"
            disabled={busy || code.length !== 6}
            onClick={() => void joinCouple(code)}
          >
            このコードでつながる
          </button>
          <button className="muted" type="button" onClick={() => setMode("choose")}>
            戻る
          </button>
        </div>
      )}
      <button className="secondary" type="button" style={{ marginTop: 28 }} disabled={busy} onClick={() => void switchAccount()}>
        {busy ? "切り替え中..." : "別のアカウントでログイン"}
      </button>
      <button className="muted" type="button" style={{ marginTop: 12 }} onClick={() => void signOut()}>
        ログアウト
      </button>
    </section>
  );
}
