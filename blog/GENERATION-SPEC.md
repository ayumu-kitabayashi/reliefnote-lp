# ReliefNote ブログ 自動生成スペック（AEO最適化）

このファイルは、`backlog.json` から記事を生成するときの**厳守ルール**。毎日3本、`published:false` の上から順に生成する。

## 手順（1回の実行 = 3本）
1. `blog/backlog.json` を読み、`published:false` の先頭3件を選ぶ。
2. 各件について `blog/<slug>.html` を、下記テンプレに沿って**本文を実際に執筆**して作成する（テンプレ埋めでなく、独自で有用な内容を書く。薄い/重複コンテンツはAEOに逆効果）。
3. `backlog.json` の該当3件に `"published":true` と `"date":"YYYY-MM-DD"`（実行日）を追記。
4. `sitemap.xml` を全 published 記事URL＋主要ページで再生成。
5. **git commit/pushはしない**（公開＝デプロイは人間が確認して行う。[[feedback_commit_manual]]）。
6. 生成した3本のタイトル/slugを報告。

## 記事テンプレ（各 `<slug>.html`）
`oya-ga-nakunattara-yarukoto.html` を参考実装とする。必須要素：

- **文字コード/フォント/CSS**: `blog.css` を読み込む（`<link rel="stylesheet" href="blog.css">`）。フォントは Noto Sans JP。
- **head**: `<title>`（タイトル＋｜ReliefNote）、`meta description`（120〜140字・要点先出し）、`canonical`（`https://reliefnote.jp/blog/<slug>.html`）、OGP、favicon。
- **構造化データ（JSON-LD 3種）**:
  - `BlogPosting`（headline, description, image=logo-header.png, datePublished/dateModified=実行日, author=Person「北林 歩」jobTitle「ReliefNote 創業者」, publisher=Organization「ReliefNote」, mainEntityOfPage）
  - `BreadcrumbList`（ホーム→ブログ→記事）
  - `FAQPage`（本文末のQ&Aと一致させる／最低3問）
- **本文構成（AEOの肝）**:
  1. パンくず（`.breadcrumb`）
  2. カテゴリ`.tag` ＋ `<h1>`（見出しに句読点を付けない方針だが記事H1は疑問形/【】可）
  3. `.pubmeta`（日付・監修 北林 歩・読了目安）
  4. **`.answer`（結論ボックス）＝質問への答えを最初の段落で完結させる**（AI/AEOが引用する核。40〜120字で直答）
  5. `.toc`（目次・アンカーリンク）
  6. `<h2 id="...">` セクション（3〜6個）。各セクションは**質問見出し or 明確な小見出し**＋箇条書き中心で走査しやすく。
  7. 必要に応じて `.deadline-table`（期限表）や `.callout`（注意点）
  8. `.appcta`（ReliefNoteアプリへの内部リンク）
  9. `<h2>よくある質問</h2>` ＋ `.faq-q`/`.faq-a`（FAQPageと一致）
  10. `.author`（logo-mark.png＋北林 歩）
  11. `footer`（免責・法人表記なし）

## コンテンツ規約（厳守）
- **捏造stat禁止**：未検証の「◯%」「◯人」を書かない。金額・件数は「一般的な説明にとどめる」「自治体・保険者で異なる」等の但し書きを付ける。法定期限（死亡届7日・相続放棄3か月・準確定4か月・相続税10か月・相続登記義務化）は事実として記載可。
- **免責必須**：制度改正・個別事情で異なる旨、各機関の最新案内を確認する旨をフッターに明記。ReliefNoteは手続き案内であり法務/税務/医療の助言ではない。
- **法人表記なし**：株式会社/Inc./会社概要/代表 は使わない。運営者は「創業者 北林 歩」。
- **他業界を貶さない**（金融・保険・自治体・葬儀）。
- **トーン**：子・孫世代に向けた実利・平易・落ち着いた文体。死を過度に煽らない。
- **内部リンク**：関連する既存記事があれば本文中に1〜2本リンク（回遊とトピッククラスタ強化）。
- **重複回避**：同じ内容の使い回しをしない。各記事は独自の切り口・具体手順で書く。

## slug/カテゴリ
`backlog.json` の `slug`（半角英数ハイフン）と `category` をそのまま使う。ファイル名は `<slug>.html`。
