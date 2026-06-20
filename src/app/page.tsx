"use client";

import { useEffect, useMemo, useState } from "react";
import FileDrop from "@/components/FileDrop";
import DiffView from "@/components/DiffView";
import { buildDiff, type DiffStats } from "@/lib/diff";

type Doc = { name: string; content: string };

/** 差分の量に応じた、控えめで洒落た一言（隠し味） */
function flavor(stats: DiffStats): string {
  const { additions, deletions } = stats;
  const total = additions + deletions;
  if (total === 0) return "Not a byte out of place. 一字一句、完璧な複製です。";
  if (total > 200) return "A plot twist of some magnitude. 大改造の予感。";
  if (deletions === 0) return "Pure growth — 足し算だけの、健やかな変更。";
  if (additions === 0) return "The art of subtraction. 引き算の美学。";
  return "Spot the difference. 違い、見つけました。";
}

export default function Home() {
  const [left, setLeft] = useState<Doc | null>(null);
  const [right, setRight] = useState<Doc | null>(null);

  // URL クエリ (?left=/path/a.md&right=/path/b.md) で渡されたファイルを自動表示。
  // Claude がファイルを書いて mdiff を開くだけで差分が出る、という動線のため。
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const leftPath = sp.get("left") ?? sp.get("a");
    const rightPath = sp.get("right") ?? sp.get("b");

    const load = async (path: string, set: (doc: Doc) => void) => {
      try {
        const res = await fetch(`/api/source?path=${encodeURIComponent(path)}`);
        if (!res.ok) return;
        const data = (await res.json()) as Doc;
        set({ name: data.name, content: data.content });
      } catch {
        /* ローカル読み込み失敗時は手動アップロードにフォールバック */
      }
    };

    if (leftPath) load(leftPath, setLeft);
    if (rightPath) load(rightPath, setRight);
  }, []);

  const result = useMemo(() => {
    if (!left || !right) return null;
    return buildDiff(left.content, right.content);
  }, [left, right]);

  const sameName =
    left && right && left.name === right.name ? left.name : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8">
      <header className="mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            mdiff
            <span className="mdiff-caret text-neutral-400" aria-hidden>
              ▍
            </span>
          </h1>
          <span className="font-mono text-xs lowercase tracking-wide text-neutral-400">
            diff happens.
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          2つの Markdown ファイルをアップロードして、差分を split view で比較
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FileDrop
          label="Original (旧)"
          fileName={left?.name ?? null}
          onLoad={(name, content) => setLeft({ name, content })}
        />
        <FileDrop
          label="Changed (新)"
          fileName={right?.name ?? null}
          onLoad={(name, content) => setRight({ name, content })}
        />
      </div>

      {result && (
        <section className="mt-6">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">
              +{result.stats.additions} additions
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{result.stats.deletions} deletions
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500">{flavor(result.stats)}</span>
          </div>
          {sameName && (
            <p className="mb-2 font-mono text-xs text-neutral-400">
              “{sameName}” vs “{sameName}” — same name, different story.
            </p>
          )}
          <DiffView rows={result.rows} />
        </section>
      )}

      {!result && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-neutral-400">
            両方のファイルを選ぶと、ここに違いが浮かび上がります。
          </p>
          <p className="font-mono text-xs text-neutral-400/80">
            All diffing happens in your browser — nothing leaves this page. 🔒
          </p>
        </div>
      )}

      <footer className="mt-auto pt-10 text-center font-mono text-xs text-neutral-400/70">
        mdiff · diff happens, gracefully.
      </footer>
    </main>
  );
}
