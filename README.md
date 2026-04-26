# ReliefNote — Corporate HP

ご遺族の手続き支援サービス「ReliefNote」のコーポレートサイト。
葬儀社・生命保険・福利厚生・金融機関のパートナーとともに展開する B2B ソリューションを業界別に提案します。

公開URL: <https://reliefnote.jp>

## ページ構成

| ファイル | 内容 |
|---|---|
| `index.html` | コーポレートトップ — ミッション・4業界ソリューション概観・プラットフォーム説明・数字・実証パートナー |
| `for-funeral.html` | 葬儀社さま向け（OEM・ホワイトラベル提供） |
| `for-insurance.html` | 生命保険会社さま向け（保険金支払い後の受益者支援） |
| `for-benefits.html` | 福利厚生（雇用主）さま向け（従業員家族の手続き支援） |
| `for-financial.html` | 金融機関さま向け（相続を起点としたリレーション設計） |
| `company.html` | About — ミッション、創業者ノート、現在の活動状況 |
| `contact.html` | お問い合わせフォーム（Supabase 連携） |
| `styles.css` | 全ページ共通スタイルシート |

## デザインシステム

- **書体**: 見出し: Noto Serif JP (500/700) / 本文: -apple-system 系 sans
- **背景**: warm cream (`#f7f5f0`) を基調に、warm-deep (`#efeae0`) と dark accent (`#3F453F`) を要所に
- **アクセント**: warm-orange (`#b95f3e`)
- **レイアウト**: 編集的バーティカルリスト・大型単独数字・asymmetric grid を組み合わせて、SaaS 的な対称感を抑える

## 技術構成

- 静的 HTML + CSS + 最小限の vanilla JS（フォーム送信・URLパラメータ初期化のみ）
- ビルドツール不要、GitHub Pages から直接配信
- フォーム送信先: Supabase REST API

## 法人化前提

ReliefNote は現時点で法人化されていません。
- 「ReliefNote, Inc.」「株式会社」「会社概要」「代表」等の表記は使用しません
- About ページは「現在の活動状況」として、法人化準備中である旨を明示しています

## デプロイ

- ホスティング: GitHub Pages（CNAME: `reliefnote.jp`）
- main ブランチへの push で自動デプロイされます

## ローカル確認

```bash
open index.html
```
