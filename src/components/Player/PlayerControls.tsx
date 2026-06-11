import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatTime } from '../../utils/format';

interface Props {
  onProgressClick?: (e: React.MouseEvent) => void;
}

export default function PlayerControls({ onProgressClick }: Props) {
  const {
    isPlaying, currentTime, duration, playbackMode,
    togglePlay, next, prev, seekTo, cyclePlaybackMode,
  } = usePlayerStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onProgressClick) {
      onProgressClick(e);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - rect.left) / rect.width) * duration);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* 进度条 */}
      <div className="mb-3">
        <div
          onClick={handleProgress}
          className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer group relative"
        >
          <div
            className="h-full bg-white rounded-full group-hover:bg-brand-red transition-colors relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-text-muted tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={cyclePlaybackMode}
          className={`transition-colors ${playbackMode === 'shuffle' || playbackMode === 'repeat-one' || playbackMode === 'repeat-all' ? 'text-brand-red' : 'text-text-secondary hover:text-white'}`}
        >
          {playbackMode === 'repeat-one' ? <Repeat1 size={20} /> : playbackMode === 'repeat-all' ? <Repeat size={20} /> : <Shuffle size={20} />}
        </button>

        <button onClick={prev} className="text-text-secondary hover:text-white transition-colors">
          <SkipBack size={22} fill="currentColor" />
        </button>

        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          {isPlaying ? <Pause size={24} fill="#000" color="#000" /> : <Play size={24} fill="#000" color="#000" className="ml-1" />}
        </button>

        <button onClick={next} className="text-text-secondary hover:text-white transition-colors">
          <SkipForward size={22} fill="currentColor" />
        </button>

        <button className="text-text-secondary hover:text-white transition-colors">
          <Repeat size={20} />
        </button>
      </div>
    </div>
  );
}