import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { getRecommendPlaylist, getTopPlaylists } from '../services/api';
import PlaylistCard from '../components/Cards/PlaylistCard';
import type { Playlist } from '../types';

export default function Home() {
  const greeting = useUIStore((s) => s.homeGreeting);
  const [recommendList, setRecommendList] = useState<Playlist[]>([]);
  const [hotList, setHotList] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  useEffect(() => {
    async function load() {
      try {
        const [rec, hot] = await Promise.all([
          getRecommendPlaylist().catch(() => ({ playlists: [] })),
          getTopPlaylists('华语', 10).catch(() => ({ playlists: [] })),
        ]);
        setRecommendList(rec.playlists || []);
        setHotList(hot.playlists || []);
      } catch {
        // 静默处理
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="px-8 pt-12">
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-surface-card rounded-lg" />
          <div className="h-6 w-48 bg-surface-card rounded" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[180px]">
                <div className="aspect-square bg-surface-card rounded-lg-card mb-3" />
                <div className="h-4 w-3/4 bg-surface-card rounded" />
                <div className="h-3 w-1/2 bg-surface-card rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pt-12 pb-8">
      {/* 打招呼 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{greeting}</h1>
        <p className="text-text-secondary mt-1">{dateStr}</p>
      </div>

      {/* 推荐歌单 */}
      {recommendList.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-5">为你推荐</h2>
          <div className="scroll-x">
            {recommendList.slice(0, 6).map((pl) => (
              <PlaylistCard key={pl.id} item={pl} type="playlist" />
            ))}
          </div>
        </section>
      )}

      {/* 热门歌单 */}
      {hotList.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-5">热门歌单</h2>
          <div className="scroll-x">
            {hotList.slice(0, 6).map((pl) => (
              <PlaylistCard key={pl.id} item={pl} type="playlist" />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {recommendList.length === 0 && hotList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 rounded-full bg-surface-card flex items-center justify-center mb-4">
            <span className="text-3xl">🎵</span>
          </div>
          <p className="text-text-secondary text-lg">加载歌单推荐中...</p>
          <p className="text-text-muted text-sm mt-1">请确保后端代理服务已正确配置 API 凭证</p>
        </div>
      )}
    </div>
  );
}