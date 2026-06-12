# Ты — событие

Интерактивная mood-game на React, Phaser и Zustand. Прогресс хранится в `localStorage`.

## Локальный запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Версия для флешки

```bash
npm run build:flash
```

Команда создаёт `flash-build/PLAY.html`. Это автономный файл: арты, шрифты, код и звуки встроены внутрь. Его можно открыть двойным кликом в Chrome, Edge или Яндекс Браузере без интернета и локального сервера.

Запуск готовой сборки в локальной сети:

```bash
npm run build
npm run serve
```

После запуска откройте адрес компьютера в локальной сети с портом `4173`.

## GitHub Pages

1. Создайте репозиторий и загрузите проект в ветку `main`.
2. В GitHub откройте `Settings → Pages`.
3. В `Build and deployment` выберите `Source: GitHub Actions`.
4. Workflow `.github/workflows/deploy.yml` соберёт и опубликует сайт после push в `main`.

`base: "./"` в Vite позволяет размещать игру как в корневом домене, так и в Pages-подкаталоге.

## Персонализация

Основные тексты находятся в `src/data/game.json`. Их можно заменить без изменения игровой логики.

Карта замены звуков находится в `SOUND_DESIGN.md`, а сведения об артах и внешних референсах — в `ART_LICENSES.md`.
