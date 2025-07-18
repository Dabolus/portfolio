declare module 'responsive-gamepad' {
  export interface InputSource {
    enable: () => void;
    disable: () => void;
    getState: () => unknown;
  }

  export const RESPONSIVE_GAMEPAD_INPUTS: {
    DPAD_UP: 'DPAD_UP';
    DPAD_RIGHT: 'DPAD_RIGHT';
    DPAD_DOWN: 'DPAD_DOWN';
    DPAD_LEFT: 'DPAD_LEFT';
    LEFT_ANALOG_HORIZONTAL_AXIS: 'LEFT_ANALOG_HORIZONTAL_AXIS';
    LEFT_ANALOG_VERTICAL_AXIS: 'LEFT_ANALOG_VERTICAL_AXIS';
    LEFT_ANALOG_UP: 'LEFT_ANALOG_UP';
    LEFT_ANALOG_RIGHT: 'LEFT_ANALOG_RIGHT';
    LEFT_ANALOG_DOWN: 'LEFT_ANALOG_DOWN';
    LEFT_ANALOG_LEFT: 'LEFT_ANALOG_LEFT';
    LEFT_ANALOG_PRESS: 'LEFT_ANALOG_PRESS';
    RIGHT_ANALOG_HORIZONTAL_AXIS: 'RIGHT_ANALOG_HORIZONTAL_AXIS';
    RIGHT_ANALOG_VERTICAL_AXIS: 'RIGHT_ANALOG_VERTICAL_AXIS';
    RIGHT_ANALOG_UP: 'RIGHT_ANALOG_UP';
    RIGHT_ANALOG_RIGHT: 'RIGHT_ANALOG_RIGHT';
    RIGHT_ANALOG_DOWN: 'RIGHT_ANALOG_DOWN';
    RIGHT_ANALOG_LEFT: 'RIGHT_ANALOG_LEFT';
    RIGHT_ANALOG_PRESS: 'RIGHT_ANALOG_PRESS';
    A: 'A';
    B: 'B';
    X: 'X';
    Y: 'Y';
    LEFT_TRIGGER: 'LEFT_TRIGGER';
    LEFT_BUMPER: 'LEFT_BUMPER';
    RIGHT_TRIGGER: 'RIGHT_TRIGGER';
    RIGHT_BUMPER: 'RIGHT_BUMPER';
    SELECT: 'SELECT';
    START: 'START';
    SPECIAL: 'SPECIAL';
  };

  export type ResponsiveGamepadInput =
    (typeof RESPONSIVE_GAMEPAD_INPUTS)[keyof typeof RESPONSIVE_GAMEPAD_INPUTS];

  export interface KeyboardInputSource extends InputSource {}

  export interface GamepadInputSource extends InputSource {}

  export interface TouchInputInputSource extends InputSource {
    addButtonInput: (
      input: HTMLElement,
      button: ResponsiveGamepadInput,
    ) => void;
  }

  export interface ResponsiveGamepad {
    clearInputMap: () => void;
    getVersion: () => string;
    enable: () => void;
    disable: () => void;
    isEnabled: () => boolean;
    addPlugin: (pluginObject: unknown) => void;
    getState: () => unknown;
    onInputsChange: (
      codeOrCodes: string | string[],
      callback: (state: unknown) => void,
    ) => () => void;
    Keyboard: KeyboardInputSource;
    Gamepad: GamepadInputSource;
    TouchInput: TouchInputInputSource;
    RESPONSIVE_GAMEPAD_INPUTS: typeof RESPONSIVE_GAMEPAD_INPUTS;
  }

  export const ResponsiveGamepad: ResponsiveGamepad;
}

declare module 'wasmboy/dist/wasmboy.wasm.esm.js' {
  import type { ResponsiveGamepad } from 'responsive-gamepad';

  export interface Config {
    audioBatchProcessing?: boolean;
    timersBatchProcessing?: boolean;
    audioAccumulateSamples?: boolean;
    graphicsBatchProcessing?: boolean;
    graphicsDisableScanlineRendering?: boolean;
    tileRendering?: boolean;
    tileCaching?: boolean;
    isGbcEnabled?: boolean;
    updateGraphicsCallback?: (imageDataArray: Uint8ClampedArray) => void;
  }

  export interface Plugin {
    name: string;
    graphics?: (rgbaArray: Uint8ClampedArray) => void;
    audio?: (
      audioContext: AudioContext,
      headAudioNode: AudioBufferSourceNode,
      channelId: 'master' | 'channel1' | 'channel2' | 'channel3' | 'channel4',
    ) => AudioNode;
    saveState?: (saveStateObject: {
      wasmboyMemory: {
        wasmBoyInternalState: unknown[];
        wasmBoyPaletteMemory: unknown[];
        gameBoyMemory: unknown[];
        cartridgeRam: unknown[];
      };
      date: Date;
      isAuto: boolean;
    }) => void;
    canvas?: (
      canvasElement: HTMLCanvasElement,
      canvasContext: CanvasRenderingContext2D,
      canvasImageData: ImageData,
    ) => void;
    breakpoint?: () => void;
    ready?: () => void;
    play?: () => void;
    pause?: () => void;
    loadedAndStarted?: () => void;
  }

  export interface WasmBoy {
    config: (options: Config, canvas: HTMLCanvasElement) => Promise<void>;
    getCoreType: () => unknown;
    getConfig: () => Config;
    setCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
    getCanvas: () => HTMLCanvasElement | undefined;
    addBootROM: (
      type: unknown,
      file: unknown,
      fetchHeaders: unknown,
      additionalInfo: unknown,
    ) => Promise<void>;
    getBootROMs: () => Promise<unknown[]>;
    loadROM: (
      file: string | File | Uint8Array | ArrayBuffer,
      fetchOptions?: {
        headers?: Record<string, string>;
        fileName?: string;
      },
    ) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    reset: (options?: Config) => Promise<void>;
    addPlugin: (plugin: Plugin) => void;
    isPlaying: () => boolean;
    isPaused: () => boolean;
    isReady: () => boolean;
    isLoadedAndStarted: () => boolean;
    getVersion: () => string;
    getSavedMemory: () => Promise<unknown[]>;
    saveLoadedCartridge: (additionalInfo?: unknown) => Promise<unknown>;
    deleteSavedCartridge: (cartridge: unknown) => Promise<unknown>;
    saveState: () => Promise<unknown>;
    getSaveStates: () => Promise<unknown[]>;
    loadState: (saveState: unknown) => Promise<void>;
    deleteState: (saveState: unknown) => Promise<void>;
    getFPS: () => number;
    setSpeed: (speed: number) => Promise<void>;
    isGBC: () => Promise<boolean>;
    ResponsiveGamepad: ResponsiveGamepad;
    enableDefaultJoypad: () => void;
    disableDefaultJoypad: () => void;
    setJoypadState: (controllerState: unknown) => void;
    resumeAudioContext: () => void;
  }

  export const WasmBoy: WasmBoy;
}
