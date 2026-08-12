type LegalKind = "privacy" | "tokushoho" | "qa";

const TITLES: Record<LegalKind, string> = {
  privacy: "プライバシーポリシー",
  tokushoho: "特定商取引法に基づく表記",
  qa: "Q&A",
};

export function LegalScreen({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  return (
    <section className="screen legal-screen">
      <div className="topbar">
        <button type="button" className="sheet-close" onClick={onClose}>
          閉じる
        </button>
        <strong>{TITLES[kind]}</strong>
        <span style={{ width: 48 }} />
      </div>
      <div className="legal-body stack">
        {kind === "privacy" && <PrivacyContent />}
        {kind === "tokushoho" && <TokushohoContent />}
        {kind === "qa" && <QaContent />}
      </div>
    </section>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="muted">最終更新日: 2026年8月13日</p>
      <h2>第1条（総則）</h2>
      <p>
        ひともし（以下「当方」）は、恋人向けおでかけ共有アプリ「まんまる」（以下「本サービス」）の提供にあたり、お客様の個人情報の重要性を認識し、個人情報の保護に関する法律を遵守するとともに、以下の方針に従って適切に管理・保護します。
      </p>
      <h2>第2条（個人情報の取得）</h2>
      <p>当方は、サービスのご利用・会員登録・お問い合わせの際に、以下の情報を適法かつ公正な手段で取得することがあります。</p>
      <ul>
        <li>Google アカウントに紐づくメールアドレス・表示名</li>
        <li>ニックネーム（相手に表示する名前）</li>
        <li>ペア連携情報、おでかけ予定・行き先・メモなどの本サービス上のデータ</li>
        <li>お問い合わせ内容およびサービス利用に伴う技術ログ</li>
      </ul>
      <h2>第3条（利用目的）</h2>
      <p>取得した個人情報は、次の目的の範囲でのみ利用します。</p>
      <ul>
        <li>ユーザー認証および本サービスの提供（予定の共有・表示など）</li>
        <li>サービスに関する重要なお知らせ、規約変更等の通知</li>
        <li>お問い合わせ・不具合対応</li>
      </ul>
      <h2>第4条（第三者提供）</h2>
      <p>
        当方は、次の場合を除き、取得した個人情報を第三者に開示・提供しません。認証・データ保存のため Firebase（Google）等のインフラを利用しますが、本サービスの提供に必要な範囲に限ります。
      </p>
      <ul>
        <li>お客様の同意がある場合</li>
        <li>法令に基づき公的機関から開示を求められた場合</li>
      </ul>
      <h2>第5条（安全管理）</h2>
      <p>当方は、個人情報の漏えい・滅失・毀損の防止のため、合理的なセキュリティ対策を講じます。</p>
      <h2>第6条（開示・訂正・利用停止・お問い合わせ）</h2>
      <p>
        ご自身の個人情報の開示・訂正・利用停止などを希望される場合は、ご本人確認のうえ対応します。お問い合わせは{" "}
        <a href="mailto:hitomoshi@gmail.com">hitomoshi@gmail.com</a> までご連絡ください。
      </p>
      <p>
        <strong>管理責任者:</strong> 運営代表（佐野）／ひともし
      </p>
    </>
  );
}

function TokushohoContent() {
  return (
    <>
      <p className="muted">「まんまる」に関する表記です。</p>
      <div className="card stack legal-table">
        <div>
          <p className="muted">事業者名</p>
          <p>ひともし（代表：佐野 未夕）</p>
        </div>
        <div>
          <p className="muted">住所</p>
          <p>〒170-0013 東京都豊島区東池袋2丁目62番8号 BIGオフィスプラザ池袋1206</p>
        </div>
        <div>
          <p className="muted">連絡先</p>
          <p>
            <a href="mailto:hitomoshi@gmail.com">hitomoshi@gmail.com</a>
          </p>
        </div>
        <div>
          <p className="muted">販売価格</p>
          <p>現時点では本サービスの利用は無料です。有料機能を提供する場合は、その時点で表示する金額に従います。</p>
        </div>
        <div>
          <p className="muted">代金の支払方法</p>
          <p>有料機能を提供する場合は、その時点で案内する方法に従います。</p>
        </div>
        <div>
          <p className="muted">役務の提供時期</p>
          <p>アカウント登録・ペア連携後、直ちに本サービスを利用できます。</p>
        </div>
        <div>
          <p className="muted">返品・交換・返金</p>
          <p>デジタル役務の性質上、提供開始後の返品には応じられない場合があります。個別の取り決めがある場合はそれに従います。</p>
        </div>
      </div>
    </>
  );
}

function QaContent() {
  return (
    <>
      <div className="qa-item">
        <h2>Q. iPhone / LINE から開けますか？</h2>
        <p>
          Safari で開いてください。LINE などアプリ内ブラウザでは、Google ログインがうまくいかないことがあります。共有リンクを長押しして「Safari で開く」を選ぶか、Safari のアドレス欄に URL を貼り付けてください。
        </p>
      </div>
      <div className="qa-item">
        <h2>Q. 別の Google アカウントでログインしたい</h2>
        <p>
          サインイン画面の「別のアカウントでサインイン」、または設定の「アカウントを切り替える」からやり直してください。Google の画面でアカウント一覧が出たら、使いたいアカウントを選んでください。
        </p>
      </div>
      <div className="qa-item">
        <h2>Q. ふたりで予定を共有するには？</h2>
        <p>
          どちらかが招待コードを作成し、もう一方がコードを入力してつながります。つながるとカレンダーと予定がふたりで同期されます。
        </p>
      </div>
      <div className="qa-item">
        <h2>Q. ニックネームはどこで変えますか？</h2>
        <p>設定画面の「ニックネーム」から変更できます。相手の画面にも反映されます。</p>
      </div>
      <div className="qa-item">
        <h2>Q. お問い合わせはどこへ？</h2>
        <p>
          <a href="mailto:hitomoshi@gmail.com">hitomoshi@gmail.com</a> までご連絡ください。
        </p>
      </div>
    </>
  );
}

export function openLegalHash(kind: LegalKind) {
  window.location.hash = kind;
}

export function parseLegalHash(hash = window.location.hash): LegalKind | null {
  const value = hash.replace(/^#/, "");
  if (value === "privacy" || value === "tokushoho" || value === "qa") return value;
  return null;
}

function ExternalMark() {
  return (
    <svg className="legal-external" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.5 2.5h2v1H3.75a.75.75 0 0 0-.75.75v4c0 .41.34.75.75.75h4c.41 0 .75-.34.75-.75V6.5h1v1.75A1.75 1.75 0 0 1 7.75 10h-4A1.75 1.75 0 0 1 2 8.25v-4c0-.97.78-1.75 1.75-1.75zm3 0H10v3.5H9V4.2L5.35 7.85l-.7-.7L8.3 3.5H6.5v-1z"
      />
    </svg>
  );
}

export function LegalLinks({
  className = "",
  includeQa = false,
}: {
  className?: string;
  includeQa?: boolean;
}) {
  return (
    <nav className={`legal-links ${className}`.trim()} aria-label="サポート・情報">
      {includeQa && (
        <button type="button" className="legal-link" onClick={() => openLegalHash("qa")}>
          Q&A
        </button>
      )}
      <button type="button" className="legal-link" onClick={() => openLegalHash("privacy")}>
        プライバシー
      </button>
      <button type="button" className="legal-link" onClick={() => openLegalHash("tokushoho")}>
        特定商取引法
      </button>
      <a className="legal-link" href="mailto:hitomoshi@gmail.com?subject=%E3%81%BE%E3%82%93%E3%81%BE%E3%82%8B%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6">
        お問い合わせ
      </a>
      <a
        className="legal-link"
        href="https://hitomoshi-one.vercel.app/"
        target="_blank"
        rel="noreferrer"
      >
        他事業紹介
        <ExternalMark />
      </a>
    </nav>
  );
}
