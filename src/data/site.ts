// サイトの中身はこのファイルにまとめています。[ ] で囲んだところは、あとで差し替える仮の文章です。

export type IconKind = 'about' | 'works' | 'skills' | 'contact' | 'trash' | 'case';

export interface Work {
  slug: string;
  title: string;
  kind: string; // 種類（Webアプリ・デザイン など）
  summary: string;
  role: string; // 担当範囲
  stack: string[];
  highlights: { title: string; body: string }[];
  links: { label: string; href: string | null }[]; // href が null のものは「準備中」と表示
  thumb: string; // サムネイルの背景色
  shot?: { src: string; alt: string }; // 実際の画面のスクリーンショット（public/ 以下）。無ければ色の背景で代用
  trimmed: { name: string; ext: 'TXT' | 'APP' | 'HTML' | 'PDF' | 'MOV' | 'XLSX'; why: string; saved: string }[]; // 削ったこと
}

export const profile = {
  handle: 'koutadev',
  role: 'バックエンドエンジニア（PHP / Laravel）',
  lead: '業務システムのバックエンドを中心に、使う人が迷わない画面まで考えて作ります。',
  experience: [
    { term: '業務システムの開発（約1年）', body: 'PHP・Smarty・PostgreSQL・JavaScript で、販売店向けの管理システムの機能追加と改修を担当しました。' },
    { term: '個人開発', body: 'Laravel・Docker・Next.js・TypeScript・Claude API を使い、CRM や予約システムを作っています。' },
  ],
  strengths: [
    { title: 'SQL の高速化', body: 'EXPLAIN で実行計画を読み、インデックスを設計し直して、遅いクエリを約60倍速くした経験があります。' },
    { title: 'ドキュメントから作る', body: '仕様と判断の記録を Markdown に残しながら開発し、あとから読んでも理由が分かる状態にします。' },
    { title: '画面の使いやすさ', body: 'キーボード操作・読み上げ・「動きを減らす」設定まで含めて、迷わない画面を作ります。' },
  ],
  location: '神奈川',
  github: 'https://github.com/koutadev',
};

export const skills: { group: string; items: string[] }[] = [
  { group: 'バックエンド', items: ['PHP', 'Laravel', 'PostgreSQL', 'Smarty'] },
  { group: 'フロントエンド', items: ['JavaScript', 'TypeScript', 'Next.js', 'Astro', 'HTML / CSS'] },
  { group: '環境・道具', items: ['Docker', 'Git / GitHub', 'Vercel'] },
  { group: 'AI', items: ['Claude API'] },
];

