"use client";

import type { Cell, Row } from "@/lib/diff";

function cellBg(kind: Cell["kind"]) {
  switch (kind) {
    case "added":
      return "bg-green-50 dark:bg-green-950/40";
    case "removed":
      return "bg-red-50 dark:bg-red-950/40";
    case "empty":
      return "bg-neutral-50 dark:bg-neutral-900/60";
    default:
      return "";
  }
}

function marker(kind: Cell["kind"]) {
  if (kind === "added") return "+";
  if (kind === "removed") return "-";
  return " ";
}

function highlightClass(kind: Cell["kind"]) {
  if (kind === "added") return "bg-green-200 dark:bg-green-700/60 rounded-sm";
  if (kind === "removed") return "bg-red-200 dark:bg-red-700/60 rounded-sm";
  return "";
}

function CellView({ cell, side }: { cell: Cell; side: "left" | "right" }) {
  return (
    <>
      <td
        className={`select-none border-r border-neutral-200 px-2 text-right align-top text-xs leading-5 text-neutral-400 dark:border-neutral-800 ${
          side === "right" ? "border-l" : ""
        } ${cellBg(cell.kind)}`}
      >
        {cell.num ?? ""}
      </td>
      <td className={`align-top ${cellBg(cell.kind)}`}>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words px-2 font-mono text-xs leading-5">
          <span className="select-none pr-1 text-neutral-400">
            {marker(cell.kind)}
          </span>
          {cell.segments.map((seg, i) => (
            <span key={i} className={seg.highlight ? highlightClass(cell.kind) : ""}>
              {seg.value}
            </span>
          ))}
        </pre>
      </td>
    </>
  );
}

export default function DiffView({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-12" />
          <col className="w-[calc(50%-3rem)]" />
          <col className="w-12" />
          <col className="w-[calc(50%-3rem)]" />
        </colgroup>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <CellView cell={row.left} side="left" />
              <CellView cell={row.right} side="right" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
