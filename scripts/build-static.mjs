// 静的ビルド（API不要）: カテゴリハブページ生成 → sitemap.xml 再生成(記事＋計算機＋ハブ) → IndexNow で当日分をping。
// generate-blog.mjs（記事生成）の後にワークフローで実行する。単体でも実行可（node scripts/build-static.mjs）。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG = path.join(ROOT, 'blog');
const BASE = 'https://reliefnote.jp';
const INDEXNOW_KEY = '978cdbe4d73e74ccc7193633df40d34d';

const jst = new Date(Date.now() + 9 * 3600 * 1000);
const DATE_ISO = `${jst.getUTCFullYear()}-${String(jst.getUTCMonth() + 1).padStart(2, '0')}-${String(jst.getUTCDate()).padStart(2, '0')}`;

const backlog = JSON.parse(fs.readFileSync(path.join(BLOG, 'backlog.json'), 'utf-8'));
const published = backlog.posts.filter((p) => p.published);

// カテゴリ → URLスラッグ／導入文
const CAT = {
  '手続きの基本': { slug: 'kihon', intro: '大切な方を亡くした直後の、最初の手続きの基礎。何から・いつ・どこで進めればいいかをまとめています。' },
  'お金・財産': { slug: 'okane', intro: '受け取り忘れやすい給付・保険金から、口座凍結や名義変更まで。お金にまつわる手続きをやさしく解説します。' },
  '相続': { slug: 'souzoku', intro: '相続放棄・相続税・相続登記・遺言・法定相続人まで。期限のある相続手続きを、順番と要点で整理しています。' },
  '契約・解約': { slug: 'kaiyaku', intro: '携帯・クレジットカード・NHK・賃貸・公共料金など、故人の契約の解約・名義変更の進め方をまとめています。' },
  'デジタル遺品': { slug: 'digital', intro: 'スマホのロック、サブスク、SNS、ネット証券・暗号資産まで。見落としやすいデジタルの手続きを解説します。' },
  '生前の備え': { slug: 'seizen', intro: '生前整理・エンディングノート・家族信託・おひとりさまの終活まで。元気なうちにできる備えをまとめています。' },
  '介護・入院': { slug: 'kaigo', intro: '介護保険の申請、離れて暮らす親の見守りなど、介護・入院に関わる手続きと備えを解説します。' },
  'こころ': { slug: 'kokoro', intro: '大切な人を亡くしたあとの気持ちとの向き合い方。無理をしないための、こころのケアの読み物です。' },
};

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function hubHtml(catName, meta, posts) {
  const url = `${BASE}/blog/c-${meta.slug}.html`;
  const items = posts.map((p, i) => ({ p, i }));
  const itemList = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${catName}の記事一覧`, url,
    mainEntity: { '@type': 'ItemList', itemListElement: items.map(({ p, i }) => ({ '@type': 'ListItem', position: i + 1, url: `${BASE}/blog/${p.slug}.html`, name: p.title })) },
  };
  const bc = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'ブログ', item: `${BASE}/blog/` },
      { '@type': 'ListItem', position: 3, name: catName, item: url },
    ],
  };
  const cards = posts.map((p) => `      <li class="hub-item"><a href="${p.slug}.html"><b>${esc(p.title)}</b>${p.q ? `<span>${esc(p.q)}</span>` : ''}</a></li>`).join('\n');
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(catName)}の手続き 記事一覧｜リリーフノート</title>
<meta name="description" content="${esc(catName)}に関する手続きの記事一覧。${esc(meta.intro)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#FFFFFF">
<meta property="og:title" content="${esc(catName)}の手続き 記事一覧">
<meta property="og:description" content="${esc(meta.intro)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:image" content="${BASE}/images/logo-header.png">
<link rel="icon" href="../images/logo-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="blog.css">
<style>
  .hub-list { list-style:none; padding:0; margin:16px 0; display:grid; gap:10px; }
  .hub-item a { display:block; background:#fff; border:1px solid #e7e2d6; border-radius:12px; padding:14px 16px; text-decoration:none; color:#3A3E31; }
  .hub-item a:hover { border-color:#A9853F; }
  .hub-item b { display:block; font-size:15px; line-height:1.5; }
  .hub-item span { display:block; color:#8a8272; font-size:13px; margin-top:3px; }
</style>
<script type="application/ld+json">${JSON.stringify(bc)}</script>
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
</head>
<body>

<header>
  <div class="wrap">
    <a href="../"><img class="logo" src="../images/logo-jp.png" alt="リリーフノート"></a>
    <nav>
      <a href="./">ブログ</a>
      <a href="../#how">できること</a>
      <a href="../#price">料金</a>
      <a class="cta" href="../#start">無料で始める</a>
    </nav>
  </div>
</header>

<article class="article">
  <nav class="breadcrumb"><a href="../">ホーム</a> ／ <a href="./">ブログ</a> ／ ${esc(catName)}</nav>
  <span class="tag">${esc(catName)}</span>
  <h1>${esc(catName)}の手続き 記事一覧</h1>
  <p>${esc(meta.intro)}</p>

  <ul class="hub-list">
${cards}
  </ul>

  <div class="appcta">
    <div class="in">
      <h3>あなたに必要な手続きだけを、順番に</h3>
      <p>ReliefNote は、あなたの状況に必要な手続きだけを絞り込み、期限・持ち物・窓口まで案内します。無料。</p>
      <a class="btn" href="../#start">ReliefNote を無料で使ってみる</a>
    </div>
  </div>
</article>

<footer>
  <div class="wrap">
    <div class="cols">
      <div><a href="../"><img class="logo" src="../images/logo-jp.png" alt="リリーフノート" style="height:28px"></a></div>
      <div><a href="./">ブログ</a><a href="../#how">できること</a><a href="../#price">料金</a></div>
    </div>
    <p class="fineprint">ReliefNote（リリーフノート）／ 創業者 北林 歩<br>本記事は一般的な情報提供を目的としています。手続きの要否・期限・必要書類は制度改正やご事情により異なる場合があります。実際の手続きは各機関の最新の案内をご確認ください。&copy; ReliefNote</p>
  </div>
</footer>
</body>
</html>
`;
}

