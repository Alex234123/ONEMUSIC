import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import NowPlaying from '../Player/NowPlaying';
import PlaylistPanel from '../Player/PlaylistPanel';
import AudioEngine from '../Player/AudioEngine';
import FluidBackground from '../Player/FluidBackground';
import TrafficLights from '../common/TrafficLights';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { useAlbumColors } from '../../hooks/useAlbumColors';

export default function MainLayout() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const collapsed = useUIStore((s) => s.isSidebarCollapsed);
  const colors = useAlbumColors(
    currentSong?.album?.picUrl
      ? (currentSong.album.picUrl.startsWith('/api/') ? currentSong.album.picUrl : `/api/image?url=${encodeURIComponent(currentSong.album.picUrl)}`)
      : undefined,
  );

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <FluidBackground colors={colors} />
      <AudioEngine />
      {/* macOS 风格标题栏 */}
      <div className="relative z-50 flex items-center justify-between h-[38px] shrink-0">
        <TrafficLights />
        <span className="absolute left-1/2 -translate-x-1/2 text-xs text-white/30 font-medium select-none">
          ONEMUSIC
        </span>
      </div>
      <Sidebar />
      <main
        className={`relative z-10 flex-1 overflow-y-auto transition-all duration-300
          ${collapsed ? 'ml-[76px]' : 'ml-[192px]'}
          ${currentSong ? 'mb-[100px]' : ''}`}
      >
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
      {currentSong && <BottomBar />}
      <NowPlaying />
      <PlaylistPanel />
    </div>
  );
}