declare module 'primitive' {
  export interface Model {
    toSVG(): string;
  }

  export default function (opts: {
    input: string;
    output?: string;
    numSteps?: number;
    minEnergy?: number;
    shapeAlpha?: number;
    shapeType?:
      | 'triangle'
      | 'ellipse'
      | 'rotated-ellipse'
      | 'rectangle'
      | 'rotated-rectangle'
      | 'random';
    numCandidates?: number;
    numCandidateShapes?: number;
    numCandidateMutations?: number;
    numCandidateExtras?: number;
    onStep?: (model: Model, step: number) => Promise<void>;
    log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  }): Promise<Model>;
}

declare module 'mini-svg-data-uri' {
  export default function (svg: string): string;
}
