import uiClick from "./assets/audio/ui-click.wav";
import cardSelect from "./assets/audio/card-select.wav";
import battleHit from "./assets/audio/battle-hit.wav";
import achievementUnlock from "./assets/audio/achievement-unlock.wav";
import sceneComplete from "./assets/audio/scene-complete.wav";
import catPurr from "./assets/audio/cat-purr.wav";
import circuitConnect from "./assets/audio/circuit-connect.wav";
import roomSoften from "./assets/audio/room-soften.wav";
import finale from "./assets/audio/finale.wav";
import backgroundMusic from "./assets/audio/back.mp3";
import cyberpunkHeart from "./assets/audio/cyberpunk-heart.mp3";

export type SoundCue =
  | "ui-click"
  | "card-select"
  | "battle-hit"
  | "achievement-unlock"
  | "scene-complete"
  | "cat-purr"
  | "circuit-connect"
  | "room-soften"
  | "finale"
  | "cyberpunk-heart";

const urls: Record<SoundCue, string> = {
  "ui-click": uiClick,
  "card-select": cardSelect,
  "battle-hit": battleHit,
  "achievement-unlock": achievementUnlock,
  "scene-complete": sceneComplete,
  "cat-purr": catPurr,
  "circuit-connect": circuitConnect,
  "room-soften": roomSoften,
  "finale": finale,
  "cyberpunk-heart": cyberpunkHeart,
};

const cueMix: Record<SoundCue, number> = {
  "ui-click": .34,
  "card-select": .38,
  "battle-hit": .4,
  "achievement-unlock": .46,
  "scene-complete": .48,
  "cat-purr": .34,
  "circuit-connect": .34,
  "room-soften": .34,
  "finale": .42,
  "cyberpunk-heart": .88,
};

const BACKGROUND_VOLUME = .06;
const activeSounds = new Map<SoundCue, Set<HTMLAudioElement>>();
let background: HTMLAudioElement | null = null;
let backgroundStarted = false;
let backgroundDucked = false;
let muted = false;
let unlocked = false;
let fadeFrame = 0;

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

function registerActive(cue: SoundCue, audio: HTMLAudioElement) {
  let cueSounds = activeSounds.get(cue);
  if (!cueSounds) {
    cueSounds = new Set();
    activeSounds.set(cue, cueSounds);
  }
  cueSounds.add(audio);
  audio.addEventListener("ended", () => cueSounds?.delete(audio), { once: true });
}

function fadeAudio(audio: HTMLAudioElement, to: number, duration = 600) {
  window.cancelAnimationFrame(fadeFrame);

  const from = audio.volume;
  const startedAt = window.performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    audio.volume = from + (to - from) * progress;

    if (progress < 1) {
      fadeFrame = window.requestAnimationFrame(tick);
    }
  };

  fadeFrame = window.requestAnimationFrame(tick);
}

function createAudio(src: string, volume: number, loop = false) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.loop = loop;
  audio.volume = clampVolume(volume);
  audio.muted = muted;
  return audio;
}

export function unlockAudio() {
  unlocked = true;
}

export function setAudioMuted(value: boolean) {
  muted = value;
  background?.pause();
  if (background) {
    background.muted = muted;
    if (!muted && backgroundStarted && !backgroundDucked) {
      void background.play().catch((error) => console.warn("[sound] Фон пока заблокирован браузером", error));
      fadeAudio(background, BACKGROUND_VOLUME, 500);
    }
  }

  activeSounds.forEach((sounds) => {
    sounds.forEach((sound) => {
      sound.muted = muted;
      if (muted) {
        sound.pause();
      }
    });
  });
}

export function startBackgroundMusic() {
  if (muted) return;
  unlockAudio();

  if (!background) {
    background = createAudio(backgroundMusic, 0, true);
  }

  if (backgroundStarted && !background.paused) return;

  backgroundStarted = true;
  background.currentTime = background.currentTime || 0;
  background.volume = 0;

  void background
    .play()
    .then(() => {
      fadeAudio(background as HTMLAudioElement, backgroundDucked ? 0 : BACKGROUND_VOLUME, 1200);
    })
    .catch((error) => {
      backgroundStarted = false;
      console.warn("[sound] Фон ждёт первый клик/тап браузера", error);
    });
}

export function setBackgroundDucked(ducked: boolean) {
  backgroundDucked = ducked;
  if (!background) return;
  fadeAudio(background, ducked || muted ? 0 : BACKGROUND_VOLUME, ducked ? 180 : 700);
}

export function playSound(cue: SoundCue, volume = 1) {
  if (muted) return;
  unlockAudio();

  if (cue === "cyberpunk-heart") {
    stopSound("cyberpunk-heart");
  }

  const audio = createAudio(urls[cue], volume * cueMix[cue]);
  registerActive(cue, audio);

  void audio.play().catch((error) => {
    if (!unlocked) {
      console.warn(`[sound] ${cue} ждёт первый клик/тап браузера`, error);
      return;
    }

    console.warn(`[sound] Не удалось проиграть ${cue}`, error);
  });

  if (cue !== "cyberpunk-heart") {
    window.setTimeout(startBackgroundMusic, 160);
  }
}

export function stopSound(cue: SoundCue) {
  activeSounds.get(cue)?.forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });
  activeSounds.get(cue)?.clear();
}

export function stopAllSounds(except?: SoundCue) {
  activeSounds.forEach((sounds, cue) => {
    if (cue === except) return;
    sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    sounds.clear();
  });
}
