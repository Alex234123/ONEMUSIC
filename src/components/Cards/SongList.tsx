import { useState } from 'react';
import { Play, Heart } from 'lucide-react';
import type { Song } from '../../types';
import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../utils/format';

interface Props {
  songs: Song[];
  onPlayAll?: () => void;
  showHeader?: boolean;
}

export default function SongList({ songs, onPlayAll, showHeader = true }: Props) {
  const { playSong, currentSong } = usePlayerStore();

  const handlePlay = (song: Song) => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
      onPlayAll?.();
    }
  };

  return (
    <div>
      {showHeader && songs.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white text-sm font-semibold rounded-pill transition-colors shadow-lg shadow-brand-red/20"
          >
            <Play size={18} fill="white" />
            播放全部
          </button>
          <button className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-text-secondary hover:text-white hover:border-white/40 transition-colors">
            <Heart size={18} />
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;
          return (
            <button
              key={song.id}
              onClick={() => handlePlay(song)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors group
                ${isActive ? 'bg-brand-red/10' : 'hover:bg-surface-hover'}`}
            >
              <span className="w-8 text-center text-sm text-text-muted tabular-nums shrink-0">
                {index + 1}
              </span>
              <img
                src={song.album.picUrl}
                alt={song.name}
                className="w-10 h-10 rounded object-cover shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-brand-red' : 'text-white'}`}>
                  {song.name}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {song.artists.map((a) => a.name).join(', ')}
                </p>
              </div>
              <span className="text-xs text-text-muted tabular-nums shrink-0">
                {formatTime(song.duration / 1000)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}