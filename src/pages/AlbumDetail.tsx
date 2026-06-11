import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getAlbumDetail } from '../services/api';
import { usePlayerStore } from '../stores/playerStore';
import SongList from '../components/Cards/SongList';
import type { Album, Song } from '../types';

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAlbumDetail(Number(id))
      .then((data) => {
        setAlbum(data.album);
        setSongs(data.songs || []);
      })
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = () => {
    if (songs.length) playSong(songs[0], songs);
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-text-secondary">
        专辑加载失败
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

      <div
        className="relative h-[300px] flex items-end p-8 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, rgba(192,132,252,0.3) 0%, rgba(0,0,0,0.9) 100%)`,
        }}
      >
        <img
          src={album.picUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
        <div className="relative z-10 flex gap-6 items-end">
          <img
            src={album.picUrl}
            alt={album.name}
            className="w-[200px] h-[200px] rounded-lg-card shadow-2xl object-cover"
          />
          <div className="pb-3">
            <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">专辑</p>
            <h1 className="text-3xl font-bold text-white mb-2">{album.name}</h1>
            <p className="text-sm text-text-muted">
              {album.company && `${album.company} \u00B7 `}
              {album.publishTime ? new Date(album.publishTime).getFullYear() : ''} &middot; {songs.length} 首歌曲
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <SongList songs={songs} onPlayAll={handlePlayAll} />
      </div>
    </div>
  );
}