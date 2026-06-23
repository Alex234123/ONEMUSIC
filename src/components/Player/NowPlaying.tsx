import '@applemusic-like-lyrics/core/style.css';
import '@applemusic-like-lyrics/react-full/style.css';
import { useState, useEffect, useRef } from 'react';
import { useSetAtom } from 'jotai';
import {
  PrebuiltLyricPlayer,
  RepeatMode,
  musicIdAtom, musicNameAtom, musicArtistsAtom, musicAlbumNameAtom,
  musicCoverAtom, musicDurationAtom, musicPlayingAtom,
  musicPlayingPositionAtom, musicVolumeAtom, musicLyricLinesAtom,
  onClickControlThumbAtom, onPlayOrResumeAtom,
  onRequestPrevSongAtom, onRequestNextSongAtom,
  onSeekPositionAtom, onChangeVolumeAtom,
  onToggleShuffleAtom, onCycleRepeatModeAtom,
  onRequestOpenMenuAtom,
  isShuffleActiveAtom, repeatModeAtom,
  isLyricPageOpenedAtom,
  fftDataAtom, lowFreqVolumeAtom,
} from '@applemusic-like-lyrics/react-full';
import { usePlayerStore } from '../../stores/playerStore';
import { useUIStore } from '../../stores/uiStore';
import { useLyricSync } from '../../hooks/useLyricSync';
import { audioAnalyzer } from './AudioEngine';
import PlayerSettings from './PlayerSettings';

// ────────────────────────────────────────────────
// AMLLBridge：Zustand → Jotai atom 数据同步 + FFT 分析
// ────────────────────────────────────────────────
function AMLLBridge() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const playbackMode = usePlayerStore((s) => s.playbackMode);
  const lyricLines = useLyricSync(currentSong?.id);

  const setMusicId = useSetAtom(musicIdAtom);
  const setMusicName = useSetAtom(musicNameAtom);
  const setMusicArtists = useSetAtom(musicArtistsAtom);
  const setMusicAlbumName = useSetAtom(musicAlbumNameAtom);
  const setMusicCover = useSetAtom(musicCoverAtom);
  const setMusicDuration = useSetAtom(musicDurationAtom);
  const setMusicPlaying = useSetAtom(musicPlayingAtom);
  const setMusicVolume = useSetAtom(musicVolumeAtom);
  const setMusicPosition = useSetAtom(musicPlayingPositionAtom);
  const setLyricLines = useSetAtom(musicLyricLinesAtom);
  const setShuffleActive = useSetAtom(isShuffleActiveAtom);
  const setRepeatMode = useSetAtom(repeatModeAtom);
  const setFftData = useSetAtom(fftDataAtom);
  const setLowFreqVolume = useSetAtom(lowFreqVolumeAtom);

  // ── 歌曲元数据同步 ──
  useEffect(() => {
    if (!currentSong) return;
    setMusicId(String(currentSong.id));
    setMusicName(currentSong.name);
    setMusicArtists(currentSong.artists.map((a) => ({ name: a.name, id: String(a.id) })));
    setMusicAlbumName(currentSong.album.name);
    setMusicCover(currentSong.album.picUrl ? (currentSong.album.picUrl.startsWith('/api/') ? currentSong.album.picUrl : `/api/image?url=${encodeURIComponent(currentSong.album.picUrl)}`) : '');
    setMusicDuration(currentSong.duration);
  }, [currentSong?.id, setMusicId, setMusicName, setMusicArtists, setMusicAlbumName, setMusicCover, setMusicDuration]);

  // ── 播放状态同步 ──
  useEffect(() => { setMusicPlaying(isPlaying); }, [isPlaying, setMusicPlaying]);

  // ── 音量同步 ──
  useEffect(() => { setMusicVolume(volume / 100); }, [volume, setMusicVolume]);

  // ── 播放模式同步 ──
  useEffect(() => {
    setShuffleActive(playbackMode === 'shuffle');
    const modeMap: Record<string, RepeatMode> = {
      sequence: RepeatMode.Off,
      'repeat-one': RepeatMode.One,
      'repeat-all': RepeatMode.All,
      shuffle: RepeatMode.Off,
    };
    setRepeatMode(modeMap[playbackMode] ?? RepeatMode.Off);
  }, [playbackMode, setShuffleActive, setRepeatMode]);

  // ── 歌词数据同步 ──
  const prevLyricJsonRef = useRef('');
  useEffect(() => {
    const json = JSON.stringify(lyricLines);
    if (json === prevLyricJsonRef.current) return;
    prevLyricJsonRef.current = json;
    setLyricLines(lyricLines);
  }, [lyricLines, setLyricLines]);

  // ── rAF 时间同步 + FFT 分析 ──
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = document.querySelector('audio');
  }, [currentSong?.id]);

  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) setMusicPosition(audioRef.current.currentTime * 1000);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // AudioContext 已在用户点击打开全屏播放器时由 prepareAudioContext() 创建
    // 此处仅处理 resume（如浏览器自动挂起）
    if (audioAnalyzer?.ctx.state === 'suspended') {
      audioAnalyzer.ctx.resume().catch(() => {});
    }

    const buf = new Uint8Array(audioAnalyzer?.analyser.frequencyBinCount ?? 128);
    let rafId: number;
    let lastFftTime = 0;
    const FFT_INTERVAL = 100; // ms — 降低 FFT 采样频率，避免每帧创建数组导致内存暴涨

    const tick = () => {
      setMusicPosition(audio.currentTime * 1000);
      if (audioAnalyzer?.analyser) {
        if (audioAnalyzer.ctx.state === 'suspended') {
          audioAnalyzer.ctx.resume().catch(() => {});
        }
        const now = performance.now();
        if (now - lastFftTime >= FFT_INTERVAL) {
          lastFftTime = now;
          audioAnalyzer.analyser.getByteFrequencyData(buf);
          setFftData(Array.from(buf));
          const low = buf.slice(0, 4).reduce((a, b) => a + b, 0) / (4 * 255);
          setLowFreqVolume(low);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, setMusicPosition, setFftData, setLowFreqVolume]);

  // ── 回调 atoms ──
  const setOnPlayOrResume = useSetAtom(onPlayOrResumeAtom);
  const setOnPrevSong = useSetAtom(onRequestPrevSongAtom);
  const setOnNextSong = useSetAtom(onRequestNextSongAtom);
  const setOnSeekPosition = useSetAtom(onSeekPositionAtom);
  const setOnChangeVolume = useSetAtom(onChangeVolumeAtom);
  const setOnToggleShuffle = useSetAtom(onToggleShuffleAtom);
  const setOnCycleRepeatMode = useSetAtom(onCycleRepeatModeAtom);
  const setOnClickControlThumb = useSetAtom(onClickControlThumbAtom);
  const setOnRequestOpenMenu = useSetAtom(onRequestOpenMenuAtom);

  useEffect(() => {
    const s = usePlayerStore.getState;
    setOnPlayOrResume({ onEmit: () => {
      // 在用户手势上下文中恢复 AudioContext
      if (audioAnalyzer?.ctx.state === 'suspended') audioAnalyzer.ctx.resume();
      s().togglePlay();
    }});
    setOnPrevSong({ onEmit: () => s().prev() });
    setOnNextSong({ onEmit: () => s().next() });
    setOnSeekPosition({ onEmit: (pos: number) => {
      const audio = document.querySelector('audio');
      if (audio) audio.currentTime = pos / 1000;
      s().seekTo(pos / 1000);
    }});
    setOnChangeVolume({ onEmit: (vol: number) => s().setVolume(Math.round(vol * 100)) });
    setOnToggleShuffle({ onEmit: () => s().cyclePlaybackMode() });
    setOnCycleRepeatMode({ onEmit: () => s().cyclePlaybackMode() });
    setOnClickControlThumb({ onEmit: () => useUIStore.getState().closeNowPlaying() });
    setOnRequestOpenMenu({ onEmit: () => useUIStore.getState().toggleSettings() });
  }, [setOnPlayOrResume, setOnPrevSong, setOnNextSong, setOnSeekPosition, setOnChangeVolume, setOnToggleShuffle, setOnCycleRepeatMode, setOnClickControlThumb, setOnRequestOpenMenu]);

  return null;
}

