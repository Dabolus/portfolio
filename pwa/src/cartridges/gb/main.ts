import { WasmBoy } from 'wasmboy/dist/wasmboy.wasm.esm.js';

const canvas = document.querySelector('canvas');

const colorsMap = [
  [42, 69, 59],
  [54, 93, 72],
  [87, 124, 68],
  [127, 134, 15],
];

await WasmBoy.config(
  {
    audioBatchProcessing: true,
    timersBatchProcessing: true,
    audioAccumulateSamples: true,
    graphicsBatchProcessing: true,
    graphicsDisableScanlineRendering: true,
    tileRendering: true,
    tileCaching: true,
    updateGraphicsCallback: (imageDataArray) => {
      for (let i = 0; i < imageDataArray.length; i += 4) {
        const avg =
          (imageDataArray[i] + imageDataArray[i + 1] + imageDataArray[i + 2]) /
          3;
        const colorIndex = Math.floor(avg / 64);
        const [r, g, b] = colorsMap[colorIndex];
        imageDataArray[i] = r;
        imageDataArray[i + 1] = g;
        imageDataArray[i + 2] = b;
      }
    },
  },
  canvas,
);

(
  [
    ['dpad-up', 'DPAD_UP'],
    ['dpad-right', 'DPAD_RIGHT'],
    ['dpad-down', 'DPAD_DOWN'],
    ['dpad-left', 'DPAD_LEFT'],
    ['btn-a', 'A'],
    ['btn-b', 'B'],
    ['btn-start', 'START'],
    ['btn-select', 'SELECT'],
  ] satisfies [
    string,
    keyof typeof WasmBoy.ResponsiveGamepad.RESPONSIVE_GAMEPAD_INPUTS,
  ][]
).forEach(([element, button]) =>
  WasmBoy.ResponsiveGamepad.TouchInput.addButtonInput(
    document.querySelector(`#${element}`),
    WasmBoy.ResponsiveGamepad.RESPONSIVE_GAMEPAD_INPUTS[button],
  ),
);

await WasmBoy.loadROM('../roms/portfolio.gb');
await WasmBoy.play();

window.addEventListener('blur', () => WasmBoy.pause());
window.addEventListener('focus', () => WasmBoy.play());
