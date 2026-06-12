import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const flashDir = resolve(root, "flash-build");
const indexPath = resolve(flashDir, "index.html");
const playPath = resolve(flashDir, "PLAY.html");

copyFileSync(indexPath, playPath);
mkdirSync(resolve(flashDir, "OPTIONAL_LICENSED_ASSETS"), { recursive: true });

const readme = `ТЫ — СОБЫТИЕ

1. Откройте PLAY.html двойным кликом.
2. Рекомендуемый браузер: Chrome, Edge или Яндекс Браузер.
3. Интернет и установка не нужны.
4. Прогресс хранится в браузере на этом компьютере.

Если браузер показывает предупреждение о локальном файле, выберите открытие в браузере.

Архив исходников проекта находится рядом с PLAY.html, если в комплект добавлен ona-sobytie-source.zip.
`;

writeFileSync(resolve(flashDir, "КАК ЗАПУСТИТЬ.txt"), readme, "utf8");

const html = readFileSync(playPath, "utf8");
if (!html.includes("<script") || !html.includes("<style")) {
  throw new Error("Offline HTML does not contain inlined application assets.");
}

console.log(`Portable file ready: ${playPath}`);
