// ReliefNote 日次ブログ 自動生成（GitHub Actions で実行）。
// backlog.json の未生成 → 足りなければ topic-seeds.json → それも尽きたらAIで新トピック提案、で燃料を確保し、
// Anthropic API で GENERATION-SPEC 準拠のHTMLを生成 → 機械検品 → 全合格時のみ backlog/sitemap を更新。
// 1本でも検品不合格なら exit 1（ワークフロー側で commit/push はスキップ＝壊れた記事は公開されない）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = path.join(ROOT, 'blog');
const N = Math.max(1, Math.min(4, parseInt(process.env.ARTICLES_PER_RUN || '2', 10)));
const MODEL = process.env.BLOG_MODEL || 'claude-sonnet-4-6';
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error('ANTHROPIC_API_KEY が未設定です'); process.exit(1); }

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const readText = (p) => fs.readFileSync(p, 'utf-8');

// JST の今日
const jst = new Date(Date.now() + 9 * 3600 * 1000);
const Y = jst.getUTCFullYear(), M = jst.getUTCMonth() + 1, D = jst.getUTCDate();
const DATE_ISO = `${Y}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`;
const DATE_JP = `${Y}年${M}月${D}日`;

const SPEC = readText(path.join(BLOG, 'GENERATION-SPEC.md'));
const REF = readText(path.join(BLOG, 'oya-ga-nakunattara-yarukoto.html'));
const backlog = readJSON(path.join(BLOG, 'backlog.json'));
const seedsFile = path.join(BLOG, 'topic-seeds.json');
const seeds = fs.existsSync(seedsFile) ? readJSON(seedsFile) : { seeds: [] };

const FORBIDDEN = ['株式会社', '会社概要', 'Inc.', '代表取締役'];
const existingSlugs = new Set(backlog.posts.map((p) => p.slug));

async function anthropic(prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  return (data.content || []).map((b) => b.text || '').join('');
}

function buildPrompt(entry) {
  const linkable = backlog.posts.filter((p) => p.published).map((p) => p.slug).slice(0, 40).join(', ');
  return [
    'あなたはReliefNote（親の"もしも"に子が迷わないための家族情報・手続き伴走アプリ）のブログAEO記事ライターです。',
    '下記の「厳守ルール」と「参考テンプレHTML」に完全準拠し、指定トピックの記事を1本、完成したHTML文書として書いてください。',
    '出力はHTMLのみ（```や説明文を前後に付けない）。<!DOCTYPE html>で始め</html>で終える。',
    '',
    `# 本日の日付\nJSON-LDのdatePublished/dateModified=「${DATE_ISO}」、本文pubmetaの表記=「${DATE_JP}」。`,
    '',
    '# 厳守ルール（GENERATION-SPEC.md）',
    SPEC,
    '',
    '# 追加の絶対ルール',
    `- 法人表記（${FORBIDDEN.join('・')}）を使わない。著者はPerson「北林 歩」jobTitle「ReliefNote 創業者」。`,
    '- 捏造stat禁止（未検証の%・人数・金額を書かない。金額や時効は「自治体・保険者・状況で異なる」等の但し書き、または一般化して書く）。',
    '- 確定した法定事実のみ断定してよい（死亡届7日/相続放棄3か月/準確定4か月/相続税10か月・基礎控除3000万+600万×法定相続人/相続登記2024年4月義務化・3年以内・10万円以下の過料/埋葬料原則5万円/世帯主変更14日 等）。',
    '- 3種のJSON-LD（BlogPosting/BreadcrumbList/FAQPage）必須。FAQPageと本文末FAQ（最低3問）を一致させる。.answer（結論ボックス）で質問に40〜120字で直答。',
    '- 免責フッター必須。他業界を貶さない。トーンは子・孫世代向けに実利・平易・落ち着いて。',
    `- 内部リンクを本文に1〜2本（既存slug例: ${linkable}）。CSSは<link rel="stylesheet" href="blog.css">、canonical/OGPは https://reliefnote.jp/blog/${entry.slug}.html。`,
    '',
    '# 参考テンプレHTML（この構造・CSSクラス・JSON-LDの形を踏襲）',
    REF,
    '',
    '# 書くトピック',
    `slug: ${entry.slug}`,
    `カテゴリ(tag): ${entry.category}`,
    `タイトル(h1/title): ${entry.title}`,
    `狙う検索質問(q): ${entry.q}`,
    `盛り込む論点: ${(entry.points || []).join(' / ')}`,
    '',
    'では、この1本の完成HTMLだけを出力してください。',
  ].join('\n');
}