// ────────────────────────────────────────────────
// NowPlaying 主组件
// ────────────────────────────────────────────────
export default function NowPlaying() {
  const isNowPlayingOpen = useUIStore((s) => s.isNowPlayingOpen);
  const togglePlaylistPanel = useUIStore((s) => s.togglePlaylistPanel);
  const setLyricPageOpened = useSetAtom(isLyricPageOpenedAtom);

  useEffect(() => { setLyricPageOpened(isNowPlayingOpen); }, [isNowPlayingOpen, setLyricPageOpened]);

  // 修复 AMLL 内置按钮：playlist 按钮打开播放列表，隐藏 airplay 按钮
  // 歌词按钮由 AMLL 内部自行处理（hideLyricViewAtom），不做拦截
  useEffect(() => {
    if (!isNowPlayingOpen) return;
    const BOUND_ATTR = 'data-amll-btn-bound';

    const bindButtons = () => {
      // 清除旧标记
      document.querySelectorAll('[data-playlist-bound]').forEach((el) => {
        el.removeAttribute('data-playlist-bound');
      });

      document.querySelectorAll(`button._6-mjea_toggleIconButton:not([${BOUND_ATTR}])`).forEach((btn) => {
        const svg = btn.querySelector('svg');
        if (!svg) return;
        const paths = svg.querySelectorAll('path');
        const firstPathD = paths[0]?.getAttribute('d') || '';

        // 识别按钮类型：
        // playlist_off: 单 path, d 以 "M23.9922" 开头
        // playlist_on: 单 path, d 以 "M1.91256" 开头
        // lyrics_off: 单 path, d 以 "M22.8594" 开头
        // lyrics_on: 双 path（有背景圆角矩形 + 引号图标）
        // airplay: 单 path, d 以 "M11.8633" 开头
        let isPlaylistBtn = false;
        let isAirplayBtn = false;
        if (paths.length === 1) {
          if (firstPathD.startsWith('M23.9922') || firstPathD.startsWith('M1.91256')) {
            isPlaylistBtn = true;
          } else if (firstPathD.startsWith('M11.8633')) {
            isAirplayBtn = true;
          }
        }

        btn.setAttribute(BOUND_ATTR, 'true');

        if (isAirplayBtn) {
          // 隐藏 airplay 按钮
          (btn as HTMLElement).style.display = 'none';
        } else if (isPlaylistBtn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlaylistPanel();
          });
        }
        // 歌词按钮不拦截，让 AMLL 内部 onClick 正常触发
      });
    };
    const timer = setTimeout(bindButtons, 300);
    const observer = new MutationObserver(bindButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isNowPlayingOpen, togglePlaylistPanel]);

  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const toggleSettings = useUIStore((s) => s.toggleSettings);

  if (!isNowPlayingOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden"
      style={{ animation: 'amll-fade-in 0.3s ease-out' }}>
      <AMLLBridge />
      <PrebuiltLyricPlayer
        style={{ position: 'fixed', width: '100%', height: '100vh', overflow: 'hidden' }}
      />
      {isSettingsOpen && <PlayerSettings onClose={toggleSettings} />}
    </div>
  );
}
