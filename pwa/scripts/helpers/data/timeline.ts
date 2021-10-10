import { readConfigFile } from './utils.js';

export interface TimelineEventData {
  readonly month?: number;
  readonly day?: number;
  readonly title: string;
  readonly description?: string;
  readonly icon?: {
    readonly color: string;
    readonly type?: 'fill' | 'stroke';
    readonly path?: string | readonly string[];
  };
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
