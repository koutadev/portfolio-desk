/**
 * デスクトップ型ポートフォリオの動き（外部ライブラリなし）
 *
 * しくみ
 * - ウィンドウは HTML に最初から書いてあり、ここでは「開いているか」「重なり順」「位置」だけを管理する
 * - 「＿」でしまうと、押したときの「＿」ボタンの位置（画面に対する割合）を覚え、吸い込まれる動きのあと閉じる
 *   次に開くときは、その位置に「＿」がくるように新しく開く。「×」で閉じたときは初期位置に開く
 * - 幅 820px 以下（またはスマホ表示の枠の中）では、いちばん手前のウィンドウだけを全画面で見せる（CSS）
 */

type Anchor = { rx: number; ry: number; offX: number; offY: number };
type TrashFile = { name: string; ext: string; why: string; saved: string };
type TrashData = { readme: { name: string; why: string }; folders: { id: string; name: string; color: string; files: TrashFile[] }[] };

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => Array.from(root.querySelectorAll<T>(sel));
const esc = (s: string): string => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
const reduced = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initDesktop(): void {
  const root = $('#d-root');
  const desk = $('#d-desk');
  if (!root || !desk) return;

  const wins = new Map<string, HTMLElement>();
  $$('[data-win]').forEach((w) => wins.set(w.dataset.win as string, w));
  const open = new Set<string>();
  let stack: string[] = [];
  const anchor = new Map<string, Anchor>();
  const status = $('#d-status');
  const say = (msg: string): void => { if (status) status.textContent = msg; };
  const labelOf = (id: string): string => wins.get(id)?.dataset.label ?? id;
  const isSheet = (w: HTMLElement): boolean => getComputedStyle(w).position === 'fixed';

  // ---------- 表示を状態に合わせる ----------
  function render(): void {
    const top = stack[stack.length - 1];
    wins.forEach((w, id) => {
      const on = open.has(id);
      w.classList.toggle('is-open', on);
      w.classList.toggle('is-top', on && id === top);
      w.style.zIndex = String(10 + Math.max(0, stack.indexOf(id)));
    });
    $$('.d-icon[data-open]').forEach((b) => b.setAttribute('aria-pressed', String(open.has(b.dataset.open as string))));
    $$('.d-dock-btn[data-open]').forEach((b) => {
      const id = b.dataset.open as string;
      const on = open.has(id) || (id === 'works' && open.has('case'));
      b.classList.toggle('is-open', on);
      b.setAttribute('aria-label', labelOf(id) + (on ? '（開いています）' : ''));
    });
  }

  function front(id: string): void {
    stack = stack.filter((x) => x !== id).concat(id);
    render();
  }

  function place(id: string): void {
    const w = wins.get(id);
    if (!w) return;
    const r = desk!.getBoundingClientRect();
    const width = Number(w.dataset.w);
    const a = anchor.get(id);
    let x = Number(w.dataset.x);
    let y = Number(w.dataset.y);
    if (a) { x = a.rx * r.width - a.offX; y = a.ry * r.height - a.offY; }
    x = Math.max(0, Math.min(r.width - Math.min(width, r.width - 24) - 12, x));
    y = Math.max(0, Math.min(r.height - 160, y));
    w.style.left = Math.round(x) + 'px';
    w.style.top = Math.round(y) + 'px';
    // 画面の高さに収まらないときは、ドックの上で止めて中をスクロールさせる
    w.style.maxHeight = Math.max(240, Math.round(r.height - y - 96)) + 'px';
  }

  function focusTitle(id: string): void {
    const t = document.getElementById('wt-' + id);
    if (t) t.focus({ preventScroll: true });
  }

  // ---------- 開く・閉じる・しまう ----------
  // focus=false は読み込み直後に開くとき（フォーカス枠を出さない）
  function openWin(id: string, slug?: string, focus = true): void {
    if (!wins.has(id)) return;
    hideHint();
    if (id === 'case' && slug) showCase(slug);
    if (open.has(id)) { front(id); if (focus) focusTitle(id); return; }
    place(id);
    open.add(id);
    stack = stack.filter((x) => x !== id).concat(id);
    render();
    if (focus) focusTitle(id);
    say(labelOf(id) + 'を開きました');
  }

  function closeWin(id: string): void {
    const w = wins.get(id);
    const done = (): void => {
      open.delete(id);
      anchor.delete(id);
      stack = stack.filter((x) => x !== id);
      render();
      say(labelOf(id) + 'を閉じました');
    };
    if (!w || reduced() || !w.animate) { done(); return; }
    const anim = isSheet(w)
      ? w.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 280, easing: 'cubic-bezier(.4,0,1,1)' })
      : w.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 160, easing: 'ease-in' });
    anim.onfinish = done;
  }

  function minWin(id: string): void {
    const w = wins.get(id);
    const btn = w?.querySelector<HTMLElement>('[data-act="min"]');
    if (w && btn) {
      const r = desk!.getBoundingClientRect();
      const wr = w.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      anchor.set(id, { rx: (cx - r.left) / r.width, ry: (cy - r.top) / r.height, offX: cx - wr.left, offY: cy - wr.top });
    }
    genie(id, () => {
      open.delete(id);
      stack = stack.filter((x) => x !== id);
      render();
      if (w) w.style.visibility = '';
      say(labelOf(id) + 'をドックにしまいました');
    });
  }

  // ウィンドウを横に細く切った複製を一番上の層に重ね、下の段ほど先にドックへ寄せる（側面が曲がって見える）
  function genie(id: string, done: () => void): void {
    const w = wins.get(id);
    const dock = document.getElementById('dock-' + (id === 'case' ? 'works' : id));
    if (!w || !dock || reduced() || !w.animate || isSheet(w)) { done(); return; }
    const a = w.getBoundingClientRect();
    const b = dock.getBoundingClientRect();
    const N = Math.max(24, Math.min(48, Math.round(a.height / 9)));
    const tx = b.left + b.width / 2 - (a.left + a.width / 2);
    const ty = b.top + b.height * 0.35;
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;overflow:hidden;';
    const src = w.cloneNode(true) as HTMLElement;
    src.removeAttribute('id');
    src.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
    src.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;max-width:none;margin:0;animation:none;box-shadow:none;visibility:visible;`;
    const dur = 600;
    for (let i = 0; i < N; i++) {
      const c = i === N - 1 ? src : (src.cloneNode(true) as HTMLElement);
      const t0 = (i / N) * 100;
      const t1 = ((i + 1) / N) * 100;
      c.style.clipPath = `inset(${Math.max(0, t0 - 0.25)}% 0 ${Math.max(0, 100 - t1 - 0.25)}% 0)`;
      const v = (i + 0.5) / N;
      c.style.transformOrigin = `50% ${v * 100}%`;
      const dy = ty - (a.top + a.height * v);
      layer.appendChild(c);
      c.animate(
        [
          { transform: 'translate(0px,0px) scale(1,1)', opacity: 1 },
          { transform: `translate(${tx * v * v * 0.55}px,${dy * v ** 4 * 0.2}px) scale(${1 - 0.8 * v ** 1.6},1)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${tx * (0.8 + 0.2 * v)}px,${dy * (0.5 + 0.5 * v ** 0.6)}px) scale(${0.2 - 0.1 * v},0.7)`, opacity: 1, offset: 0.78 },
          { transform: `translate(${tx}px,${dy}px) scale(0.06,0.2)`, opacity: 0 },
        ],
        { duration: dur, easing: 'cubic-bezier(.5,0,.75,.25)', fill: 'both' },
      );
    }
    document.body.appendChild(layer);
    w.style.visibility = 'hidden';
    window.setTimeout(() => { layer.remove(); done(); }, dur + 40);
  }

  // ---------- 作品の詳細 ----------
  function showCase(slug: string): void {
    const w = wins.get('case');
    if (!w) return;
    let title = '作品';
    $$('[data-case-panel]', w).forEach((p) => {
      const on = p.dataset.casePanel === slug;
      p.hidden = !on;
      if (on) title = p.getAttribute('aria-label') ?? title;
    });
    const t = $('.d-win-title', w);
    if (t) t.textContent = title;
    w.dataset.label = title;
  }

  // ---------- ドラッグと矢印キーで動かす ----------
  function moveTo(w: HTMLElement, x: number, y: number): void {
    const r = desk!.getBoundingClientRect();
    w.style.left = Math.round(Math.max(0, Math.min(r.width - 80, x))) + 'px';
    w.style.top = Math.round(Math.max(0, Math.min(r.height - 60, y))) + 'px';
  }
  desk.addEventListener('pointerdown', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('.d-drag');
    if (!t || e.button !== 0) return;
    const w = t.closest<HTMLElement>('[data-win]');
    if (!w || isSheet(w)) return;
    front(w.dataset.win as string);
    const sx = e.clientX, sy = e.clientY, px = w.offsetLeft, py = w.offsetTop;
    const move = (ev: PointerEvent): void => moveTo(w, px + ev.clientX - sx, py + ev.clientY - sy);
    const up = (): void => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
  desk.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    const w = t.closest<HTMLElement>('[data-win]');
    if (w && e.key === 'Escape') { e.stopPropagation(); closeWin(w.dataset.win as string); return; }
    if (w && t.classList.contains('d-drag') && !isSheet(w)) {
      const step = e.shiftKey ? 40 : 10;
      const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const m = d[e.key];
      if (m) { e.preventDefault(); moveTo(w, w.offsetLeft + m[0], w.offsetTop + m[1]); }
    }
  });

  // ---------- クリックの振り分け ----------
  document.addEventListener('click', (e) => {
    const el = e.target as Element;
    const caseLink = el.closest<HTMLElement>('[data-case]');
    if (caseLink) { e.preventDefault(); openWin('case', caseLink.dataset.case); return; }
    const opener = el.closest<HTMLElement>('[data-open]');
    if (opener) { if (opener.closest('#d-info')) toggleInfo(false); openWin(opener.dataset.open as string); return; }
    const act = el.closest<HTMLElement>('[data-act]');
    if (!act) {
      const w = el.closest<HTMLElement>('[data-win]');
      if (w && open.has(w.dataset.win as string) && stack[stack.length - 1] !== w.dataset.win) front(w.dataset.win as string);
      return;
    }
    const w = act.closest<HTMLElement>('[data-win]');
    switch (act.dataset.act) {
      case 'min': if (w) minWin(w.dataset.win as string); break;
      case 'close': if (w) closeWin(w.dataset.win as string); break;
      case 'mode': toggleMode(); break;
      case 'hint': hideHint(); break;
      case 'info': toggleInfo(); break;
      case 'info-close': toggleInfo(false); break;
      case 'contact-reset': resetContact(); break;
    }
  });
  $('#d-brand')?.addEventListener('click', () => toggleInfo());
  $('#d-mode')?.addEventListener('click', () => toggleMode());

  // ---------- 案内・このポートフォリオについて ----------
  function hideHint(): void { const h = $('#d-hint'); if (h) h.hidden = true; }
  function toggleInfo(force?: boolean): void {
    const p = $('#d-info');
    if (!p) return;
    const show = force ?? p.hidden;
    p.hidden = !show;
    $('#d-brand')?.setAttribute('aria-expanded', String(show));
    if (show) { hideHint(); $('#d-info-close')?.focus({ preventScroll: true }); }
  }
  $('#d-info')?.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); toggleInfo(false); } });

  // ---------- スマホ表示の切り替え ----------
  let saved: { open: string[]; stack: string[] } | null = null;
  function toggleMode(): void {
    const phone = !root!.classList.contains('is-phone');
    if (phone) {
      saved = { open: [...open], stack: [...stack] };
      open.clear(); stack = [];
    } else if (saved) {
      saved.open.forEach((x) => open.add(x)); stack = saved.stack;
    }
    root!.classList.toggle('is-phone', phone);
    $('#d-mode')?.setAttribute('aria-pressed', String(phone));
    const l = $('#d-mode-label'); if (l) l.textContent = phone ? 'PCで表示' : 'スマホで表示';
    hideHint();
    render();
    say(phone ? 'スマホでの見え方に切り替えました' : 'PCの表示に戻しました');
  }

  // ---------- 時計と、滞在時間で移り変わる壁紙 ----------
  const WALLS = [
    { at: 0, name: '朝', base: '#2A3550', c1: '#F2A07B', c2: '#8FB3E8', c3: '#F4C95D' },
    { at: 120, name: '昼', base: '#183A3E', c1: '#5FC3A8', c2: '#8FB3FF', c3: '#C6E28A' },
    { at: 300, name: '夕方', base: '#3A2433', c1: '#F28B6B', c2: '#F4C95D', c3: '#B784C9' },
    { at: 450, name: '夜', base: '#121722', c1: '#3E5BA8', c2: '#7B5EA7', c3: '#2E8C8C' },
    { at: 600, name: '朝', base: '#2A3550', c1: '#F2A07B', c2: '#8FB3E8', c3: '#F4C95D' },
  ];
  const mix = (a: string, b: string, t: number): string => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
  };
  const started = Date.now();
  function tick(): void {
    const now = new Date();
    const p = (n: number): string => (n < 10 ? '0' : '') + n;
    const wd = ['日', '月', '火', '水', '木', '金', '土'][now.getDay()];
    const hm = `${p(now.getHours())}:${p(now.getMinutes())}`;
    const menu = $('#d-clock-menu');
    if (menu) { menu.textContent = `${now.getMonth() + 1}月${now.getDate()}日（${wd}）　${hm}`; menu.setAttribute('datetime', now.toISOString()); }
    const big = $('#d-clock-big'); if (big) big.textContent = hm;
    const date = $('#d-date-big'); if (date) date.textContent = `${now.getMonth() + 1}月${now.getDate()}日 ${wd}曜日`;
    const sec = Math.floor((Date.now() - started) / 1000);
    const x = sec % 600;
    let i = 0;
    while (i < WALLS.length - 2 && x >= WALLS[i + 1].at) i++;
    const A = WALLS[i], B = WALLS[i + 1];
    const t = (x - A.at) / (B.at - A.at);
    (['base', 'c1', 'c2', 'c3'] as const).forEach((k) => root!.style.setProperty(`--w-${k}`, mix(A[k], B[k], t)));
    const mins = Math.floor(sec / 60);
    const d = $('#d-dwell'); if (d) d.textContent = `滞在 ${mins < 1 ? '1分未満' : mins + '分'}・${t < 0.5 ? A.name : B.name}`;
  }
  tick();
  window.setInterval(tick, 5000);

  // ---------- 連絡フォーム ----------
  const form = $<HTMLFormElement>('#contact-form');
  const doneBox = $('#contact-done');
  function setErr(input: HTMLElement | null, msgId: string, on: boolean): void {
    if (input) { input.setAttribute('aria-invalid', String(on)); input.closest('.m-row')?.classList.toggle('is-invalid', on); }
    const m = document.getElementById(msgId); if (m) m.hidden = !on;
  }
  // 直したらその場でエラー表示を消す（送信を押すまで赤いまま残さない）
  ([['f-name', 'f-name-err'], ['f-mail', 'f-mail-err'], ['f-msg', 'f-msg-err']] as const).forEach(([id, err]) => {
    const el = document.getElementById(id);
    el?.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setErr(el, err, false); });
  });
  function resetContact(): void { if (form && doneBox) { form.reset(); form.hidden = false; doneBox.hidden = true; } }
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = form;
    const name = f.elements.namedItem('name') as HTMLInputElement;
    const mail = f.elements.namedItem('email') as HTMLInputElement;
    const msg = f.elements.namedItem('message') as HTMLTextAreaElement;
    const hp = f.elements.namedItem('website') as HTMLInputElement;
    const errs = { name: !name.value.trim(), mail: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim()), msg: !msg.value.trim() };
    setErr(name, 'f-name-err', errs.name); setErr(mail, 'f-mail-err', errs.mail); setErr(msg, 'f-msg-err', errs.msg);
    const first = errs.name ? name : errs.mail ? mail : errs.msg ? msg : null;
    if (first) { first.focus(); say('入力内容を確認してください'); return; }
    const sendErr = $('#f-send-err');
    const btn = $<HTMLButtonElement>('#f-submit');
    if (sendErr) sendErr.hidden = true;
    const btnLabel = $('#f-submit-label');
    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = '送信中…';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.value, email: mail.value, message: msg.value, website: hp.value }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'failed');
      f.hidden = true;
      if (doneBox) doneBox.hidden = false;
      const toast = $('#d-toast');
      if (toast) { toast.hidden = false; window.setTimeout(() => { toast.hidden = true; }, 5000); }
      say('メッセージを受け付けました');
    } catch (err) {
      const reason = (err as Error).message;
      if (sendErr) {
        sendErr.textContent = reason === 'not_configured'
          ? 'いまは送信の準備中です。お手数ですが GitHub からご連絡ください。'
          : '送信できませんでした。時間をおいて、もう一度お試しください。';
        sendErr.hidden = false;
      }
    } finally {
      if (btn) btn.disabled = false;
      if (btnLabel) btnLabel.textContent = '送信';
    }
  });

  // ---------- ゴミ箱（Finder 風） ----------
  initFinder();

  // ---------- 最初の状態 ----------
  const params = new URLSearchParams(location.search);
  const narrow = desk.getBoundingClientRect().width <= 820;
  if (params.get('case')) openWin('case', params.get('case') as string, false);
  else if (params.get('open')) openWin(params.get('open') as string, undefined, false);
  else if (!narrow) { openWin('about', undefined, false); openWin('works', undefined, false); hideHint(); const h = $('#d-hint'); if (h) h.hidden = false; }
  render();
}

// =========================================================
// Finder 風のゴミ箱：1回のクリックで選び、ダブルクリックか Enter で開く
// =========================================================
function initFinder(): void {
  const box = $('#finder');
  const raw = $('#trash-data');
  if (!box || !raw) return;
  const data = JSON.parse(raw.textContent || '{}') as TrashData;
  const EXT_COLOR: Record<string, string> = { TXT: '#6B7378', APP: '#2F7FE8', HTML: '#E5482A', PDF: '#D7261E', MOV: '#7B5EA7', XLSX: '#17A15A' };
  const KIND: Record<string, string> = { TXT: 'テキスト', APP: 'アプリ', HTML: '画面', PDF: 'PDF', MOV: '動画', XLSX: '表計算' };
  const folderSvg = (w: number, h: number): string => `<svg aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 64 50"><path d="M3 7a5 5 0 0 1 5-5h15.5l5 5H56a5 5 0 0 1 5 5v3H3z" fill="#3E9BF0"/><rect x="3" y="11" width="58" height="37" rx="5" fill="#69B5FA"/><rect x="3" y="11" width="58" height="3" fill="#8CC8FC"/></svg>`;
  const docSvg = (w: number, h: number, ext: string): string => `<svg aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 48 58"><path d="M5 2h26l14 14v38a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#FFFFFF" stroke="#C7C7CC"/><path d="M31 2v12a2 2 0 0 0 2 2h12" fill="#F2F2F7" stroke="#C7C7CC"/><rect x="7" y="36" width="34" height="13" rx="3" fill="${EXT_COLOR[ext] || '#6B7378'}"/>${w > 20 ? `<text x="24" y="45.6" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8.5" font-weight="500" fill="#FFFFFF">${esc(ext)}</text>` : ''}</svg>`;

  type Item = { key: string; name: string; isFolder: boolean; fid?: string; ext: string; kind: string; why: string; saved: string };
  const st = { folder: null as string | null, sel: null as string | null, view: 'icon' as 'icon' | 'list', hist: [null] as (string | null)[], hi: 0, q: '', msg: false };

  box.innerHTML = `
  <div class="fd">
    <div class="fd-toolbar">
      <div role="group" aria-label="移動" style="display:flex;gap:2px">
        <button type="button" class="fd-tool" data-fd="back" aria-label="戻る"><svg aria-hidden="true" width="9" height="14" viewBox="0 0 9 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2L2 7l5 5"/></svg></button>
        <button type="button" class="fd-tool" data-fd="fwd" aria-label="進む"><svg aria-hidden="true" width="9" height="14" viewBox="0 0 9 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l5 5-5 5"/></svg></button>
      </div>
      <p class="fd-title" data-fd-title></p>
      <div class="fd-seg" role="group" aria-label="表示の切り替え">
        <button type="button" data-fd="icon" aria-label="アイコンで表示"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg></button>
        <button type="button" data-fd="list" aria-label="リストで表示"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1.5 3h11M1.5 7h11M1.5 11h11"/></svg></button>
      </div>
      <label class="fd-search"><svg aria-hidden="true" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="5.5" cy="5.5" r="4"/><path d="M8.5 8.5L12 12"/></svg><span class="sr">この場所を検索</span><input type="search" placeholder="検索" data-fd-q /></label>
    </div>
    <div class="fd-strip"><p>ゴミ箱</p><button type="button" data-fd="empty">空にする</button></div>
    <p class="fd-msg" data-fd-msg role="status" hidden>空にはしません。何を、なぜ削ったかを残しておくのが、このポートフォリオの決まりです。</p>
    <div class="fd-grid">
      <nav class="fd-side" aria-label="場所" data-fd-side></nav>
      <div class="fd-main"><p class="sr" id="fd-open-desc">フォルダはダブルクリックか Enter キーで開きます。</p><div data-fd-main></div></div>
      <aside class="fd-preview" aria-label="プレビュー" aria-live="polite" data-fd-preview></aside>
    </div>
    <div class="fd-foot"><nav class="fd-path" aria-label="いまの場所" data-fd-path></nav><p class="fd-count" data-fd-count></p></div>
  </div>`;

  const q = <T extends HTMLElement = HTMLElement>(s: string): T => box.querySelector<T>(s) as T;
  const folderOf = (id: string | null) => data.folders.find((f) => f.id === id) || null;

  function items(): Item[] {
    const f = folderOf(st.folder);
    const all: Item[] = f
      ? f.files.map((x, i) => ({ key: `file:${i}`, name: x.name, isFolder: false, ext: x.ext, kind: KIND[x.ext] || 'ファイル', why: x.why, saved: x.saved }))
      : data.folders.map((x): Item => ({ key: `folder:${x.id}`, fid: x.id, name: x.name, isFolder: true, ext: '', kind: 'フォルダ', why: `${x.name}で削ったこと`, saved: `${x.files.length}項目` }))
          .concat([{ key: 'readme', name: data.readme.name, isFolder: false, ext: 'TXT', kind: 'テキスト', why: data.readme.why, saved: '—' }]);
    const qq = st.q.toLowerCase();
    return all.filter((it) => !qq || it.name.toLowerCase().includes(qq));
  }

  function go(fid: string | null): void {
    st.hist = st.hist.slice(0, st.hi + 1);
    if (st.hist[st.hist.length - 1] !== fid) st.hist.push(fid);
    st.hi = st.hist.length - 1;
    st.folder = fid; st.sel = null; st.q = ''; st.msg = false;
    q<HTMLInputElement>('[data-fd-q]').value = '';
    draw();
  }

  function draw(): void {
    const f = folderOf(st.folder);
    const list = items();
    q('[data-fd-title]').textContent = f ? f.name : 'ゴミ箱';
    q<HTMLButtonElement>('[data-fd="back"]').disabled = st.hi <= 0;
    q<HTMLButtonElement>('[data-fd="fwd"]').disabled = st.hi >= st.hist.length - 1;
    q('[data-fd="icon"]').setAttribute('aria-pressed', String(st.view === 'icon'));
    q('[data-fd="list"]').setAttribute('aria-pressed', String(st.view === 'list'));
    q('[data-fd-msg]').hidden = !st.msg;

    const side = [{ id: null as string | null, name: 'ゴミ箱' }].concat(data.folders.map((x) => ({ id: x.id, name: x.name })));
    q('[data-fd-side]').innerHTML =
      `<p class="fd-sec">よく使う項目</p>` +
      side.map((s) => `<button type="button" class="fd-side-btn" data-go="${s.id ?? ''}" aria-pressed="${st.folder === s.id}">${s.id === null
        ? '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0A64D8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11M6 4V2.5h4V4M3.8 4l.8 9.5h6.8l.8-9.5"/></svg>'
        : '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0A64D8" stroke-width="1.4" stroke-linejoin="round"><path d="M1.8 4.2a1 1 0 0 1 1-1h3.4l1.4 1.5h5.6a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1H2.8a1 1 0 0 1-1-1z"/></svg>'}<span>${esc(s.name)}</span></button>`).join('') +
      `<p class="fd-sec">タグ</p>` +
      data.folders.map((x) => `<button type="button" class="fd-side-btn" data-go="${x.id}" aria-pressed="false"><span class="fd-dot" aria-hidden="true" style="background:${x.color}"></span><span>${esc(x.name)}</span></button>`).join('');

    const main = q('[data-fd-main]');
    if (!list.length) {
      main.innerHTML = '<p class="fd-empty">一致する項目はありません</p>';
    } else if (st.view === 'icon') {
      main.innerHTML = `<ul class="fd-icons">${list.map((it) => `<li><button type="button" class="fd-item" data-key="${esc(it.key)}" aria-pressed="${st.sel === it.key}" aria-describedby="fd-open-desc"><span class="fd-ic">${it.isFolder ? folderSvg(64, 50) : docSvg(48, 58, it.ext)}</span><span class="fd-lb">${esc(it.name)}</span></button></li>`).join('')}</ul>`;
    } else {
      main.innerHTML = `<div class="fd-head" aria-hidden="true"><span>名前</span><span>種類</span><span>削れたもの</span></div><ul class="fd-list">${list.map((it) => `<li><button type="button" class="fd-row" data-key="${esc(it.key)}" aria-pressed="${st.sel === it.key}" aria-describedby="fd-open-desc"><span class="fd-row-name">${it.isFolder ? folderSvg(18, 14) : docSvg(14, 17, it.ext)}<span>${esc(it.name)}</span></span><span class="fd-sub">${esc(it.kind)}</span><span class="fd-sub">${esc(it.saved)}</span></button></li>`).join('')}</ul>`;
    }

    const all = items();
    const sel = all.find((it) => it.key === st.sel) || null;
    q('[data-fd-preview]').innerHTML = sel
      ? `<div class="fd-pv-icon">${sel.isFolder ? folderSvg(96, 75) : docSvg(72, 87, sel.ext)}</div><p class="fd-pv-name">${esc(sel.name)}</p><p class="fd-pv-kind">${esc(sel.kind)}</p><div class="fd-pv-info"><p>情報</p><dl><div><dt>削った理由</dt><dd>${esc(sel.why)}</dd></div><div><dt>削れたもの</dt><dd><b>${esc(sel.saved)}</b></dd></div></dl></div>`
      : '<p class="fd-pv-none">項目を選ぶと、ここに<br>削った理由が表示されます</p>';
    const path = ['ゴミ箱'].concat(f ? [f.name] : []).concat(sel ? [sel.name] : []);
    q('[data-fd-path]').innerHTML = path.map((n, i) => `${i ? '<span aria-hidden="true">›</span>' : ''}<span>${esc(n)}</span>`).join('');
    q('[data-fd-count]').textContent = `${list.length}項目${sel ? '（1項目を選択中）' : ''}`;
  }

  const openItem = (key: string): void => {
    const it = items().find((x) => x.key === key);
    if (!it) return;
    if (it.isFolder && it.fid) go(it.fid); else { st.sel = key; draw(); }
  };
  const refocus = (key: string): void => { box.querySelector<HTMLElement>(`[data-key="${CSS.escape(key)}"]`)?.focus(); };

  box.addEventListener('click', (e) => {
    const el = e.target as Element;
    const g = el.closest<HTMLElement>('[data-go]');
    if (g) { go(g.dataset.go || null); return; }
    const k = el.closest<HTMLElement>('[data-key]');
    // 1回目のクリックで一覧を描き直すため dblclick は消えた要素に届かない。2回目のクリックを e.detail で判定する
    if (k) { const key = k.dataset.key as string; if ((e as MouseEvent).detail >= 2) { openItem(key); refocus(key); } else { st.sel = key; draw(); refocus(key); } return; }
    const a = el.closest<HTMLElement>('[data-fd]');
    if (!a) return;
    switch (a.dataset.fd) {
      case 'back': if (st.hi > 0) { st.hi--; st.folder = st.hist[st.hi]; st.sel = null; draw(); } break;
      case 'fwd': if (st.hi < st.hist.length - 1) { st.hi++; st.folder = st.hist[st.hi]; st.sel = null; draw(); } break;
      case 'icon': st.view = 'icon'; draw(); break;
      case 'list': st.view = 'list'; draw(); break;
      case 'empty': st.msg = true; draw(); break;
    }
  });
  box.addEventListener('keydown', (e) => {
    const k = (e.target as Element).closest<HTMLElement>('[data-key]');
    if (k && e.key === 'Enter') { e.preventDefault(); const key = k.dataset.key as string; openItem(key); }
  });
  q<HTMLInputElement>('[data-fd-q]').addEventListener('input', (e) => { st.q = (e.target as HTMLInputElement).value; st.sel = null; draw(); });
  draw();
}
