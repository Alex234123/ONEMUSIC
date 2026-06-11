import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getPlaylistDetail } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import SongList from '../components/Cards/SongList';
import type { Playlist } from '../types';

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPlaylistDetail(Number(id))
      .then((data) => setPlaylist(data.playlist))
      .catch(() => setPlaylist(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = () => {
    if (playlist?.tracks?.length) {
      playSong(playlist.tracks[0], playlist.tracks);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-[300px] bg-surface-card flex items-end p-8">
          <div className="flex gap-6">
            <div className="w-[200px] h-[200px] bg-surface-hover rounded-lg-card" />
            <div className="space-y-3 pt-4">
              <div className="h-8 w-64 bg-surface-hover rounded" />
              <div className="h-4 w-48 bg-surface-hover rounded" />
              <div className="h-4 w-32 bg-surface-hover rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-text-secondary">
        歌单加载失败，请确认歌单 ID 有效
      </div>
    );
  }

  return (
    <div>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md
          flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all"
      >
        <ChevronLeft size={22} />
      </button>

      {/* 头部 */}
      <div
        className="relative h-[300px] flex items-end p-8 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(250,88,106,0.3) 0%, rgba(0,0,0,0.9) 100%)`,
        }}
      >
        <img
          src={playlist.coverImgUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
        <div className="relative z-10 flex gap-6 items-end">
          <img
            src={playlist.coverImgUrl}
            alt={playlist.name}
            className="w-[200px] h-[200px] rounded-lg-card shadow-2xl object-cover"
          />
          <div className="pb-3">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">歌单</p>
            <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-sm text-text-secondary line-clamp-2 mb-2">{playlist.description}</p>
            )}
            <p className="text-sm text-text-muted">
              {playlist.creator.nickname} &middot; {playlist.trackCount} 首歌曲
            </p>
          </div>
        </div>
      </div>

      {/* 歌曲列表 */}
      <div className="px-8 py-6">
        <SongList songs={playlist.tracks || []} onPlayAll={handlePlayAll} />
      </div>
    </div>
  );
}