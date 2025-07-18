import { WasmBoy } from 'wasmboy/dist/wasmboy.wasm.esm.js';

const container = document.querySelector<HTMLDivElement>('#container');
const gameCanvas = container.querySelector<HTMLCanvasElement>('#game');

await WasmBoy.config(
  {
    audioBatchProcessing: true,
    timersBatchProcessing: true,
    audioAccumulateSamples: true,
    graphicsBatchProcessing: true,
    graphicsDisableScanlineRendering: true,
    tileRendering: true,
    tileCaching: true,
    isGbcEnabled: true,
  },
  gameCanvas,
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

const romBytesPromise = fetch('../roms/portfolio.gbc')
  .then((res) => res.arrayBuffer())
  .then((arrayBuffer) => new Uint8Array(arrayBuffer));

const switchOnOff = async () => {
  if (WasmBoy.isPlaying()) {
    await WasmBoy.reset();
    container.classList.remove('on');
  } else {
    await WasmBoy.loadROM(await romBytesPromise, { fileName: 'portfolio.gbc' });
    await WasmBoy.play();
    container.classList.add('on');
  }
};

document.querySelector('#on-off').addEventListener('click', switchOnOff);
document.addEventListener(
  'keydown',
  (event) => event.key.toLowerCase() === 'p' && switchOnOff(),
);

window.addEventListener('blur', () => WasmBoy.isPlaying() && WasmBoy.pause());
window.addEventListener('focus', () => WasmBoy.play());
