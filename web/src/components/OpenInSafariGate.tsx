import { useMemo, useState } from "react";
import {
  detectInAppApp,
  inAppBrowserHint,
  openInSystemBrowser,
  shouldShowSafariGate,
} from "../lib/inAppBrowser";

export function OpenInSafariGate({ children }: { children: React.ReactNode }) {
  const blocked = useMemo(() => shouldShowSafariGate(), []);
  const app = useMemo(() => detectInAppApp(), []);
  const [copied, setCopied] = useState(false);

  if (!blocked) return children;

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      window.prompt("このURLをコピーして Safari に貼り付けてください", url);
    }
  };

  return (
    <div className="app-shell" data-theme="sakura">
      <div className="phone">
        <section className="screen centered safari-gate">
          <div className="hero-mark">
            <span />
            <i />
          </div>
          <h1 style={{ textAlign: "center" }}>Safariで開いてください</h1>
          <p className="muted" style={{ textAlign: "center", margin: "12px 0 28px", lineHeight: 1.6 }}>
            Googleログインなどのため、
            <br />
            LINE や X 内のブラウザではなく
            <br />
            Safari でご利用ください。
          </p>
          <div className="stack" style={{ width: "100%" }}>
            <button className="primary" type="button" onClick={() => openInSystemBrowser()}>
              Safariで開く
            </button>
            <button className="secondary" type="button" onClick={() => void copyLink()}>
              {copied ? "URLをコピーしました" : "URLをコピー"}
            </button>
            <p className="muted" style={{ textAlign: "center", fontSize: 13, lineHeight: 1.5 }}>
              うまく開けない場合は
              <br />
              {inAppBrowserHint(app)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
