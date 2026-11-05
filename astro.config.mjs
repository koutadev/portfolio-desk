// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// ページは事前に HTML を書き出す（static）。問い合わせの API だけ Vercel のサーバー側で動かす
export default defineConfig({
  site: 'https://portfolio-desk-chi.vercel.app',
  output: 'static',
  adapter: vercel(),
  devToolbar: { enabled: false },
});
