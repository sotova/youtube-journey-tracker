'use client';

import React from 'react';
import { db, type Video } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle, Circle, Play, ExternalLink, Eye } from 'lucide-react';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const isWatched = useLiveQuery(async () => {
    const history = await db.watchHistory.get(video.id);
    const manual = await db.manualChecks.get(video.id);
    return !!(history || (manual && manual.checked));
  }, [video.id]);

  const watchCount = useLiveQuery(async () => {
    const history = await db.watchHistory.get(video.id);
    return history?.watchCount || 0;
  }, [video.id]);

  const toggleManualCheck = async () => {
    const current = await db.manualChecks.get(video.id);
    await db.manualChecks.put({
      videoId: video.id,
      checked: !current?.checked
    });
  };

  return (
    <div className={`group relative flex flex-col bg-white rounded-3xl border transition-all overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 ${isWatched ? 'border-green-100' : 'border-gray-100 hover:border-blue-200'}`}>
      
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        
        {/* Overlay Action */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a 
            href={`https://www.youtube.com/watch?v=${video.id}`} 
            target="_blank" 
            className="bg-white text-gray-900 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <Play size={24} fill="currentColor" />
          </a>
        </div>

        {/* Status Badge */}
        {isWatched && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg shadow-green-500/30">
            <CheckCircle size={12} />
            Watched
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight text-sm">
            {video.title}
          </h4>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 font-medium">
              {new Date(video.publishedAt).toLocaleDateString()}
            </span>
            {(watchCount || 0) > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                <Eye size={10} />
                {watchCount} Views
              </div>
            )}
          </div>

          <button 
            onClick={toggleManualCheck}
            className={`p-2 rounded-xl transition-all ${
              isWatched 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-50 text-gray-300 hover:bg-blue-50 hover:text-blue-500'
            }`}
          >
            {isWatched ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
        </div>
      </div>
      
      <a 
        href={`https://www.youtube.com/watch?v=${video.id}`} 
        target="_blank"
        className="absolute bottom-4 left-4 opacity-0 pointer-events-none"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
