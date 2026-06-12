import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import data from "./data/game.json";
import { useGameStore } from "./store";
import { achievementById, achievements, type AchievementId } from "./achievements";
import { playSound, setAudioMuted, setBackgroundDucked, stopAllSounds, stopSound, unlockAudio } from "./audio";
import nightArt from "./assets/cozy-night.webp";
import mirrorArt from "./assets/mirror-event.webp";
import battleArt from "./assets/battle-event.webp";
import mangaArt from "./assets/manga-event.webp";
import mirrorAvatar from "./assets/mirror-avatar-blonde.webp";
import heroAngela from "./assets/chibi-angela.webp";
import heroRuby from "./assets/chibi-ruby.webp";
import heroChange from "./assets/chibi-change.webp";
import heroLesley from "./assets/chibi-lesley.webp";
import circuitRelic from "./assets/achievement-circuit.webp";
import mangaMorning from "./assets/manga-morning.webp";
import mangaChaos from "./assets/manga-chaos.webp";
import mangaReaction from "./assets/manga-reaction.webp";
import mangaNight from "./assets/manga-night.webp";
import windowOne from "./assets/window-1.webp";
import windowTwo from "./assets/window-2.webp";
import windowThree from "./assets/window-3.webp";
import windowFour from "./assets/window-4.webp";
import windowFive from "./assets/window-5.webp";
import windowSix from "./assets/window-6.webp";
import cozyQuilt from "./assets/cozy-quilt.webp";
import angelaFigure from "./assets/angela-figure.webp";
import angelaKeychain from "./assets/angela-keychain.webp";
import angelaPlush from "./assets/angela-plush.webp";
import angelaLantern from "./assets/angela-lantern.webp";
import angelaTea from "./assets/angela-tea.webp";
import angelaMusicbox from "./assets/angela-musicbox.webp";

const GlowCanvas = lazy(() => import("./components/GlowCanvas").then((module) => ({ default: module.GlowCanvas })));
const sceneNames = ["Свет", "Зеркало", "Mood Draft", "Манга", "Кошка", "Схема", "Тишина", "Доказательства"];
const heroPortraits = [heroAngela, heroRuby, heroChange, heroLesley];
const mangaPanels = [mangaMorning, mangaChaos, mangaReaction, mangaNight];
const windowDioramas = [windowOne, windowTwo, windowThree, windowFour, windowFive, windowSix];

function ActionButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      className="primary-button"
      onClick={() => {
        playSound("ui-click", .42);
        onClick();
      }}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

