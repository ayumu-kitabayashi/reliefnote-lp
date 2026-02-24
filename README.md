# ReliefNote Landing Page

遺族のための手続き支援サービス「ReliefNote」のランディングページ。

## 概要

- **コンセプト**: 多死社会における「遺族のためのGPS」
- **デザイン参考**: Empathy.com のLPパターンをReliefNoteのトーンにローカライズ
- **技術構成**: 単一HTMLファイル（CSS inline）、JavaScript不使用

## デザインシステム（CSS変数）

| 変数名 | 値 | 用途 |
|--------|-----|------|
| `--bg-primary` | `#ffffff` | カード・白背景セクション |
| `--bg-warm` | `#f8f7f4` | ページ全体の背景 |
| `--bg-dark` | `#2c2f2c` | Stats帯・CTA帯 |
| `--text-primary` | `#1a1a1a` | 見出し・メインテキスト |
| `--text-secondary` | `#6b6b6b` | 説明文・本文 |
| `--text-tertiary` | `#999999` | セクションラベル・補助 |
| `--text-on-dark` | `#f0efe9` | ダーク背景上の見出し |
| `--text-on-dark-sub` | `#b0b0a8` | ダーク背景上のサブテキスト |
| `--accent` | `#3F453F` | ボタン・アクセント |

## 実装済みセクション（9セクション構成）

| # | セクション | 背景色 | 内容 |
|---|-----------|--------|------|
| — | **Header** | blur semi-transparent | 固定ナビ（ロゴ + CTAボタン） |
| 1 | **Hero** | `--bg-warm` | ロゴアイコン + 大見出し + サブコピー + CTAボタン |
| 2 | **Stats** | `--bg-dark` | 3カラム統計数値（162万人 / 400万人 / 40〜100件） |
| 3 | **Reality** | `--bg-warm` | 課題提起テキスト（中央揃え） |
| 4 | **What we do** | `--bg-primary` | サービス概要（見出し + 説明） |
| 5 | **Features** | `--bg-warm` | 3枚のカード（01/02/03ナンバリング + アクセントライン） |
| 6 | **Testimonial** | `--bg-primary` | 引用符付きユーザーの声 |
| 7 | **Field** | `--bg-warm` | 北竜町実証運用 |
| 8 | **Founder** | `--bg-primary` | アバター + プロフィール |
| 9 | **CTA Band** | `--bg-dark` | クロージングメッセージ + メールボタン |
| — | **Footer** | `--bg-warm` | コピーライト |

## Empathyから取り入れたパターン

1. **固定ヘッダー**: blur背景のスティッキーナビ + 右上CTA
2. **Stats帯**: ダーク背景に大きな数字で社会課題のインパクトを示す
3. **背景色の交互切替**: warm → dark → warm → white → warm → white → dark で視覚リズム
4. **Testimonial**: 大きな引用符 + ユーザーの声で信頼性
5. **CTA Band**: ページ最下部にダーク背景のクロージングCTA
6. **Pill型ボタン**: `border-radius: 48px` の丸みのあるボタン
7. **ナンバリング**: Feature カードに 01/02/03 の番号で構造感

## ファイル構成

```
index.html              ... LP本体（HTML + CSS、単一ファイル完結）
images/
  ├── hero.jpg          ... （現在未使用・将来ヒーロー背景用）
  ├── logo-full.png     ... ロゴ（アイコン＋テキスト横並び / ヘッダー用）
  └── logo-icon.png     ... ロゴアイコンのみ（ヒーロー / favicon用）
README.md               ... 本ファイル
```

## URI

| パス | 内容 |
|------|------|
| `/` (`index.html`) | ランディングページ |

## 未実装・将来対応

- [ ] Founder アバターを実写顔写真に差し替え
- [ ] OGP画像（`og:image`）の設定
- [ ] Google Analytics / GTM の設置
- [ ] パートナーロゴ帯（葬儀社・自治体ロゴ）の追加
- [ ] アプリスクリーンショットの掲載
- [ ] Googleフォーム連携（問い合わせフォーム埋め込み）

## 推奨次ステップ

1. **顔写真差し替え** — `.founder-avatar` → `<img>` に変更
2. **OGP画像作成** — 1200×630px
3. **独自ドメイン設定** — `reliefnote.jp` → GitHub Pages CNAME
4. **パートナーロゴ追加** — Stats帯の下にグレースケールロゴ帯
