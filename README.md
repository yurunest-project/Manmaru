# まんまる

恋人同士で次のデートを共有するアプリです。まずは **Web 版** を Vercel に公開し、あとから iOS アプリを出せます。

## できること

- 次のデートが一目でわかるカレンダー
- 新しい順の予定一覧（開くと先頭）
- デートの登録・詳細
- 行き先を複数登録し、タップで Google マップの車ルート（現在地 → 目的地）を開く
- メモ
- デザイン 3 種（さくら / ほしぞら / はちみつ）
- Google ログインと 6 桁の招待コードでペア連携

iPhone の Safari では「ホーム画面に追加」すると、アプリのように全画面で使えます。

### iPhone に追加する手順

1. Safari で公開 URL（または `http://localhost:5173`）を開く
2. 共有ボタン（□↑）→ **ホーム画面に追加**
3. 名前は「まんまる」のまま **追加**

アイコンはピンクのまんまるマークが表示されます。

## いちばん早い確認

```bash
cd web
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開きます。Firebase 未設定でも「サンプルデータでデザインを見る」から UI を確認できます。

## Web を Vercel に公開する

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作る
2. プロジェクトに **Web アプリ** を追加し、設定値を控える
3. Authentication → Sign-in method で **Google** を有効にする
4. Firestore を作成し、`firebase/firestore.rules` をデプロイする

```bash
firebase deploy --only firestore:rules
```

5. ローカル確認用に `web/.env.example` をコピーして `web/.env` を作る（このファイルは git に入りません）

```bash
cp web/.env.example web/.env
```

6. [Vercel](https://vercel.com) に Git リポジトリを取り込み、Environment Variables に次を入れる

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN` → **`hitomoshi-ab905.firebaseapp.com`**（Vercel のドメインではない）
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Root Directory は空のままで大丈夫です（リポジトリ直下の `vercel.json` が `web` をビルドします）。Root Directory を `web` にする場合は、そちらにある `web/vercel.json` が使われます。

7. 公開後、Firebase Authentication の「承認済みドメイン」に Vercel のドメイン（例: `xxx.vercel.app`）を追加する

### Google ログインが iPhone で止まるとき

**重要:** Google Cloud には OAuth クライアントが複数あります。Firebase Console → Authentication → Sign-in method → **Google** → **Web client ID** と同じ ID のクライアントを編集してください。

1. Firebase Authentication → **Settings → Authorized domains** に `manmaru-chi.vercel.app` を追加
2. 上記 **Web client ID** の OAuth クライアントで次を追加:
   - **承認済みの JavaScript 生成元:** `https://manmaru-chi.vercel.app`
   - **承認済みのリダイレクト URI:**
     ```
     https://hitomoshi-ab905.firebaseapp.com/__/auth/handler
     https://manmaru-chi.vercel.app/__/auth/handler
     ```
3. **API キーの HTTP リファラー** に `https://manmaru-chi.vercel.app/*` を追加
4. Vercel の `VITE_FIREBASE_AUTH_DOMAIN` は **`hitomoshi-ab905.firebaseapp.com`**
5. 変更後 **Redeploy**（iPhone は popup ログイン、PC は同一ドメイン redirect）

## iOS アプリ（あとから）

`Manmaru.xcodeproj` がネイティブ版です。Web と同じ Firestore を共有できます。Sign in with Apple を有効にしてから Xcode でビルドしてください。
