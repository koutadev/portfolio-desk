/**
 * 問い合わせフォームの受け口（Vercel のサーバー側で動く）
 * - メールの送信は Resend の API を直接呼ぶ（SDK は使わない）
 * - 環境変数：RESEND_API_KEY（必須）、CONTACT_TO（届け先・必須）、CONTACT_FROM（送信元・任意）
 * - JS が動かないフォーム送信（form の POST）にも対応し、その場合は完了ページを HTML で返す
 */
import type { APIRoute } from 'astro';

export const prerender = false;

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const page = (title: string, body: string, status = 200): Response =>
  new Response(
    `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:sans-serif;max-width:560px;margin:64px auto;padding:0 20px;line-height:1.8"><h1 style="font-size:22px">${title}</h1><p>${body}</p><p><a href="/">デスクトップへ戻る</a></p></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  let input: Record<string, string> = {};
  try {
    if ((request.headers.get('content-type') || '').includes('application/json')) {
      input = (await request.json()) as Record<string, string>;
    } else {
      const fd = await request.formData();
      fd.forEach((v, k) => { input[k] = String(v); });
    }
  } catch {
    return wantsJson ? json({ ok: false, error: 'bad_request' }, 400) : page('送信できませんでした', '入力内容を読み取れませんでした。', 400);
  }

  const name = String(input.name || '').trim().slice(0, 100);
  const email = String(input.email || '').trim().slice(0, 200);
  const message = String(input.message || '').trim().slice(0, 4000);

  // 迷惑な自動送信よけ（人には見えない欄に入力があれば、送ったふりをして終える）
  if (input.website) return wantsJson ? json({ ok: true }) : page('送信しました', 'ありがとうございました。');

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return wantsJson ? json({ ok: false, error: 'invalid' }, 422) : page('送信できませんでした', 'お名前・メールアドレス・ご用件を確認して、もう一度お試しください。', 422);
  }

  const key = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO;
  const from = import.meta.env.CONTACT_FROM || 'onboarding@resend.dev';
  if (!key || !to) {
    return wantsJson ? json({ ok: false, error: 'not_configured' }, 503) : page('送信の準備中です', 'いまはフォームから送信できません。お手数ですが GitHub からご連絡ください。', 503);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `【ポートフォリオ】${name} さんからのメッセージ`,
      text: `お名前：${name}\nメールアドレス：${email}\n\n${message}`,
    }),
  });
  if (!res.ok) {
    return wantsJson ? json({ ok: false, error: 'send_failed' }, 502) : page('送信できませんでした', '時間をおいて、もう一度お試しください。', 502);
  }
  return wantsJson ? json({ ok: true }) : page('送信しました', 'メッセージを受け付けました。内容を確認して返信します。');
};
