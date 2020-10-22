import { createHash } from 'crypto';

const hashCache = new Map<string, string>();

export const hash = (content: string): string => {
  if (!hashCache.has(content)) {
    hashCache.set(
      content,
      createHash('sha256').update(content).digest('hex').substring(0, 8),
    );
  }

  return hashCache.get(content);
};
