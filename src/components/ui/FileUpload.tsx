'use client';

import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle2, Loader2 } from 'lucide-react';
import { parseWatchHistory } from '@/lib/parser';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('JSONファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      await parseWatchHistory(jsonData);
      setIsSuccess(true);
      // Optional: window.location.reload() or refresh state
    } catch (err: any) {
      console.error(err);
      setError('解析に失敗しました: ' + (err.message || '不明なエラー'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors group">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
          {isUploading ? <Loader2 size={32} className="animate-spin" /> : <FileJson size={32} />}
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">watch-history.json をアップロード</p>
          <p className="text-gray-500 text-sm mt-1">Google Takeoutから取得したJSONファイルを選択してください</p>
        </div>
        
        <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95">
          ファイルを選択
          <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
        </label>

        {isSuccess && (
          <div className="flex items-center gap-2 text-green-600 font-medium animate-in fade-in transition-all">
            <CheckCircle2 size={18} />
            <span>解析が完了しました！</span>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
