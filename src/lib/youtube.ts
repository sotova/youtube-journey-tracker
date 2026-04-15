import { db } from './db';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

async function getApiKey() {
  const setting = await db.settings.get('YOUTUBE_API_KEY');
  return setting?.value;
}

export async function fetchChannelInfo(channelId: string) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('YouTube API Key not found in settings');

  const url = `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.items?.length) throw new Error('Channel not found');

  const item = data.items[0];
  return {
    id: channelId,
    name: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    totalVideos: parseInt(item.statistics.videoCount, 10),
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

export async function fetchAllVideos(playlistId: string) {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('YouTube API Key not found in settings');

  let videos: any[] = [];
  let nextPageToken = '';

  do {
    const url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    videos = [
      ...videos,
      ...data.items.map((item: any) => ({
        id: item.contentDetails.videoId,
        channelId: item.snippet.channelId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.contentDetails.videoPublishedAt,
      })),
    ];

    nextPageToken = data.nextPageToken || '';
  } while (nextPageToken);

  return videos;
}

export async function syncChannel(channelId: string) {
  const info = await fetchChannelInfo(channelId);
  const videos = await fetchAllVideos(info.uploadsPlaylistId);

  await db.transaction('rw', db.channels, db.videos, async () => {
    await db.channels.put({
      id: info.id,
      name: info.name,
      thumbnail: info.thumbnail,
      totalVideos: info.totalVideos,
      lastUpdated: Date.now(),
    });

    for (const video of videos) {
      await db.videos.put(video);
    }
  });
}
