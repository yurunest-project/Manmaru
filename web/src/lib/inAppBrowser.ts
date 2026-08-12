export type InAppApp = "line" | "twitter" | "facebook" | "instagram" | "other";

function isStandalonePWA() {
  return (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function detectInAppApp(): InAppApp | null {
  const ua = navigator.userAgent;
  if (/Line\//i.test(ua)) return "line";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";
  if (/Twitter/i.test(ua)) return "twitter";
  return null;
}

/** iOS の LINE / X など、アプリ内ブラウザかどうか */
export function isIOSInAppWebView() {
  if (!isIOS()) return false;
  if (isStandalonePWA()) return false;

  const named = detectInAppApp();
  if (named) return true;

  // X など: WebKit だけあって Safari が付かない UA
  const ua = navigator.userAgent;
  return /AppleWebKit/i.test(ua) && !/Safari/i.test(ua);
}

export function shouldShowSafariGate() {
  return isIOSInAppWebView();
}

/** LINE 公式: 外部ブラウザ（Safari）で開く */
export function redirectLineToExternalBrowser() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("openExternalBrowser") === "1") return false;
  url.searchParams.set("openExternalBrowser", "1");
  window.location.replace(url.toString());
  return true;
}

/** ユーザーのタップ後に Safari へ渡す */
export function openInSystemBrowser(target = window.location.href) {
  const app = detectInAppApp();
  if (app === "instagram") {
    window.location.href = `instagram://extbrowser/?url=${encodeURIComponent(target)}`;
    return;
  }
  if (app === "line") {
    const url = new URL(target);
    url.searchParams.set("openExternalBrowser", "1");
    window.location.href = url.toString();
    return;
  }
  // Facebook / X / その他 iOS WebView
  window.location.href = `x-safari-${target}`;
}

/** ページ読み込み直後に試せる自動エスケープ（Facebook / LINE のみ） */
export function tryAutoEscapeInAppBrowser() {
  if (!isIOSInAppWebView()) return false;
  const app = detectInAppApp();
  if (app === "line") return redirectLineToExternalBrowser();
  if (app === "facebook") {
    openInSystemBrowser();
    return true;
  }
  return false;
}

export function inAppBrowserHint(app: InAppApp | null) {
  switch (app) {
    case "line":
      return "右上の「…」→「Safariで開く」";
    case "twitter":
      return "右上の「↗」→「Safariで開く」";
    default:
      return "メニューから「Safariで開く」を選んでください";
  }
}
