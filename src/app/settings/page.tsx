'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { syncChannel } from '@/lib/youtube';
import { Key, Plus, RefreshCw, Trash2, Info } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const channels = useLiveQuery(() => db.channels.toArray());

  useEffect(() => {
    db.settings.get('YOUTUBE_API_KEY').then(s => s && setApiKey(s.value));
  }, []);

  const saveApiKey = async () => {
    await db.settings.put({ key: 'YOUTUBE_API_KEY', value: apiKey });
    setMessage({ text: 'APIキーを保存しました。', type: 'success' });
  };

  const addChannel = async () => {
    if (!channelId) return;
    setIsSyncing(true);
    setMessage(null);
    try {
      await syncChannel(channelId);
      setMessage({ text: 'チャンネルを追加しました。', type: 'success' });
      setChannelId('');
    } catch (err: any) {
      setMessage({ text: '追加に失敗しました: ' + err.message, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteChannel = async (id: string) => {
    if (!confirm('このチャンネルのデータを削除しますか？')) return;
    await db.transaction('rw', db.channels, db.videos, async () => {
      await db.channels.delete(id);
      await db.videos.where('channelId').equals(id).delete();
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-2">アプリケーションの設定とデータ管理を行います。</p>
      </header>

      {/* API Key Section */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <Key className="text-blue-600" />
          <h2>YouTube Data API v3 設定</h2>
        </div>
        
        <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-4 text-blue-800 text-sm leading-relaxed">
          <Info className="shrink-0 text-blue-500" />
          <p>
            動画リストを取得するためにYouTube APIキーが必要です。
            Google Cloud Consoleでプロジェクトを作成し、「YouTube Data API v3」を有効化してキーを取得してください。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="APIキーを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
          />
          <button 
            onClick={saveApiKey}
            className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            保存
          </button>
        </div>
      </section>

      {/* Channel Management */}
      <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <Plus className="text-green-600" />
          <h2>チャンネル登録</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="チャンネルID (例: UCxxxxxxxxxxxx)"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
          />
          <button 
            onClick={addChannel}
            disabled={isSyncing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : "追加・同期"}
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">登録済みチャンネル</h3>
          <div className="space-y-3">
            {channels?.map(channel => (
              <div key={channel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                <div className="flex items-center gap-4">
                  <img src={channel.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-gray-900">{channel.name}</p>
                    <p className="text-xs text-gray-500">{channel.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteChannel(channel.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {!channels?.length && <p className="text-gray-400 text-sm">登録されているチャンネルはありません。</p>}
          </div>
        </div>
      </section>

      {/* Manual Data Instructions */}
      <section className="bg-gray-900 rounded-3xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">データ・プライバシーについて</h2>
        <div className="space-y-4 text-gray-400 leading-relaxed">
          <p>
            本アプリはIndexedDB（ブラウザ内データベース）を使用しており、あなたの視聴履歴やAPIキーはすべて作成したブラウザ内にのみ保存されます。
            サーバーにデータが送信されることはありません。
          </p>
          <p>
            ブラウザのキャッシュを削除すると、IndexedDB内のデータも失われる可能性があるためご注意ください。
          </p>
        </div>
      </section>
    </div>
  );
}
