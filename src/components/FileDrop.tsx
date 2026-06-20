"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  fileName: string | null;
  onLoad: (name: string, content: string) => void;
};

export default function FileDrop({ label, fileName, onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onLoad(file.name, String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) readFile(file);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
        dragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
          : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
      }`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {fileName ? (
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          📄 {fileName}
        </span>
      ) : (
        <span className="text-sm text-neutral-400">
          クリック or ドロップして .md を選択
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
