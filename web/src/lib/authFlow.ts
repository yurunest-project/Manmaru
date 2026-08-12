export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function authRedirectUri(authDomain?: string | null) {
  if (!authDomain) return "";
  return `https://${authDomain}/__/auth/handler`;
}

export function authJavaScriptOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function authErrorMessage(err: unknown, authDomain?: string | null) {
  const code = (err as { code?: string }).code ?? "";
  const message = err instanceof Error ? err.message : String(err);

  if (
    code === "auth/redirect-uri-mismatch" ||
    message.includes("redirect_uri_mismatch") ||
    message.includes("redirect_uri")
  ) {
    const uri = authRedirectUri(authDomain);
    const origin = authJavaScriptOrigin();
    return [
      "Google OAuth の設定が合っていません。",
      `Firebase Console → Authentication → Google → Web client ID と同じクライアントを Google Cloud で開き、`,
      `リダイレクト URI: ${uri}`,
      origin ? `JavaScript 生成元: ${origin}` : "",
      "を追加してください。",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (code === "auth/unauthorized-domain") {
    return "このドメインは Firebase Authentication の承認済みドメインに追加されていません。";
  }

  if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
    return "ポップアップがブロックされました。Safari で開き直してから、もう一度お試しください。";
  }

  return message || "ログインできませんでした";
}

export function returningFromAuthRedirect() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.has("apiKey") ||
    params.has("code") ||
    window.location.hash.includes("apiKey") ||
    window.location.pathname.includes("/__/auth/")
  );
}

export function iosPopupOnlySignIn() {
  return isIOS();
}
