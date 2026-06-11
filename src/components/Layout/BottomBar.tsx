import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, ListMusic, Mic2,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { prepareAudioContext } from '../Player/AudioEngine';
import { formatTime } from '../../utils/format';
import type { PlaybackMode } from '../../types';

const modeIcons: Record<PlaybackMode, string> = {
  sequence: '\u2194',
  shuffle: '\u2194',
  'repeat-one': '\u21BA',
  'repeat-all': '\u21BA',
};

export default function BottomBar() {
  const {
    currentSong, isPlaying, currentTime, duration, volume, playbackMode,
    togglePlay, next, prev, seekTo, setVolume, cyclePlaybackMode,
  } = usePlayerStore();
  const { openNowPlaying } = useUIStore();
  const togglePlaylistPanel = useUIStore((s) => s.togglePlaylistPanel);

  const handleOpenNowPlaying = useCallback(() => {
    prepareAudioContext(); // 在用户手势上下文中初始化 AudioContext
    openNowPlaying();
  }, [openNowPlaying]);

  const barRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      seekTo(ratio * duration);
    },
    [duration, seekTo],
  );

  // GSAP 封面呼吸动画
  useEffect(() => {
    if (!coverRef.current) return;
    if (isPlaying) {
      gsap.to(coverRef.current, { scale: 1.08, duration: 0.45, ease: 'power2.out' });
    } else {
      gsap.to(coverRef.current, { scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [isPlaying]);

  if (!currentSong) return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-[1200px] h-[88px] z-50 liquid-glass rounded-2xl flex items-center px-6 gap-4"
    >
      {/* 进度条 */}
      <div className="absolute top-0 left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-red transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 歌曲信息 */}
      <button
        onClick={handleOpenNowPlaying}
        className="flex items-center gap-3 min-w-0 w-[280px] hover:bg-surface-hover rounded-lg p-1.5 -ml-1.5 transition-colors"
      >
        <img
          ref={coverRef}
          src={currentSong.album.picUrl}
          alt={currentSong.name}
          className="w-12 h-12 rounded-md object-cover shadow-lg"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentSong.name}</p>
          <p className="text-xs text-text-secondary truncate">
            {currentSong.artists.map((a) => a.name).join(', ')}
          </p>
        </div>
      </button>

      {/* 播放控制 */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px] mx-auto">
        <div className="flex items-center gap-5">
          <button onClick={cyclePlaybackMode} className="text-text-secondary hover:text-white transition-colors text-xs font-mono w-5 text-center" title={playbackMode}>
            {playbackMode === 'shuffle' ? (
              <span className="text-brand-red">{modeIcons[playbackMode]}</span>
            ) : playbackMode === 'repeat-one' ? (
              <span className="text-brand-red text-sm">1</span>
            ) : playbackMode === 'repeat-all' ? (
              <span className="text-brand-red">{modeIcons[playbackMode]}</span>
            ) : (
              modeIcons[playbackMode]
            )}
          </button>
          <button onClick={prev} className="text-text-secondary hover:text-white transition-colors">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={16} fill="#000" color="#000" /> : <Play size={16} fill="#000" color="#000" className="ml-0.5" />}
          </button>
          <button onClick={next} className="text-text-secondary hover:text-white transition-colors">
            <SkipForward size={18} fill="currentColor" />
          </button>
          <button onClick={togglePlaylistPanel} className="text-text-secondary hover:text-white transition-colors">
            <ListMusic size={18} />
          </button>
        </div>
        {/* 进度条 */}
        <div className="w-full flex items-center gap-2 text-xs text-text-muted">
          <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-brand-red transition-colors relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
            </div>
          </div>
          <span className="w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 右侧：音量 + 歌词 */}
      <div className="w-[280px] flex items-center justify-end gap-3">
        <button className="text-text-secondary hover:text-white transition-colors">
          <Mic2 size={18} />
        </button>
        <div className="flex items-center gap-2 group">
          <Volume2 size={18} className="text-text-secondary group-hover:text-white transition-colors" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0
              group-hover:[&::-webkit-slider-thumb]:opacity-100 transition-all"
          />
        </div>
      </div>
    </div>
  );
}