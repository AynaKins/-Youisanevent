import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { GlowScene } from "../game/GlowScene";

export function GlowCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current,
      transparent: true,
      width: host.current.clientWidth,
      height: host.current.clientHeight,
      scene: GlowScene,
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true },
    });
    return () => game.destroy(true);
  }, []);

  return <div ref={host} className="glow-canvas" aria-hidden="true" />;
}
