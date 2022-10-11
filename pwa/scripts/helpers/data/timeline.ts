import { timeline, TimelineItem } from '@dabolus/portfolio-data';

export type ParsedTimelineItem = TimelineItem;

export const getTimeline = async (): Promise<readonly ParsedTimelineItem[]> =>
  timeline;