function buildHubs() {
  const byCat = {};
  for (const p of published) { (byCat[p.category] ||= []).push(p); }
  const hubUrls = [];
  for (const [catName, meta] of Object.entries(CAT)) {
    const posts = (byCat[catName] || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    if (posts.length === 0) continue;
    fs.writeFileSync(path.join(BLOG, `c-${meta.slug}.html`), hubHtml(catName, meta, posts));
    hubUrls.push(`${BASE}/blog/c-${meta.slug}.html`);
  }
  return hubUrls;
}

function regenSitemap(hubUrls) {
  const staticPages = [`${BASE}/`, `${BASE}/blog/`, `${BASE}/blog/souzoku-kigen-keisan.html`];
  const articleUrls = published.map((p) => `${BASE}/blog/${p.slug}.html`);
  const urls = [...staticPages, ...hubUrls, ...articleUrls];
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`), '</urlset>', ''].join('\n');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
  return urls.length;
}

async function pingIndexNow(urls) {
  if (!urls.length) return;
  if (!process.env.CI) { console.log('IndexNow: ローカル実行のためスキップ（本番=CIでのみ送信）'); return; }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ host: 'reliefnote.jp', key: INDEXNOW_KEY, keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`, urlList: urls }),
    });
    console.log(`IndexNow ping: ${res.status} (${urls.length} URL)`);
  } catch (e) { console.log('IndexNow ping 失敗（無視）:', e.message); }
}

const hubUrls = buildHubs();
const nUrls = regenSitemap(hubUrls);
// 当日公開された記事＋ハブ＋計算機を IndexNow へ
const todayArticles = published.filter((p) => p.date === DATE_ISO).map((p) => `${BASE}/blog/${p.slug}.html`);
const pingList = [...new Set([...todayArticles, ...hubUrls, `${BASE}/blog/souzoku-kigen-keisan.html`])];
console.log(`ハブ ${hubUrls.length}ページ / sitemap ${nUrls}URL / IndexNow対象 ${pingList.length}`);
await pingIndexNow(pingList);
