# YouTube Journey Tracker 🚀

YouTubeの視聴履歴を解析し、チャンネルごとの進捗状況を可視化するWebベースのトラッカーツールです。
ファン活動を数値化し、まだ見ていない動画を楽しく消化するお手伝いをします。

## ✨ 特徴

- **プライバシー重視**: データはすべてブラウザ内のIndexedDBに保存され、サーバーへ送信されることはありません。
- **統計ダッシュボード**: 視聴達成率、総再生回数、最も見た動画などをひと目で確認。
- **おすすめ表示**: 未視聴の動画からランダムまたは最新の10本を厳選しておすすめ。
- **手動チェック**: APIで取得できない古い動画や、別のアカウントで見た動画も手動で視聴済みに設定可能。
- **ライトテーマ**: 清潔感のあるモダンなデザイン。

## 🛠️ セットアップ手順

### 1. 視聴履歴の取得 (Google Takeout)

1. [Google Takeout](https://takeout.google.com/) にアクセスします。
2. すべての選択を解除し、「YouTube と YouTube Music」のみを選択します。
3. 「複数の形式」から履歴を **JSON** に変更します。
4. エクスポートを作成し、ダウンロードしたZIP内の `watch-history.json` を用意します。

### 2. YouTube Data API v3 キーの作成

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成します。
2. 「API とサービス」 > 「ライブラリ」から **YouTube Data API v3** を有効にします。
3. 「認証情報」から **API キー** を作成し、コピーします。

### 3. アプリケーションの設定

1. 本アプリの「設定」ページへ移動します。
2. 取得した API キーを入力し保存します。
3. 追跡したいチャンネルのID (例: `UCxxxxxxxxxxxx`) を入力し、同期を開始します。
4. ホーム画面で `watch-history.json` をアップロードすれば、進捗が反映されます。

## 🚀 技術スタック

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB)
- **Icons**: Lucide React
- **Logic**: YouTube Data API v3

---
*Created with ❤️ for YouTube Fans.*
