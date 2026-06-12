import Phaser from "phaser";

export class GlowScene extends Phaser.Scene {
  private light?: Phaser.GameObjects.Graphics;
  private motes: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super("GlowScene");
  }

  create() {
    this.light = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    for (let i = 0; i < 32; i += 1) {
      const mote = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(0, this.scale.height),
        Phaser.Math.Between(1, 3),
        0xffd7ef,
        Phaser.Math.FloatBetween(0.12, 0.45),
      );
      this.motes.push(mote);
      this.tweens.add({
        targets: mote,
        y: mote.y - Phaser.Math.Between(30, 90),
        x: mote.x + Phaser.Math.Between(-25, 25),
        alpha: 0,
        duration: Phaser.Math.Between(2400, 5200),
        repeat: -1,
        yoyo: true,
      });
    }
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.paintLight(pointer.x, pointer.y));
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.paintLight(pointer.x, pointer.y));
    this.paintLight(this.scale.width * 0.5, this.scale.height * 0.55);
  }

  private paintLight(x: number, y: number) {
    this.light?.clear();
    for (let radius = 190; radius > 10; radius -= 14) {
      this.light?.fillStyle(0xffd68e, 0.005 + (190 - radius) / 17000);
      this.light?.fillCircle(x, y, radius);
    }
  }
}
