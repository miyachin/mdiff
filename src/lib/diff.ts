import { diffLines, diffWordsWithSpace, type Change } from "diff";

export type Segment = { value: string; highlight: boolean };

export type Cell = {
  num: number | null;
  segments: Segment[];
  kind: "normal" | "added" | "removed" | "empty";
};

export type Row = {
  left: Cell;
  right: Cell;
};

export type DiffStats = {
  additions: number;
  deletions: number;
};

const EMPTY_CELL: Cell = { num: null, segments: [], kind: "empty" };

function plain(value: string): Segment[] {
  return [{ value, highlight: false }];
}

/** removed/added の対応行から、行内の文字単位ハイライトを生成する */
function wordHighlight(
  oldLine: string,
  newLine: string
): { left: Segment[]; right: Segment[] } {
  const parts = diffWordsWithSpace(oldLine, newLine);
  const left: Segment[] = [];
  const right: Segment[] = [];
  for (const part of parts) {
    if (part.added) {
      right.push({ value: part.value, highlight: true });
    } else if (part.removed) {
      left.push({ value: part.value, highlight: true });
    } else {
      left.push({ value: part.value, highlight: false });
      right.push({ value: part.value, highlight: false });
    }
  }
  return { left, right };
}

/** diff の chunk を改行単位の行配列へ分割する（末尾の空行は除く） */
function toLines(chunk: Change): string[] {
  const lines = chunk.value.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

export function buildDiff(
  oldText: string,
  newText: string
): { rows: Row[]; stats: DiffStats } {
  // 末尾改行の有無で最終行が共通行として認識されない問題を避けるため正規化
  const normalize = (t: string) => (t.endsWith("\n") || t === "" ? t : t + "\n");
  const changes = diffLines(normalize(oldText), normalize(newText));
  const rows: Row[] = [];
  const stats: DiffStats = { additions: 0, deletions: 0 };

  let leftNum = 1;
  let rightNum = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      // 共通行
      for (const line of toLines(change)) {
        rows.push({
          left: { num: leftNum++, segments: plain(line), kind: "normal" },
          right: { num: rightNum++, segments: plain(line), kind: "normal" },
        });
      }
      continue;
    }

    if (change.removed) {
      const removedLines = toLines(change);
      const next = changes[i + 1];

      if (next && next.added) {
        // 削除 + 追加 = 変更ブロック。行同士をペアにする
        const addedLines = toLines(next);
        i++; // added 側を消費
        const max = Math.max(removedLines.length, addedLines.length);
        for (let j = 0; j < max; j++) {
          const oldLine = removedLines[j];
          const newLine = addedLines[j];

          if (oldLine !== undefined && newLine !== undefined) {
            const { left, right } = wordHighlight(oldLine, newLine);
            rows.push({
              left: { num: leftNum++, segments: left, kind: "removed" },
              right: { num: rightNum++, segments: right, kind: "added" },
            });
            stats.deletions++;
            stats.additions++;
          } else if (oldLine !== undefined) {
            rows.push({
              left: { num: leftNum++, segments: plain(oldLine), kind: "removed" },
              right: EMPTY_CELL,
            });
            stats.deletions++;
          } else {
            rows.push({
              left: EMPTY_CELL,
              right: { num: rightNum++, segments: plain(newLine), kind: "added" },
            });
            stats.additions++;
          }
        }
      } else {
        // 削除のみ
        for (const line of removedLines) {
          rows.push({
            left: { num: leftNum++, segments: plain(line), kind: "removed" },
            right: EMPTY_CELL,
          });
          stats.deletions++;
        }
      }
      continue;
    }

    if (change.added) {
      // 直前の removed とペアにならなかった追加のみ
      for (const line of toLines(change)) {
        rows.push({
          left: EMPTY_CELL,
          right: { num: rightNum++, segments: plain(line), kind: "added" },
        });
        stats.additions++;
      }
    }
  }

  return { rows, stats };
}
