import { db } from './db';

interface TakeoutEntry {
  title: string;
  titleUrl?: string;
  subtitles?: Array<{ name: string; url: string }>;
  time: string;
}

export async function parseWatchHistory(jsonData: any) {
  if (!Array.isArray(jsonData)) {
    throw new Error('Invalid JSON format: Expected an array');
  }

  const historyEntries: TakeoutEntry[] = jsonData;
  const videoStats: Record<string, { count: number; lastWatched: number; title: string; channelName: string }> = {};
  const seenEvents = new Set<string>();

  for (const entry of historyEntries) {
    if (!entry.titleUrl) continue;
    
    const url = new URL(entry.titleUrl);
    const videoId = url.searchParams.get('v');
    if (!videoId) continue;

    const timeStr = entry.time;
    const eventKey = `${videoId}-${timeStr}`;
    if (seenEvents.has(eventKey)) continue;
    seenEvents.add(eventKey);

    const watchedAt = new Date(timeStr).getTime();
    const title = entry.title.replace(/^Watched /, '');
    const channelName = entry.subtitles?.[0]?.name || 'Unknown Channel';

    if (!videoStats[videoId]) {
      videoStats[videoId] = {
        count: 0,
        lastWatched: watchedAt,
        title,
        channelName,
      };
    }

    videoStats[videoId].count++;
    if (watchedAt > videoStats[videoId].lastWatched) {
      videoStats[videoId].lastWatched = watchedAt;
    }
  }

  // Update DB
  await db.transaction('rw', db.watchHistory, async () => {
    for (const [videoId, stats] of Object.entries(videoStats)) {
      const existing = await db.watchHistory.get(videoId);
      if (existing) {
        await db.watchHistory.update(videoId, {
          watchCount: existing.watchCount + stats.count,
          lastWatched: Math.max(existing.lastWatched, stats.lastWatched),
        });
      } else {
        await db.watchHistory.add({
          videoId,
          watchCount: stats.count,
          lastWatched: stats.lastWatched,
          title: stats.title,
          channelName: stats.channelName,
        });
      }
    }
  });
}
