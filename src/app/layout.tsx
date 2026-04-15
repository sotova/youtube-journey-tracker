import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Play as Youtube, Home, Settings as SettingsIcon } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube Journey Tracker",
  description: "Track your YouTube channel progress and watch history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col md:flex-row bg-[#f9fafb]">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 md:h-screen">
            <div className="p-6 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-red-500 p-2 rounded-xl text-white group-hover:bg-red-600 transition-colors">
                  <Youtube size={24} />
                </div>
                <span className="font-bold text-xl tracking-tight">YouTube Journey</span>
              </Link>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-medium">
                <Home size={20} className="text-gray-400" />
                <span>ホーム</span>
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-medium">
                <SettingsIcon size={20} className="text-gray-400" />
                <span>設定</span>
              </Link>
            </nav>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Data Source</p>
              <p className="text-sm text-gray-600 font-light">IndexedDB (Local Storage)</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
