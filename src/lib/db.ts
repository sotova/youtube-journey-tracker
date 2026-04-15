import Dexie, { type Table } from 'dexie';

export interface Channel {
  id: string; // channelId
  name: string;
  thumbnail: string;
  totalVideos: number;
  lastUpdated: number;
}

export interface Video {
  id: string; // videoId
  channelId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

export interface WatchHistory {
  videoId: string;
  watchCount: number;
  lastWatched: number;
  title: string;
  channelName: string;
}

export interface ManualCheck {
  videoId: string;
  checked: boolean;
}

export interface Settings {
  key: string;
  value: string;
}

export class YoutubeDatabase extends Dexie {
  channels!: Table<Channel>;
  videos!: Table<Video>;
  watchHistory!: Table<WatchHistory>;
  manualChecks!: Table<ManualCheck>;
  settings!: Table<Settings>;

  constructor() {
    super('YoutubeJourneyDB');
    this.version(2).stores({
      channels: 'id, name',
      videos: 'id, channelId, publishedAt',
      watchHistory: 'videoId, channelName, watchCount',
      manualChecks: 'videoId',
      settings: 'key',
    });
  }
}

export const db = new YoutubeDatabase();
