'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { syncChannel } from '@/lib/youtube';
import { VideoCard } from '@/components/video/VideoCard';
import { 
  ArrowLeft, 
  RotateCw, 
  Search, 
  Trophy, 
  BarChart2, 
  Sparkles,
  ChevronDown,
  Circle,
  Play
} from 'lucide-react';

export default function ChannelDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [visibleCount, setVisibleCount] = useState(50);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const channel = useLiveQuery(() => db.channels.get(id as string), [id]);
  const allVideos = useLiveQuery(() => 
    db.videos.where('channelId').equals(id as string).reverse().sortBy('publishedAt'),
    [id]
  );
  
  const stats = useLiveQuery(async () => {
    if (!id) return null;
    const videos = await db.videos.where('channelId').equals(id as string).toArray();
    const videoIds = new Set(videos.map(v => v.id));
    
    const watchedHistory = await db.watchHistory.where('videoId').anyOf([...videoIds]).toArray();
    const manualChecks = await db.manualChecks.where('videoId').anyOf([...videoIds]).filter(m => m.checked).toArray();
    
    const watchedIds = new Set([
      ...watchedHistory.map(h => h.videoId),
      ...manualChecks.map(m => m.videoId)
    ]);

    const totalWatchCount = watchedHistory.reduce((acc, curr) => acc + curr.watchCount, 0);
    const mostWatched = watchedHistory.sort((a, b) => b.watchCount - a.watchCount)[0];

    return {
      watchedCount: watchedIds.size,
      totalCount: videos.length,
      totalWatchCount,
      mostWatched,
      unwatchedCount: Math.max(0, videos.length - watchedIds.size),
      watchedIds
    };
  }, [id, allVideos]);

  // Handle Recommendations (Randomized once per load/refresh)
  useEffect(() => {
    if (allVideos && stats) {
      const unwatched = allVideos.filter(v => !stats.watchedIds.has(v.id));
      const shuffled = [...unwatched].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 10));
    }
  }, [allVideos === undefined, stats === undefined]); // Trigger when data first loads

  const filteredVideos = useMemo(() => {
    if (!allVideos || !stats) return [];
    return allVideos.filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isWatched = stats.watchedIds.has(video.id);
      
      if (filter === 'watched') return matchesSearch && isWatched;
      if (filter === 'unwatched') return matchesSearch && !isWatched;
      return matchesSearch;
    });
  }, [allVideos, searchQuery, filter, stats]);

  const displayedVideos = useMemo(() => {
    return filteredVideos.slice(0, visibleCount);
  }, [filteredVideos, visibleCount]);

  const handleSync = async () => {
    if (!id) return;
    setIsSyncing(true);
    try {
      await syncChannel(id as string);
    } catch (err) {
      alert('同期に失敗しました: ' + err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!channel) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 shadow-sm transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <img src={channel.thumbnail} alt="" className="w-16 h-16 rounded-2xl shadow-lg object-cover" />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{channel.name}</h1>
              <p className="text-gray-500 font-medium">{channel.totalVideos} videos</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-white border border-gray-100 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 group active:scale-95"
        >
          <RotateCw size={20} className={`text-blue-500 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          動画リストを再取得
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">進捗率</span>
            <Trophy size={20} className="text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-600">
            {stats ? Math.round((stats.watchedCount / (stats.totalCount || 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-blue-400 font-bold mt-1">
            {stats?.watchedCount} / {stats?.totalCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">総再生数</span>
            <BarChart2 size={20} className="text-purple-400" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.totalWatchCount || 0}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">累積再生回数</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">未視聴</span>
            <Circle size={18} className="text-orange-400" />
          </div>
          <p className="text-3xl font-black text-gray-900">{stats?.unwatchedCount || 0}</p>
          <p className="text-xs text-gray-400 font-medium mt-1">残り動画数</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">最多再生</span>
            <Sparkles size={20} className="text-yellow-400" />
          </div>
          <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
            {stats?.mostWatched?.title || 'なし'}
          </p>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
            {stats?.mostWatched?.watchCount || 0} VIEWS
          </p>
        </div>
      </div>

      {/* Recommendations Section (Promoted to Main Column) */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Sparkles className="text-yellow-500" />
          <h2>未視聴のおすすめ10選</h2>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {recommendations.map(video => (
              <a 
                key={video.id}
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                className="group bg-white p-2 rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-2">
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} className="text-white" fill="currentColor" />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight px-1">
                  {video.title}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-green-50 text-green-700 p-8 rounded-3xl text-center font-bold">
            🎉 すべての動画を視聴完了しました！
          </div>
        )}
      </section>

      <hr className="border-gray-100" />

      {/* Video Library Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <h2 className="text-2xl font-extrabold text-gray-900">動画ライブラリ</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group flex-1 sm:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="タイトルで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 p-3 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {['all', 'unwatched', 'watched'].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f as any); setVisibleCount(50); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    filter === f 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f === 'all' ? 'すべて' : f === 'watched' ? '視聴済み' : '未視聴'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        {displayedVideos.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400 font-medium">
            該当する動画は見つかりませんでした。
          </div>
        )}

        {displayedVideos.length < filteredVideos.length && (
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setVisibleCount(prev => prev + 50)}
              className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
            >
              <ChevronDown size={20} />
              さらに表示 ({filteredVideos.length - displayedVideos.length}件を読み込む)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
