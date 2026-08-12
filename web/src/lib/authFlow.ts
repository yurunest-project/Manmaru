export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function authRedirectUri() {
  if (typeof window === "undefined") return "";
  const { protocol, hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const p = port || "5173";
    return `${protocol}//${hostname}:${p}/__/auth/handler`;
  }
  return `${protocol}//${hostname}/__/auth/handler`;
}

export function authErrorMessage(err: unknown) {
  const code = (err as { code?: string }).code ?? "";
  const message = err instanceof Error ? err.message : String(err);

  if (
    code === "auth/redirect-uri-mismatch" ||
    message.includes("redirect_uri_mismatch") ||
    message.includes("redirect_uri")
  ) {
    const uri = authRedirectUri();
    return `Googleログインの設定が不足しています。Google Cloud の OAuth クライアントに次を追加してください: ${uri}`;
  }

  if (code === "auth/unauthorized-domain") {
    return "このドメインは Firebase Authentication の承認済みドメインに追加されていません。";
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
