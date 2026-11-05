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
  location: '[拠点]',
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
    summary: '[顧客と案件を管理する営業チーム向けのシステム。何を解決するものかを1〜2文で書く]',
    role: '[担当範囲：設計・実装・テスト など]',
    stack: ['[使用技術]'],
    highlights: [
      { title: '[工夫した点 1]', body: '[どんな課題に、どう取り組んだか]' },
      { title: '[工夫した点 2]', body: '[どんな課題に、どう取り組んだか]' },
    ],
    links: [
      { label: 'デモ', href: null },
      { label: 'GitHub', href: 'https://github.com/koutadev/crm-sales' },
    ],
    thumb: '#D6DDE8',
    trimmed: [
      { name: '[削った機能].txt', ext: 'TXT', why: '[作らなかった・やめた理由]', saved: '[削れたもの]' },
      { name: '[削った画面].html', ext: 'HTML', why: '[作らなかった・やめた理由]', saved: '[削れたもの]' },
    ],
  },
  {
    slug: 'yoga',
    title: 'オンラインヨガの予約システム',
    kind: 'Webアプリ',
    summary: '[オンラインヨガのレッスンを予約・管理するシステム。何を解決するものかを1〜2文で書く]',
    role: '[担当範囲：設計・実装・テスト など]',
    stack: ['[使用技術]'],
    highlights: [
      { title: '自動テスト 226件', body: '[テストで何を守っているか（予約の重複・定員・キャンセル など）]' },
      { title: '[工夫した点 2]', body: '[どんな課題に、どう取り組んだか]' },
    ],
    links: [
      { label: 'デモ', href: null },
      { label: 'GitHub', href: 'https://github.com/koutadev/reservation-yoga' },
    ],
    thumb: '#E8DFD2',
    trimmed: [
      { name: '[削った機能].txt', ext: 'TXT', why: '[作らなかった・やめた理由]', saved: '[削れたもの]' },
      { name: '[削った画面].html', ext: 'HTML', why: '[作らなかった・やめた理由]', saved: '[削れたもの]' },
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
      { label: 'カタログを見る', href: null },
    ],
    thumb: '#DCE3D8',
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
      { label: 'サイト案を見る', href: null },
    ],
    thumb: '#DCD7E8',
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
