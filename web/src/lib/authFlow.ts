export function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** iPhone / iPad では popup より redirect の方が安定する */
export function preferRedirectSignIn() {
  return isIOS();
}

export function authErrorMessage(err: unknown) {
  const code = (err as { code?: string }).code ?? "";
  const message = err instanceof Error ? err.message : String(err);

  if (
    code === "auth/redirect-uri-mismatch" ||
    message.includes("redirect_uri_mismatch") ||
    message.includes("redirect_uri")
  ) {
    return "Googleログインの設定エラーです。Firebase の authDomain（hitomoshi-ab905.firebaseapp.com）が使われているか確認してください。";
  }

  return message || "ログインできませんでした";
}
