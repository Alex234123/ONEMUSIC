import { useNavigate } from 'react-router-dom';
import type { Playlist, Album } from '../../types';
import { Play } from 'lucide-react';

interface CardProps {
  item: Playlist | Album;
  type: 'playlist' | 'album';
}

function isPlaylist(item: Playlist | Album): item is Playlist {
  return 'coverImgUrl' in item;
}

export default function PlaylistCard({ item, type }: CardProps) {
  const navigate = useNavigate();
  const playlist = isPlaylist(item) ? item : null;
  const album = !isPlaylist(item) ? item : null;
  const coverUrl = playlist ? playlist.coverImgUrl : album!.picUrl;
  const title = item.name;
  const desc = playlist ? playlist.creator.nickname : '';

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 w-[180px] group text-left"
    >
      <div className="relative mb-3 aspect-square rounded-lg-card overflow-hidden bg-surface-card">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-brand-red shadow-lg shadow-brand-red/30 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Play size={18} fill="white" color="white" className="ml-0.5" />
          </div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate leading-tight">{title}</h3>
      {desc && <p className="text-xs text-text-secondary truncate mt-1">{desc}</p>}
    </button>
  );
}