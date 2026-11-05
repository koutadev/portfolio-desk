# portfolio-desk

koutadev のポートフォリオサイト。パソコンのデスクトップを模した画面で、制作物・経歴・スキル・「削ったこと」（ゴミ箱）を見せます。

- Astro 5 + TypeScript（ページは静的書き出し）
- 問い合わせフォームだけ Vercel のサーバー側で動かす（`/api/contact`、送信は Resend）
- 外部ライブラリなし（ウィンドウ操作・アニメーションは `src/scripts/desktop.ts`）

## 動かし方

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 型チェック（astro check）→ ビルド
```

`astro preview` は Vercel アダプターでは使えないため、確認は `npm run dev` で行います。

## ファイルの場所

| 変えたいもの | ファイル |
| --- | --- |
| 名前・経歴・得意なこと・スキル・作品・削ったこと | `src/data/site.ts`（文章はすべてここ） |
| 公開 URL（canonical / OGP） | `astro.config.mjs` の `site` |
| 見た目 | `src/styles/desktop.css` |
| ウィンドウ・ゴミ箱・壁紙などの動き | `src/scripts/desktop.ts` |
| デスクトップ画面の構成 | `src/pages/index.astro` |
| 作品ごとの個別ページ（`/works/<slug>/`） | `src/pages/works/[slug].astro` |
| 問い合わせ API | `src/pages/api/contact.ts` |

### 仮の文章を差し替える箇所

`src/data/site.ts` の `[ ]` で囲まれた部分が仮の文章です。

- `profile.location`（拠点）
- `works` の CRM・ヨガ予約の説明・担当範囲・使用技術・工夫した点・削ったこと
- 各作品の `links`。`href: null` は「準備中」と表示されるので、デモ URL などが決まったら入れる

## 問い合わせフォーム（Vercel の環境変数）

Vercel の Project Settings → Environment Variables に次を設定します（`.env.example` 参照）。

| 名前 | 内容 |
| --- | --- |
| `RESEND_API_KEY` | Resend の API キー |
| `CONTACT_TO` | 問い合わせを受け取るメールアドレス |
| `CONTACT_FROM` | 送信元（Resend で認証したドメインのアドレス。例: `portfolio@example.com`） |

未設定のあいだは、フォームは「いまは送信の準備中です」と表示します（API は 503 を返す）。
スパム対策として、人には見えない入力欄（`website`）に値が入った送信は、成功を装って捨てます。

## Vercel へのデプロイ

1. Vercel で「Add New → Project」から、この GitHub リポジトリを読み込む（Framework は Astro が自動で選ばれる）
2. 上の環境変数を設定
3. 公開 URL（https://portfolio-desk-chi.vercel.app）は `astro.config.mjs` の `site` に設定済み。ドメインを変えたらここも変える
4. 以後は、ブランチに push するとプレビュー URL、`main` に入れると本番に反映される

## 作りの要点

- **ウィンドウ**：「＿」でしまうと、そのボタンの画面内の相対位置を覚え、次に開くときはボタンが同じ位置に来るように開く。「×」で閉じたら初期位置に戻る
- **しまうアニメーション**：ウィンドウの複製を横方向に 24〜48 本の帯に切り、帯ごとに縮める（`body` 直下の重ね層で再生し、終わったら消す）
- **壁紙**：滞在時間で色が変わる（10分で 朝→昼→夕方→夜→朝）
- **スマホ**：幅 820px 以下ではホーム画面になり、ウィンドウは下からせり上がる。PC ではメニューの「スマホで表示」で同じ画面を確認できる
- **アクセシビリティ**：キーボードで全操作可（矢印キーでウィンドウ移動、Esc で閉じる）、「動きを減らす」設定ではアニメーションなし、JavaScript が動かない環境では中身を縦に並べて表示