export const works: Work[] = [
  {
    slug: 'crm',
    title: 'CRM（営業管理システム）',
    kind: 'Webアプリ',
    summary: 'BtoB の法人営業向けに、顧客・商談・売上を1か所で管理するシステムです。担当者ごとに散らばっていた数字を集め、会社全体の売上と受注見込みをダッシュボードで見えるようにしました。',
    role: '企画・設計・実装・テスト（個人開発）',
    stack: ['PHP 8.3', 'Laravel 13', 'PostgreSQL 16', 'Blade + Alpine.js', 'Tailwind CSS 4', 'Docker'],
    highlights: [
      { title: '消費税を1円もずらさない', body: '明細ごとに切り捨てると、税率ごとの合計と1円ずれます。消費税は税率ごとに1回だけ計算して明細に割り振り、確定した時点の単価と税率を明細に写して保存。あとでマスタを変えても、過去の金額は動きません。' },
      { title: 'データが増えてもクエリの本数が増えない', body: 'ダッシュボードや一覧の集計を、条件付き集計やサブクエリで決まった本数にまとめました。本数はテストで固定しているので、うっかりループの中でクエリを書くと CI が落ちます。' },
      { title: '権限は画面で隠すだけにしない', body: '管理者・担当者・閲覧者の3つの役割で、ボタンの出し分けに加えてサーバー側でも検査。URL を直接開いても、権限がなければ操作できません。' },
    ],
    links: [
      { label: 'デモ', href: 'https://crm-demo-static-snowy.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/koutadev/crm-sales' },
    ],
    thumb: '#D6DDE8',
    shot: { src: '/works/crm.jpg', alt: 'CRM のダッシュボード。今月の受注・見込み・進行中の商談・受注残の数字と、月ごとの売上推移、担当者別の売上のグラフ' },
    trimmed: [
      { name: 'ダッシュボードの期間の切り替え.html', ext: 'HTML', why: '数字は「今月」と「直近12か月」に固定しました。集計の処理は基準日と月数を受け取れる形にしてあるので、必要になったら画面を足すだけで済みます。', saved: '画面の部品1つと確認の手間' },
      { name: '画面の SPA 化（Livewire・Inertia）.app', ext: 'APP', why: '業務システムの画面はほとんどが一覧・検索・入力フォームです。サーバー側で作る画面に絞り、開閉などの動きが要るところだけ Alpine.js を使いました。担当者が代わっても読めることを優先しています。', saved: 'フレームワーク1つ分の学習と保守' },
      { name: '複数の会社でのデータ分け.txt', ext: 'TXT', why: '1社で使う前提に絞りました。入れるときの方針（全モデルに会社 ID の絞り込みを一括でかける）だけ README に残しています。', saved: 'データを分ける仕組み一式' },
    ],
  },
  {
    slug: 'yoga',
    title: 'オンラインヨガの予約システム',
    kind: 'Webアプリ',
    summary: 'オンラインヨガのスタジオ向けに、会員がスマホで空き枠を見て、その場で予約できるシステムです。二重予約と定員超過を起こさないこと、満席のときのキャンセル待ちを繰り上げて空いた枠を埋めることを中心に作りました。',
    role: '企画・設計・実装・テスト（個人開発）',
    stack: ['PHP 8.3', 'Laravel 13', 'PostgreSQL 16', 'Blade + Alpine.js', 'Tailwind CSS 4', 'Docker'],
    highlights: [
      { title: '定員超過と二重予約をデータベースで防ぐ', body: '予約を確定するときは、レッスン枠の行をロックしてから残りの枠を数え、同じ処理の中で登録します。同じ会員が同じ枠を二重に取ることも、データベースの制約で止めています。' },
      { title: '自動テスト 371件', body: '2つの処理を実際に同時に走らせるテストで、同時の予約・キャンセル・キャンセル待ちの順番が崩れないことを確かめています。ロックを外すと、テストが落ちます。' },
      { title: 'スマホと PC で見せ方を分ける', body: '会員の画面はスマホでは日付を切り替えるリスト、PC では週のカレンダー。埋まり具合は色・面積・数字の3つで示し、色だけに頼らず分かるようにしました。' },
    ],
    links: [
      { label: 'デモ', href: 'https://yoga-demo-static.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/koutadev/reservation-yoga' },
    ],
    thumb: '#E8DFD2',
    shot: { src: '/works/yoga.jpg', alt: '会員向けの「レッスンを探す」画面。1週間分のレッスンがカレンダーに並び、満席・予約済み・残りの枠数が表示されている' },
    trimmed: [
      { name: 'リマインドメールの送信.app', ext: 'APP', why: '送る予定と送ったかどうかの管理までにして、実際の送信は外しました。予約の整合性を先に固めるためです。送信の処理は、あとから差し込める形にしてあります。', saved: 'メール配信の設定と確認' },
      { name: '月・日のカレンダー表示.html', ext: 'HTML', why: 'まず週の表示だけを出すと決めました。予約する人がいちばん使うのは「今週・来週」だからです。', saved: '画面2つ' },
      { name: '決済・月謝・回数券.xlsx', ext: 'XLSX', why: '今回の範囲から外しました。入れるときは、予約を確定する処理の中に決済を挟む方針だけ決めています。', saved: '決済サービスとの連携一式' },
    ],
  },
  {
    slug: 'lp-catalog',
    title: 'LPパーツカタログ',
    kind: 'デザイン・フロントエンド',
    summary: 'LP と Webアプリの画面に使うパーツ61点を、サイトの種類ごとに整理したカタログ。日本のコーポレートサイトの調査をもとに、必要なパーツを選びました。',
    role: '調査・デザイン・実装',
    stack: ['HTML / CSS', 'TypeScript', 'WordPress のブロックパターン', 'Astro コンポーネント'],
    highlights: [
      { title: '調査から選ぶ', body: 'BtoB サイトや採用サイトの調査を読み、よく使われるパーツと使われないパーツを分けてから作りました。' },
      { title: 'そのまま使える4つの形', body: '各パーツを HTML・CSS・WordPress のブロックパターン・Astro コンポーネントのコードで取り出せます。' },
      { title: 'アクセシビリティ', body: 'すべてのパーツをキーボード操作・読み上げ・「動きを減らす」設定に対応させました。' },
    ],
    links: [
      { label: 'カタログを見る', href: 'https://designs-sigma-lac.vercel.app/parts/' },
    ],
    thumb: '#DCE3D8',
    shot: { src: '/works/lp-catalog.webp', alt: 'LPパーツカタログの一覧画面。パーツ数などの数字と、用途・種別・トーンの絞り込み、パーツのプレビューが並ぶ' },
    trimmed: [
      { name: 'ヒーローのスライダー.mov', ext: 'MOV', why: 'PC では矢印の操作に気を取られて押されにくいという調査があり、1枚の写真と見出しを基本にしました。', saved: 'パーツ 1つと読み込みの重さ' },
      { name: '常設のチャット.app', ext: 'APP', why: 'BtoB サイトの利用者はほとんど使っていないという調査結果から、パーツにしませんでした。', saved: 'パーツ 1つ' },
      { name: '文字サイズの切り替えボタン.txt', ext: 'TXT', why: 'ブラウザの拡大機能で代わりになるため、作らない判断をしました。', saved: 'パーツ 1つ' },
    ],
  },
  {
    slug: 'lp-motion',
    title: 'lp-motion と 篩のサイト案',
    kind: 'ライブラリ・デザイン',
    summary: '外部ライブラリを使わない、動きのライブラリ62種。その応用として、架空のデザイン会社「篩」のサイトをデスクトップ画面の形で作りました。このポートフォリオもその仕組みで動いています。',
    role: '設計・デザイン・実装・テスト',
    stack: ['TypeScript', 'CSS', 'jsdom（テスト）', 'GitHub Actions'],
    highlights: [
      { title: '依存ゼロ', body: 'GSAP や Three.js を使わず、CSS と素の TypeScript だけで62種類の動きを作りました。' },
      { title: 'テスト 94件', body: '開閉・読み上げ・「動きを減らす」設定などの動作を、jsdom の自動テストで確かめています。' },
      { title: 'CSS でできることは CSS で', body: 'スクロール連動やページ遷移は CSS で動かし、対応していないブラウザだけ JS で補います。' },
    ],
    links: [
      { label: '動きを試す', href: 'https://designs-sigma-lac.vercel.app/parts/#motion' },
      { label: '篩のサイト案（5案）', href: 'https://designs-sigma-lac.vercel.app/furui/' },
    ],
    thumb: '#DCD7E8',
    shot: { src: '/works/lp-motion.webp', alt: '篩のサイト案（デスクトップ型）。ウィンドウとドック、アプリのアイコンが並ぶ画面' },
    trimmed: [
      { name: 'しまったウィンドウを元に戻す処理.txt', ext: 'TXT', why: '戻したあとにウィンドウが動かせなくなる不具合の元だったため、「しまったときのボタンの位置に新しく開く」形に作り直しました。', saved: '壊れやすい状態の管理' },
      { name: 'ふつうの表示への切り替え.html', ext: 'HTML', why: 'デスクトップの世界観を崩さずに済むよう、「スマホで表示」に置き換えました。', saved: '一覧ページ 1つ' },
      { name: '慣性スクロール.txt', ext: 'TXT', why: 'キーボード操作や読み上げとぶつかりやすいため、入れない判断をしました。', saved: '外部ライブラリ 1つ' },
    ],
  },
];

export const trashReadme = {
  name: '削った理由.txt',
  why: '作るものを決めるのと同じくらい、作らないものを決めることを大事にしています。ここには、各作品で削ったものと、その理由を残しています。',
};
