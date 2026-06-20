"use client";

import { useMemo, useState } from "react";
import FileDrop from "@/components/FileDrop";
import DiffView from "@/components/DiffView";
import { buildDiff } from "@/lib/diff";

type Doc = { name: string; content: string };

export default function Home() {
  const [left, setLeft] = useState<Doc | null>(null);
  const [right, setRight] = useState<Doc | null>(null);

  const result = useMemo(() => {
    if (!left || !right) return null;
    return buildDiff(left.content, right.content);
  }, [left, right]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">mdiff</h1>
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
          <div className="mb-2 flex items-center gap-3 text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">
              +{result.stats.additions} additions
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -{result.stats.deletions} deletions
            </span>
            {result.stats.additions === 0 && result.stats.deletions === 0 && (
              <span className="text-neutral-500">差分はありません</span>
            )}
          </div>
          <DiffView rows={result.rows} />
        </section>
      )}

      {!result && (
        <p className="mt-10 text-center text-sm text-neutral-400">
          両方のファイルを選択すると差分が表示されます
        </p>
      )}
    </main>
  );
}
