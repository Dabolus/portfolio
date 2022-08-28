import { readConfigFile } from './utils.js';

export interface TimeMachineDataTravel {
  readonly href: string;
  readonly year: number;
  readonly name: string;
  readonly description: string;
}

export type ParsedTimeMachineTravel = TimeMachineDataTravel;

export const getTimeMachineTravels = async (): Promise<
  readonly ParsedTimeMachineTravel[]
> => {
  const timeMachine = (await readConfigFile(
    'timeMachine',
  )) as readonly ParsedTimeMachineTravel[];

  return timeMachine;
};
