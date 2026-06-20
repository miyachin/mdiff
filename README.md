# mdiff

2つの Markdown ファイルをアップロードして、差分を GitHub 風の **split view** で比較できるツールです。

## 機能

- **ファイルアップロード** — クリック選択 / ドラッグ&ドロップ対応
- **split view 差分表示** — 左に Original（旧）、右に Changed（新）を並べて比較
  - 削除行は赤、追加行は緑でハイライト
  - 変更行は **文字単位（word-level）** でハイライト
  - 行番号付き、対応しない行は空セル表示
  - `+N additions / -N deletions` のサマリー
- ダークモード対応

## 開発

```bash
npm run dev
```

[http://localhost:3100](http://localhost:3100) を開いてください。

## 技術スタック

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [diff](https://www.npmjs.com/package/diff)（行 diff・文字 diff）