function verify(html, entry) {
  const problems = [];
  const jsonld = (html.match(/application\/ld\+json/g) || []).length;
  if (jsonld < 3) problems.push(`JSON-LD ${jsonld}個(<3)`);
  if (!html.includes('class="answer"')) problems.push('.answer無し');
  if (!html.includes('"FAQPage"')) problems.push('FAQPage無し');
  if (!html.includes('fineprint')) problems.push('免責footer無し');
  if (!html.includes(DATE_ISO)) problems.push(`日付${DATE_ISO}無し`);
  const bad = FORBIDDEN.filter((w) => html.includes(w));
  if (bad.length) problems.push(`禁止語:${bad.join(',')}`);
  if (!html.trim().toLowerCase().startsWith('<!doctype html')) problems.push('DOCTYPE無し');
  if (!html.includes(`/blog/${entry.slug}.html`)) problems.push('canonical slug不一致');
  return problems;
}

async function proposeTopics(count) {
  const prompt = [
    'ReliefNote（親の没後/生前の手続き・家族情報アプリ）ブログの新トピックを提案してください。',
    `既存slug（重複禁止）: ${[...existingSlugs].join(', ')}`,
    `没後の手続き・相続・お金・契約解約・デジタル遺品・生前の備え・介護入院・こころ、の高インテントで実在の一般的テーマを${count}件。`,
    '出力はJSON配列のみ。各要素は {"slug":"半角英数ハイフン","category":"日本語カテゴリ","title":"...","q":"検索質問","kw":["..."],"points":["論点5つ"]}。',
    '捏造テーマや重複を避ける。JSON以外は出力しない。',
  ].join('\n');
  const raw = await anthropic(prompt, 2000);
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) return [];
  try { return JSON.parse(m[0]); } catch { return []; }
}

async function ensureFuel() {
  const un = () => backlog.posts.filter((p) => !p.published);
  while (un().length < N && seeds.seeds && seeds.seeds.length) {
    const s = seeds.seeds.shift();
    if (s && !existingSlugs.has(s.slug)) { backlog.posts.push({ ...s, published: false }); existingSlugs.add(s.slug); }
  }
  if (un().length < N) {
    const proposed = await proposeTopics(N - un().length);
    for (const t of proposed) {
      if (t && t.slug && !existingSlugs.has(t.slug)) { backlog.posts.push({ ...t, published: false }); existingSlugs.add(t.slug); }
    }
  }
}

function regenSitemap() {
  const base = 'https://reliefnote.jp';
  const pub = backlog.posts.filter((p) => p.published);
  const urls = [`${base}/`, `${base}/blog/`, ...pub.map((p) => `${base}/blog/${p.slug}.html`)];
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`), '</urlset>', ''].join('\n');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  return urls.length;
}

async function main() {
  await ensureFuel();
  const targets = backlog.posts.filter((p) => !p.published).slice(0, N);
  if (targets.length === 0) { console.log('生成対象なし（backlog/seeds/AI提案すべて空）。何もしない。'); return; }

  const written = [];
  for (const entry of targets) {
    console.log(`生成: ${entry.slug} …`);
    let html = await anthropic(buildPrompt(entry), 8000);
    html = html.replace(/^﻿/, '').replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
    const problems = verify(html, entry);
    if (problems.length) throw new Error(`検品NG [${entry.slug}]: ${problems.join(' / ')}`);
    fs.writeFileSync(path.join(BLOG, `${entry.slug}.html`), html + '\n');
    written.push(entry);
  }

  // 全合格 → 公開状態を確定
  for (const e of written) {
    const p = backlog.posts.find((x) => x.slug === e.slug);
    p.published = true; p.date = DATE_ISO;
  }
  fs.writeFileSync(path.join(BLOG, 'backlog.json'), JSON.stringify(backlog, null, 2));
  if (fs.existsSync(seedsFile)) fs.writeFileSync(seedsFile, JSON.stringify(seeds, null, 2));
  const nUrls = regenSitemap();
  console.log(`\n公開確定 ${written.length}本 / sitemap ${nUrls}URL`);
  written.forEach((e) => console.log(`  - ${e.slug}: ${e.title}`));
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
