import { readConfigFile } from './utils';

export interface TimelineEventData {
  readonly month?: number;
  readonly day?: number;
  readonly title: string;
  readonly description?: string;
  readonly color?: string;
  readonly icon?: string | readonly string[];
}

export interface TimelineDataItem {
  readonly year: number;
  readonly events: readonly TimelineEventData[];
}

export type ParsedTimelineItem = TimelineDataItem;

export const getTimeline = async (): Promise<readonly ParsedTimelineItem[]> => {
  const timeline = (await readConfigFile(
    'timeline',
  )) as readonly TimelineDataItem[];

  return timeline;
};
