'use client';

import React from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Channel } from '@/lib/db';
import { ChevronRight, Play } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const stats = useLiveQuery(async () => {
    // Unique watched videos for this channel
    const watched = await db.watchHistory
      .where('channelName')
      .equals(channel.name)
      .toArray();
      
    // Count manual checks for this channel
    // Note: This matches videos belonging to this channel
    const channelVideos = await db.videos
      .where('channelId')
      .equals(channel.id)
      .toArray();
    
    const videoIds = new Set(channelVideos.map(v => v.id));
    const manualChecks = await db.manualChecks
      .where('videoId')
      .anyOf([...videoIds])
      .filter(m => m.checked)
      .count();

    const uniqueWatched = watched.filter(w => videoIds.has(w.videoId)).length;
    const progressCount = Math.min(channel.totalVideos, uniqueWatched + manualChecks);
    const percentage = channel.totalVideos > 0 
      ? Math.round((progressCount / channel.totalVideos) * 100) 
      : 0;

    return { percentage, progressCount };
  }, [channel]);

  if (!stats) return null;

  return (
    <Link 
      href={`/channel/${channel.id}`}
      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden flex flex-col items-center text-center"
    >
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform">
          <img src={channel.thumbnail} alt={channel.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all">
          <Play size={14} fill="currentColor" />
        </div>
      </div>

      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{channel.name}</h3>
      <p className="text-sm text-gray-500 mt-1">{channel.totalVideos} videos</p>

      {/* Progress Bar */}
      <div className="w-full mt-6 space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-gray-400">進捗度</span>
          <span className="text-blue-600">{stats.percentage}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full progress-gradient transition-all duration-1000" 
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 font-medium">
          {stats.progressCount} / {channel.totalVideos} 視聴済み
        </p>
      </div>

      <div className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-200 transition-colors">
        <ChevronRight size={20} />
      </div>
    </Link>
  );
}
