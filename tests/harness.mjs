import vm from "node:vm";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const SRC = {
  browserApi: "src/shared/browser-api.js",
  messages: "src/shared/messages.js",
  state: "src/shared/state.js",
  selection: "src/shared/selection.js",
  panel: "src/content/panel.js",
  content: "src/content/content.js",
  background: "src/background/background.js",
  popup: "src/popup/popup.js"
};

export function loadModules(relativePaths, extraGlobals = {}) {
  const sandbox = { console, ...extraGlobals };
  const context = vm.createContext(sandbox);
  for (const rel of relativePaths) {
    const code = readFileSync(path.join(ROOT, rel), "utf8");
    vm.runInContext(code, context, { filename: rel });
  }
  return context;
}

export function readSource(relative) {
  return readFileSync(path.join(ROOT, relative), "utf8");
}

export { ROOT };
