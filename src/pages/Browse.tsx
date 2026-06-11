import { useEffect, useState } from 'react';
import { getTopPlaylists, getTopAlbums } from '../services/api';
import PlaylistCard from '../components/Cards/PlaylistCard';
import type { Playlist, Album } from '../types';

const categories = ['全部', '华语', '欧美', '日语', '韩语', '电子', '摇滚', '民谣', '说唱', '轻音乐'];

export default function Browse() {
  const [activeCat, setActiveCat] = useState('全部');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [pl, al] = await Promise.all([
          getTopPlaylists(activeCat, 20).catch(() => ({ playlists: [] })),
          getTopAlbums(12).catch(() => ({ albums: [] })),
        ]);
        setPlaylists(pl.playlists || []);
        setAlbums(al.albums || []);
      } catch {
        // 静默处理
      }
      setLoading(false);
    }
    load();
  }, [activeCat]);

  return (
    <div className="px-8 pt-12 pb-8">
      <h1 className="text-3xl font-bold text-white mb-8">浏览</h1>

      {/* 分类标签 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-5 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all
              ${activeCat === cat
                ? 'bg-white text-black'
                : 'bg-surface-card text-text-secondary hover:text-white hover:bg-surface-hover'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-5 gap-5 animate-pulse">
          {[...Array(10)].map((_, i) => (
            <div key={i}>
              <div className="aspect-square bg-surface-card rounded-lg-card mb-3" />
              <div className="h-4 w-3/4 bg-surface-card rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 歌单 */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">热门歌单</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {playlists.map((pl) => (
                <PlaylistCard key={pl.id} item={pl} type="playlist" />
              ))}
            </div>
          </section>

          {/* 新碟上架 */}
          {albums.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4">新碟上架</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {albums.map((al) => (
                  <PlaylistCard key={al.id} item={al} type="album" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && playlists.length === 0 && (
        <div className="text-center py-20 text-text-secondary">暂无数据，请检查 API 配置</div>
      )}
    </div>
  );
}