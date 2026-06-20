import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

// ローカル開発専用: クエリで渡されたパスのファイルを読んで返す。
// 「Claude がファイルを書く → mdiff を URL 付きで開く」という動線のための入口。
const ALLOWED = new Set([".md", ".markdown", ".mdx", ".txt", ""]);

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path");

  if (!path) {
    return Response.json({ error: "path is required" }, { status: 400 });
  }
  if (!ALLOWED.has(extname(path).toLowerCase())) {
    return Response.json(
      { error: `unsupported file type: ${extname(path) || "(none)"}` },
      { status: 415 }
    );
  }

  try {
    const content = await readFile(path, "utf8");
    return Response.json({ name: basename(path), content });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 404 });
  }
}
