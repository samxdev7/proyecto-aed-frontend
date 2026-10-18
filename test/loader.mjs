import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const relativePath = specifier.slice(2);
    const candidateBase = path.join(process.cwd(), "src", relativePath);
    let resolved = candidateBase;
    if (fs.existsSync(candidateBase + ".ts")) resolved = candidateBase + ".ts";
    else if (fs.existsSync(candidateBase + ".tsx")) resolved = candidateBase + ".tsx";
    else if (fs.existsSync(path.join(candidateBase, "index.ts"))) resolved = path.join(candidateBase, "index.ts");
    else if (fs.existsSync(path.join(candidateBase, "index.tsx"))) resolved = path.join(candidateBase, "index.tsx");
    return nextResolve(pathToFileURL(resolved).href, context);
  }
  return nextResolve(specifier, context);
}
