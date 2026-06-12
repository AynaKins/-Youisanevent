import { mkdirSync, writeFileSync } from "node:fs";

const sampleRate = 44100;
const outDir = new URL("../src/assets/audio/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const cues = {
  "ui-click": [[660, 0, .055, .18], [990, .025, .04, .1]],
  "card-select": [[330, 0, .08, .18], [660, .035, .1, .16]],
  "battle-hit": [[130, 0, .12, .3], [90, .04, .16, .22], [520, 0, .05, .08]],
  "achievement-unlock": [[523.25, 0, .18, .18], [659.25, .09, .24, .2], [783.99, .18, .34, .22], [1046.5, .3, .45, .16]],
  "scene-complete": [[392, 0, .22, .15], [523.25, .12, .3, .18], [659.25, .24, .42, .16]],
  "cat-purr": [[72, 0, .8, .13], [76, 0, .8, .09], [144, .05, .75, .04]],
  "circuit-connect": [[240, 0, .09, .12], [480, .035, .13, .14], [960, .08, .18, .08]],
  "room-soften": [[220, 0, .45, .08], [329.63, .08, .5, .08], [440, .15, .55, .07]],
  "finale": [[261.63, 0, .5, .12], [329.63, .12, .55, .12], [392, .24, .65, .12], [523.25, .38, .85, .13]],
};

function makeWav(notes) {
  const duration = Math.max(...notes.map((note) => note[1] + note[2])) + .08;
  const frames = Math.ceil(duration * sampleRate);
  const pcm = Buffer.alloc(frames * 2);
  for (let frame = 0; frame < frames; frame += 1) {
    const time = frame / sampleRate;
    let value = 0;
    for (const [frequency, start, length, gain] of notes) {
      const local = time - start;
      if (local < 0 || local > length) continue;
      const attack = Math.min(1, local / .012);
      const release = Math.pow(Math.max(0, 1 - local / length), 2.2);
      value += Math.sin(Math.PI * 2 * frequency * local) * attack * release * gain;
    }
    pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(value * 32767))), frame * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

for (const [name, notes] of Object.entries(cues)) {
  writeFileSync(new URL(`${name}.wav`, outDir), makeWav(notes));
}
