'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { ChannelCard } from '@/components/dashboard/ChannelCard';
import { FileUpload } from '@/components/ui/FileUpload';
import { BarChart3, TrendingUp, Users, Video } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const channels = useLiveQuery(() => db.channels.toArray());
  const stats = useLiveQuery(async () => {
    const totalChannels = await db.channels.count();
    const totalVideos = await db.videos.count();
    const watchedVideos = await db.watchHistory.count();
    const topVideo = await db.watchHistory.orderBy('watchCount').last();

    return { totalChannels, totalVideos, watchedVideos, topVideo };
  });

  if (!channels) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 font-medium">ようこそ。あなたのファン活動を振り返りましょう。</p>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">登録チャンネル</p>
            <p className="text-2xl font-bold">{stats?.totalChannels || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-2xl text-green-600">
            <Video size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">全動画数 (API同期)</p>
            <p className="text-2xl font-bold">{stats?.totalVideos || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">総視聴回数</p>
            <p className="text-2xl font-bold">{stats?.watchedVideos || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">最多再生</p>
            <p className="text-lg font-bold line-clamp-1">{stats?.topVideo?.title || '-'}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Channel List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">追跡中チャンネル</h2>
            <Link href="/settings" className="text-sm text-blue-600 font-semibold hover:underline">
              新しいチャンネルを登録
            </Link>
          </div>
          
          {channels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map(channel => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-12 text-center">
              <p className="text-gray-500 font-medium">まだチャンネルが追加されていません。</p>
              <p className="text-sm text-gray-400 mt-1">「設定」からYouTube API Keyを入力し、チャンネルIDで追加してください。</p>
            </div>
          )}
        </div>

        {/* Right: Sidebar Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">データ更新</h2>
          <FileUpload />
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
            <h3 className="font-bold text-lg mb-2">Google Takeoutとは?</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-4">
              Googleのサービスからあなたのデータをエクスポートする機能です。YouTubeの視聴履歴（watch-history.json）を取得してここにアップロードしてください。
            </p>
            <Link 
              href="https://takeout.google.com/settings/takeout" 
              target="_blank"
              className="inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Takeoutページを開く
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
