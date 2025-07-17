import { WasmBoy } from 'wasmboy/dist/wasmboy.wasm.esm.js';

const canvas = document.querySelector('canvas');

await WasmBoy.config(
  {
    audioBatchProcessing: true,
    timersBatchProcessing: true,
    audioAccumulateSamples: true,
    graphicsBatchProcessing: true,
    graphicsDisableScanlineRendering: true,
    tileRendering: true,
    tileCaching: true,
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

await WasmBoy.loadROM('../roms/portfolio.gbc');
await WasmBoy.play();

window.addEventListener('blur', () => WasmBoy.pause());
window.addEventListener('focus', () => WasmBoy.play());
