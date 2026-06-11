import { X, Play, Trash2, Music2 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';

export default function PlaylistPanel() {
  const { playlist, currentSong, playSong, queue, removeFromQueue, clearQueue } = usePlayerStore();
  const { isPlaylistPanelOpen, togglePlaylistPanel } = useUIStore();

  if (!isPlaylistPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end items-end pb-[104px] pr-6"
      style={{ animation: 'amll-fade-in 0.2s ease-out' }}>
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={togglePlaylistPanel} />
      {/* 悬浮液态玻璃面板 */}
      <div
        className="relative w-[360px] max-h-[70vh] overflow-hidden flex flex-col liquid-glass-heavy rounded-2xl shadow-2xl shadow-black/40"
        style={{ animation: 'slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <Music2 size={18} className="text-brand-red" />
            <h2 className="text-lg font-semibold text-white tracking-tight">播放列表</h2>
          </div>
          <button onClick={togglePlaylistPanel}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        {/* 待播队列 */}
        {queue.length > 0 && (
          <div className="px-5 py-4 border-b border-white/[0.04] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25">
                待播队列 · {queue.length}
              </h3>
              <button onClick={clearQueue}
                className="text-[11px] text-white/30 hover:text-brand-red transition-colors">
                清空
              </button>
            </div>
            <div className="space-y-0.5 max-h-[160px] overflow-y-auto">
              {queue.map((song, i) => (
                <div key={`${song.id}-${i}`}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-white/[0.06] transition-colors group">
                  <img
                    src={song.album.picUrl ? (song.album.picUrl.startsWith('/api/') ? song.album.picUrl : `/api/image?url=${encodeURIComponent(song.album.picUrl)}`) : ''}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-white/80 truncate">{song.name}</p>
                    <p className="text-[11px] text-white/35 truncate">{song.artists.map(a => a.name).join(', ')}</p>
                  </div>
                  <button onClick={() => removeFromQueue(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-brand-red transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 播放列表 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-3">
            播放列表 · {playlist.length}
          </h3>
          <div className="space-y-0.5">
            {playlist.map((song) => {
              const isActive = currentSong?.id === song.id;
              return (
                <button
                  key={song.id}
                  onClick={() => playSong(song, playlist)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-white/[0.08] shadow-sm shadow-brand-red/10'
                      : 'hover:bg-white/[0.06]'
                  }`}
                >
                  {isActive ? (
                    <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-brand-red/15 shadow-sm shadow-brand-red/20">
                      <Play size={14} fill="currentColor" className="text-brand-red ml-0.5" />
                    </span>
                  ) : (
                    <img
                      src={song.album.picUrl ? (song.album.picUrl.startsWith('/api/') ? song.album.picUrl : `/api/image?url=${encodeURIComponent(song.album.picUrl)}`) : ''}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] truncate ${isActive ? 'text-white font-medium' : 'text-white/75'}`}>
                      {song.name}
                    </p>
                    <p className={`text-[11px] truncate ${isActive ? 'text-brand-red/70' : 'text-white/35'}`}>
                      {song.artists.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {playlist.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Music2 size={32} className="text-white/10 mb-3" />
              <p className="text-sm text-white/20">播放列表为空</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