function AchievementToast() {
  const toastId = useGameStore((state) => state.achievementToast);
  const dismiss = useGameStore((state) => state.dismissAchievement);
  const scene = useGameStore((state) => state.scene);

  useEffect(() => {
    if (!toastId) return;
    playSound("achievement-unlock", .7);
    const timeout = window.setTimeout(dismiss, 4300);
    return () => window.clearTimeout(timeout);
  }, [toastId, dismiss]);

  const achievement = toastId ? achievementById[toastId] : null;
  return (
    <AnimatePresence>
      {achievement && (
        <motion.aside
          className={`achievement-toast toast-scene-${scene}`}
          initial={{ opacity: 0, x: 45, scale: .92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 35, scale: .96 }}
        >
          <img src={achievement.icon} alt="" />
          <div>
            <span>достижение открыто · {achievement.rarity}</span>
            <strong>{achievement.title}</strong>
            <p>{achievement.description}</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function SceneShell({
  eyebrow,
  title,
  children,
  variant,
  backdrop,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  variant: string;
  backdrop?: string;
}) {
  return (
    <motion.main
      className={`scene-shell scene-${variant} ${backdrop ? "has-backdrop" : ""}`}
      style={backdrop ? { "--scene-art": `url(${backdrop})` } as React.CSSProperties : undefined}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
    >
      <div className="scene-atmosphere" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="scene-frame">
        <div className="scene-heading">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
        </div>
        <div className="scene-content">
          {children}
        </div>
      </div>
    </motion.main>
  );
}

function StartScene() {
  const finish = useGameStore((s) => s.finish);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const [pointer, setPointer] = useState({ x: -100, y: -100 });
  const [found, setFound] = useState<string[]>([]);
  const details = [
    { id: "bow", achievement: "mirror-truth" as AchievementId, label: "тот самый бантик", x: 87, y: 17 },
    { id: "manga", achievement: "chapter-18" as AchievementId, label: "ещё одна глава", x: 46, y: 88 },
    { id: "game", achievement: "mood-carry" as AchievementId, label: "пати ждёт", x: 69, y: 91 },
    { id: "mirror", achievement: "mirror-truth" as AchievementId, label: "маленькое зеркало", x: 12, y: 18 },
    { id: "blanket", achievement: "soft-crown" as AchievementId, label: "режим: под одеяло", x: 10, y: 68 },
    { id: "cat", achievement: "night-witness" as AchievementId, label: "ночной наблюдатель", x: 84, y: 53 },
  ];
  const discovered = found.length;

  return (
    <main
      className="start-scene"
      style={{ backgroundImage: `url(${nightArt})` }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const next = { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
        setPointer(next);
        const close = details.filter((detail) => Math.hypot(next.x - detail.x, next.y - detail.y) < 10).map((detail) => detail.id);
        if (close.length) setFound((current) => [...new Set([...current, ...close])]);
      }}
    >
      <Suspense fallback={null}><GlowCanvas /></Suspense>
      <div className="light-findings" aria-hidden="true">
        {details.map((detail) => {
          const distance = Math.hypot(pointer.x - detail.x, pointer.y - detail.y);
          const visible = distance < 10;
          const isFound = found.includes(detail.id);
          return (
            <span
              className={`finding-anchor ${isFound ? "is-found" : ""}`}
              key={detail.label}
              style={{ left: `${detail.x}%`, top: `${detail.y}%` }}
            >
              <motion.span animate={{ opacity: visible || isFound ? 1 : 0, scale: visible ? 1 : isFound ? .58 : .82 }}>
                <img src={achievementById[detail.achievement].icon} alt="" />
                <em>{detail.label}</em>
              </motion.span>
            </span>
          );
        })}
      </div>
      <div className="start-vignette" />
      <motion.img
        className="easter-egg egg-keychain"
        src={angelaKeychain}
        alt=""
        animate={{ rotate: [-5, 5, -5], y: [0, 5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="start-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <span className="eyebrow">ночная комната для одной очень красивой девочки</span>
        <h1>Ты — событие</h1>
        <p>Сайт был тихим и почти пустым, пока не появилась ты.</p>
        <small>Поводи мышкой или пальцем. Свет уже тебя узнал.{discovered > 0 ? ` Находок рядом: ${discovered}.` : ""}</small>
        <ActionButton onClick={() => { unlockAchievement("first-light"); playSound("scene-complete", .6); finish(0); }}>зайти как самая красивая девочка</ActionButton>
      </motion.div>
    </main>
  );
}

function MirrorScene() {
  const finish = useGameStore((s) => s.finish);
  const addCompliment = useGameStore((s) => s.addCompliment);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const [values, setValues] = useState([45, 38, 62, 28, 55, 44]);
  const labels = ["сонность", "хаос", "уверенность", "усталость", "улыбка", "серьёзность"];
  const strongest = values.indexOf(Math.max(...values));
  const complimentMap = [0, 1, 5, 2, 4, 3];
  const compliment = data.compliments[complimentMap[strongest]];

  return (
    <SceneShell eyebrow="01 · зеркало без фильтра" title="Тебе не нужно попадать в настройку" variant="mirror" backdrop={mirrorArt}>
      <div className="mirror-layout">
        <motion.img
          className="easter-egg egg-plush"
          src={angelaPlush}
          alt=""
          animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="mirror"
          style={{
            "--mirror-glow": `${.25 + values[4] / 250}`,
            "--mirror-warmth": `${.8 + values[2] / 280}`,
          } as React.CSSProperties}
          animate={{ boxShadow: `0 0 ${38 + values[4]}px rgba(255, 174, 205, .22)` }}
        >
          <div className="mirror-avatar">
            <img src={mirrorAvatar} alt="Героиня в волшебном зеркале с мангой и чёрной кошкой" />
            <div className="mirror-avatar-light" />
          </div>
          <motion.p key={compliment} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{compliment}</motion.p>
        </motion.div>
        <div className="sliders">
          {labels.map((label, index) => (
            <label key={label}>
              <span>{label}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={values[index]}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = Number(event.target.value);
                  setValues(next);
                }}
              />
            </label>
          ))}
          <ActionButton
            onClick={() => {
              addCompliment(compliment);
              unlockAchievement("mirror-truth");
              playSound("scene-complete", .6);
              finish(1);
            }}
          >
            да, это тоже я
          </ActionButton>
        </div>
      </div>
    </SceneShell>
  );
}

function DraftScene() {
  const finish = useGameStore((s) => s.finish);
  const setSkin = useGameStore((s) => s.setSkin);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const [selected, setSelected] = useState<number[]>([]);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [battleLog, setBattleLog] = useState("Выбери хотя бы двух героинь.");
  const enemy = data.enemies[(selected.length * 2 + 1) % data.enemies.length];
  const power = selected.reduce((sum, index) => sum + data.heroes[index].power, 0);
  const skin = data.skins[power % data.skins.length];
  const won = enemyHealth <= 0;
  const attack = () => {
    const damage = Math.max(22, Math.round(power * 0.38));
    setEnemyHealth((health) => Math.max(0, health - damage));
    playSound("battle-hit", .58);
    const hero = data.heroes[selected[Math.floor(Math.random() * selected.length)]];
    setBattleLog(`${hero.name}: ${hero.skill}. Минус вайб получает ${damage} урона.`);
  };

  return (
    <SceneShell eyebrow="02 · mood draft" title="Собери команду против минус вайба" variant="draft" backdrop={battleArt}>
      <div className="battle-status">
        <span>противник</span>
        <strong>{won ? "вайб восстановлен" : `${enemy} · ${enemyHealth}%`}</strong>
        <div className="power-bar enemy-bar"><motion.i animate={{ width: `${enemyHealth}%` }} /></div>
        <p className="battle-log">{battleLog}</p>
      </div>
      <div className="card-grid">
        {data.heroes.map((hero, index) => (
          <motion.button
            key={hero.name}
            className={`hero-card ${selected.includes(index) ? "selected" : ""}`}
            onClick={() => {
              if (enemyHealth < 100) return;
              playSound("card-select", .48);
              setSelected((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
            }}
            whileTap={{ scale: 0.97 }}
          >
            <img className={`hero-portrait hero-portrait-${index}`} src={heroPortraits[index]} alt="" />
            <div className="hero-card-copy">
              <b>{hero.icon}</b>
              <h3>{hero.name}</h3>
              <p>{hero.skill}</p>
              <small>сила настроения · {hero.power}</small>
            </div>
          </motion.button>
        ))}
      </div>
      {!won ? (
        <ActionButton onClick={attack} disabled={power < 60}>атаковать минус вайб</ActionButton>
      ) : (
        <motion.div className="reward-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <span>открыт mood-skin</span>
          <h2>{skin}</h2>
          <ActionButton onClick={() => { setSkin(skin); unlockAchievement("mood-carry"); playSound("scene-complete", .68); finish(2); }}>забрать настроение</ActionButton>
        </motion.div>
      )}
    </SceneShell>
  );
}

function MangaScene() {
  const finish = useGameStore((s) => s.finish);
  const setManga = useGameStore((s) => s.setManga);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const [choices, setChoices] = useState([0, 0, 0, 0]);
  const chapter = data.manga.map((panel, index) => panel[choices[index]]);

  return (
    <SceneShell eyebrow="03 · твоя манга" title="Собери главу, которую не хочется дропать" variant="manga" backdrop={mangaArt}>
      <div className="manga-grid">
        {data.manga.map((panel, index) => (
          <motion.button
            className={`manga-panel panel-${index + 1}`}
            key={index}
            onClick={() => {
              playSound("card-select", .35);
              setChoices((current) => current.map((choice, item) => item === index ? (choice + 1) % panel.length : choice));
            }}
            whileTap={{ rotate: index % 2 ? 1 : -1 }}
          >
            <img className="manga-panel-art" src={mangaPanels[index]} alt="" />
            <div className="manga-panel-shade" />
            <span>0{index + 1}</span>
            <p>{panel[choices[index]]}</p>
            <small>нажми, чтобы сменить кадр</small>
          </motion.button>
        ))}
      </div>
      <div className="chapter-cover" style={{ "--cover-art": `url(${mangaPanels[3]})` } as React.CSSProperties}>
        <div className="chapter-cover-image" />
        <motion.img
          className="easter-egg egg-figure"
          src={angelaFigure}
          alt=""
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <span>романтика · хаос · котики · сон · мемы</span>
        <h2>Глава 18: Девочка, из-за которой день стал красивее</h2>
        <p>Если бы ты была тайтлом, я бы не дропнул ни одной главы.</p>
      </div>
      <ActionButton onClick={() => { setManga(chapter); unlockAchievement("chapter-18"); playSound("scene-complete", .6); finish(3); }}>оставить этот сюжет каноном</ActionButton>
    </SceneShell>
  );
}

function CatScene() {
  const finish = useGameStore((s) => s.finish);
  const findCat = useGameStore((s) => s.findCat);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const [opened, setOpened] = useState<number[]>([]);
  const catIndex = 4;
  const found = opened.includes(catIndex);

  return (
    <SceneShell eyebrow="04 · ночные окна" title="Здесь никто никуда не торопится" variant="cat" backdrop={nightArt}>
      <p className="scene-lead">Можно просто заглядывать в светящиеся окна. В одном из них ночь смотрит в ответ.</p>
      <div className="house">
        <motion.img
          className="easter-egg egg-lantern"
          src={angelaLantern}
          alt=""
          animate={{ filter: ["brightness(.86)", "brightness(1.15)", "brightness(.86)"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {windowDioramas.slice(0, data.windowMoments.length).map((diorama, index) => (
          <motion.button
            key={data.windowMoments[index]}
            className={`window ${opened.includes(index) ? "lit" : ""}`}
            onClick={() => setOpened((current) => current.includes(index) ? current : [...current, index])}
            whileHover={{ scale: 1.03 }}
          >
            <img className="window-diorama" src={diorama} alt="" />
            {opened.includes(index) && <span>{index === catIndex ? "нашлась" : data.windowMoments[index]}</span>}
          </motion.button>
        ))}
      </div>
      {found && (
        <motion.div className="soft-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p>Ты умеешь замечать маленькие красивые вещи. Возможно, поэтому сама такая.</p>
          <ActionButton onClick={() => { findCat(); unlockAchievement("night-witness"); playSound("cat-purr", .5); finish(4); }}>пожелать кошке спокойной ночи</ActionButton>
        </motion.div>
      )}
    </SceneShell>
  );
}

function SchemeScene() {
  const finish = useGameStore((s) => s.finish);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const nodes = [
    { label: "недосып", icon: "☾", note: "энергия на нуле", x: 27, y: 18 },
    { label: "твимс", icon: "✦", note: "фоновые задачи", x: 73, y: 18 },
    { label: "сессия", icon: "⌁", note: "слишком много сразу", x: 88, y: 50 },
    { label: "усталость", icon: "◌", note: "нужна пауза", x: 70, y: 78 },
    { label: "тревога", icon: "◇", note: "ложная тревога", x: 30, y: 78 },
    { label: "плохие мысли", icon: "×", note: "доступ закрыт", x: 12, y: 50 },
  ];
  const [active, setActive] = useState<number[]>([]);
  const done = active.length === nodes.length;

  return (
    <SceneShell eyebrow="05 · схема, где всё сошлось" title="Хаос тоже можно подсветить" variant="scheme">
      <div className={`scheme scheme-circuit ${done ? "complete" : ""}`}>
        <div className="circuit-aurora" />
        <div className="circuit-orbit orbit-one" />
        <div className="circuit-orbit orbit-two" />
        <svg className="circuit-lines" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="circuitOff" x1="0" x2="1">
              <stop offset="0" stopColor="#7f6c96" stopOpacity=".08" />
              <stop offset=".5" stopColor="#e3b9ef" stopOpacity=".34" />
              <stop offset="1" stopColor="#7f6c96" stopOpacity=".08" />
            </linearGradient>
            <linearGradient id="circuitOn" x1="0" x2="1">
              <stop offset="0" stopColor="#79edff" />
              <stop offset=".5" stopColor="#ff9ed2" />
              <stop offset="1" stopColor="#ffe59b" />
            </linearGradient>
            <filter id="circuitGlow">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {nodes.map((node, index) => {
            const x = node.x * 10;
            const y = node.y * 5.6;
            const bendX = 500 + (x - 500) * .35;
            const bendY = 280 + (y - 280) * .12;
            return (
              <g key={node.label} className={active.includes(index) ? "path-active" : ""}>
                <path className="circuit-path-shadow" d={`M ${x} ${y} Q ${bendX} ${bendY} 500 280`} />
                <path className="circuit-path" d={`M ${x} ${y} Q ${bendX} ${bendY} 500 280`} />
              </g>
            );
          })}
          <circle className="circuit-center-ring" cx="500" cy="280" r="112" />
          <circle className="circuit-center-ring ring-inner" cx="500" cy="280" r="83" />
        </svg>
        <div className="scheme-core">
          <span className="core-kicker">{done ? "контур стабилен" : "контур заботы"}</span>
          <div className="scheme-relic-anchor">
            <motion.img className="scheme-relic" src={circuitRelic} alt="" animate={{ scale: done ? 1.1 : .88, opacity: done ? 1 : .78 }} />
          </div>
          <strong>{active.length}<small>/ {nodes.length}</small></strong>
          <span className="core-caption">{done ? "свет восстановлен" : "фрагментов соединено"}</span>
        </div>
        {nodes.map((node, index) => {
          const isActive = active.includes(index);
          return (
            <motion.button
              key={node.label}
              className={`circuit-node ${isActive ? "active" : ""}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => {
                playSound("circuit-connect", .4);
                setActive((current) => current.includes(index) ? current : [...current, index]);
              }}
            >
              <i>{isActive ? "✓" : node.icon}</i>
              <span><b>{node.label}</b><small>{isActive ? "нейтрализовано" : node.note}</small></span>
            </motion.button>
          );
        })}
        <div className="scheme-status">
          <span>{done ? "шум разобран на части и стал мягким светом" : "нажми на каждый сигнал, чтобы вернуть ему нормальную громкость"}</span>
          <i><b style={{ width: `${(active.length / nodes.length) * 100}%` }} /></i>
        </div>
      </div>
      <p className="scheme-hint">{done ? "Это не баг в тебе. Просто вокруг было слишком много шума, а теперь видно главное: ты здесь, и с тобой всё в порядке." : `Соединено ${active.length} из ${nodes.length}. Нажимай на узлы в любом порядке.`}</p>
      {done && <ActionButton onClick={() => { unlockAchievement("circuit-heart"); playSound("scene-complete", .6); finish(5); }}>оставить схему светиться</ActionButton>}
    </SceneShell>
  );
}

function RoomScene() {
  const finish = useGameStore((s) => s.finish);
  const unlockAchievement = useGameStore((s) => s.unlockAchievement);
  const actions = ["выключить шум", "убрать тревожные уведомления", "оставить чай рядом", "включить мягкий свет", "написать «спокойной ночи»", "укрыть одеялом, не нарушая границ"];
  const [done, setDone] = useState<number[]>([]);
  const ready = done.length === actions.length;

  return (
    <SceneShell eyebrow="06 · недотрога mode" title="Забота, которая не требует ответа" variant="room" backdrop={nightArt}>
      <div
        className={`room ${ready ? "settled" : ""} ${done.includes(0) ? "is-quiet" : ""} ${done.includes(3) ? "is-lit" : ""}`}
        style={{ backgroundImage: `url(${nightArt})` }}
      >
        <div className={`room-noise ${done.includes(0) ? "hidden" : ""}`}>шшш · дедлайн · шшш · надо ответить</div>
        <div className={`room-notifications ${done.includes(1) ? "hidden" : ""}`}><span>12 новых мыслей</span><span>срочно переживать?</span></div>
        <div className={`room-tea ${done.includes(2) ? "visible" : ""}`}>
          <span className="tea-steam"><i /><i /><i /></span>
          <img src={angelaTea} alt="" />
          <small>чай рядом</small>
        </div>
        <div className={`room-message ${done.includes(4) ? "visible" : ""}`}>
          <i>✦</i>
          <span>спокойной ночи.<br /><b>отвечать не обязательно.</b></span>
        </div>
        <img className={`room-blanket ${done.includes(5) ? "visible" : ""}`} src={cozyQuilt} alt="" />
        {ready && (
          <motion.div className="final-note" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span>тихий режим активирован</span>
            <p>Я не хочу быть шумом.<br />Я хочу быть местом, где тебе спокойно.<br />Где тебя не трогают, не требуют, не оценивают.<br />Где ты можешь быть сонной, хаосной, уставшей, смешной, недотрогой.<br />И всё равно самой красивой.</p>
            <ActionButton onClick={() => { unlockAchievement("soft-crown"); playSound("finale", .7); finish(6); }}>открыть комнату доказательств</ActionButton>
          </motion.div>
        )}
        <div className="care-list">
          {actions.map((action, index) => (
            <motion.button
              key={action}
              className={done.includes(index) ? "done" : ""}
              onClick={() => {
                if (!done.includes(index)) {
                  playSound("room-soften", .42);
                  if (index === 0) unlockAchievement("quiet-bell");
                  if (index === 2) unlockAchievement("tea-nearby");
                }
                setDone((current) => current.includes(index) ? current : [...current, index]);
              }}
              whileTap={{ scale: 0.98 }}
            >
              <i>{done.includes(index) ? "✓" : "+"}</i>{action}
            </motion.button>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function CriticalHeartbreak({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    setBackgroundDucked(true);
    stopAllSounds("cyberpunk-heart");
    const cyberpunk = window.setTimeout(() => playSound("cyberpunk-heart", 1), 360);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(cyberpunk);
      stopSound("cyberpunk-heart");
      setBackgroundDucked(false);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <motion.div
      className="critical-breach"
      role="dialog"
      aria-modal="true"
      aria-label="Critical error: you hack my heart"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="breach-flash" />
      <div className="breach-grid" />
      <div className="breach-cracks" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
      </div>
      <div className="critical-status">
        <span>ROMANCE_OS // KERNEL PANIC</span>
        <strong>CRITICAL ERROR</strong>
        <small>UNAUTHORIZED HEART ACCESS DETECTED</small>
      </div>
      <motion.div
        className="central-rift"
        initial={{ scale: .2, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 13, delay: .18 }}
      >
        <div className="rift-noise" />
        <div className="console-heart">
          <span className="heart-code heart-code-top">0x48 · 0x45 · 0x41 · 0x52 · 0x54</span>
          <div className="pixel-heart">
            <span>YOU HACK</span>
            <strong>MY HEART</strong>
          </div>
          <span className="heart-code heart-code-bottom">ACCESS GRANTED // FOREVER</span>
        </div>
      </motion.div>
      <div className="breach-log" aria-hidden="true">
        <span>&gt; firewall: bypassed</span>
        <span>&gt; pulse: unstable</span>
        <span>&gt; owner: самая красивая девочка</span>
        <span>&gt; recovery: impossible</span>
      </div>
      <button className="breach-close" onClick={onClose}>принять взлом сердца</button>
    </motion.div>,
    document.body,
  );
}

function EvidenceScene() {
  const { compliments, skin, manga, catFound, reset, achievements: unlockedAchievements } = useGameStore();
  const [breachOpen, setBreachOpen] = useState(false);
  return (
    <SceneShell eyebrow="финал · комната доказательств" title="Ничего не надо заслуживать" variant="evidence" backdrop={mangaArt}>
      <div className="evidence-grid">
        <article className="evidence-card">
          <span>из зеркала</span>
          <h3>{compliments[0] || "Ты красивая во всех своих режимах."}</h3>
        </article>
        <article className="evidence-card skin-evidence">
          <span>mood-skin</span>
          <h3>{skin || "Маленький хаос"}</h3>
        </article>
        <article className="evidence-card">
          <span>глава 18</span>
          <h3>{manga[3] || "Она просто есть. Кадр уже красивый."}</h3>
        </article>
        <article className="evidence-card cat-evidence">
          <span>{catFound ? "найдена" : "всё равно пришла"}</span>
          <div className="cat">● ᴗ ●</div>
        </article>
      </div>
      <motion.article className="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <motion.img
          className="easter-egg egg-musicbox"
          src={angelaMusicbox}
          alt=""
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p>Ты красивая не одним каким-то идеальным способом. У тебя их целая коллекция.</p>
        <p>Когда смеёшься. Когда сонная. Когда злишься. Когда рассказываешь про игру и сама не замечаешь, как загораются глаза. Когда молчишь. Когда устаёшь. Когда говоришь что-то странное. Когда просто остаёшься собой.</p>
        <p>Я собрал эту комнату, чтобы все эти версии никуда не терялись. Чтобы хотя бы здесь мир был внимательным, тихим и честным: он смотрит на тебя и понимает, что перед ним что-то очень редкое.</p>
      </motion.article>
      <section className="achievement-vault">
        <div className="vault-heading">
          <span>коллекция реликвий</span>
          <strong>{unlockedAchievements.length} / {achievements.length}</strong>
        </div>
        <div className="achievement-grid">
          {achievements.map((achievement) => {
            const unlocked = unlockedAchievements.includes(achievement.id);
            return (
              <article className={`achievement-card ${unlocked ? "unlocked" : "locked"}`} key={achievement.id}>
                <img src={achievement.icon} alt="" />
                <div>
                  <small>{unlocked ? achievement.rarity : "ещё скрыто"}</small>
                  <h3>{unlocked ? achievement.title : "Неизвестная реликвия"}</h3>
                  <p>{unlocked ? achievement.description : "Откроется, когда мир заметит ещё одну деталь."}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className="final-actions">
        <motion.button
          className="primary-button"
          onClick={() => setBreachOpen(true)}
          whileTap={{ scale: 0.97 }}
        >
          поделиться этой комнатой
        </motion.button>
        <button className="text-button" onClick={reset}>пройти ещё раз, сохранив улыбку</button>
      </div>
      <AnimatePresence>
        {breachOpen && <CriticalHeartbreak onClose={() => setBreachOpen(false)} />}
      </AnimatePresence>
    </SceneShell>
  );
}

const scenes = [StartScene, MirrorScene, DraftScene, MangaScene, CatScene, SchemeScene, RoomScene, EvidenceScene];

export default function App() {
  const scene = useGameStore((s) => s.scene);
  const completed = useGameStore((s) => s.completed);
  const setScene = useGameStore((s) => s.setScene);
  const CurrentScene = scenes[scene] || StartScene;
  const progress = useMemo(() => Math.round((completed.length / 7) * 100), [completed.length]);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [scene]);

  useEffect(() => {
    setAudioMuted(muted);
    localStorage.setItem("ona-sobytie-muted", String(muted));
  }, [muted]);

  useEffect(() => {
    const wakeAudio = () => {
      unlockAudio();
    };

    window.addEventListener("pointerdown", wakeAudio, { capture: true, once: true });
    window.addEventListener("keydown", wakeAudio, { capture: true, once: true });

    return () => {
      window.removeEventListener("pointerdown", wakeAudio, { capture: true });
      window.removeEventListener("keydown", wakeAudio, { capture: true });
    };
  }, []);

  return (
    <div className="app">
      {scene > 0 && (
        <header className="topbar">
          <button onClick={() => setScene(Math.max(0, scene - 1))} aria-label="Назад">←</button>
          <div>
            <span>{sceneNames[scene]}</span>
            <i><b style={{ width: `${progress}%` }} /></i>
          </div>
          <button className="sound-toggle" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Включить звук" : "Выключить звук"}>
            {muted ? "○" : "◉"}
          </button>
        </header>
      )}
      <AnimatePresence mode="wait">
        <CurrentScene key={scene} />
      </AnimatePresence>
      <AchievementToast />
    </div>
  );
}
