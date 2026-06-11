import { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { getSongUrl } from '../../services/api';

/**
 * 全局音频分析器（延迟创建，仅 AMLLBridge 需要时初始化）
 * 创建后 <audio> 输出路由到 Web Audio API 图：source → analyser → destination
 * 未创建时 <audio> 直接输出到扬声器，不受 AudioContext 影响
 */
export let audioAnalyzer: { analyser: AnalyserNode; ctx: AudioContext } | null = null;

/** 全局 <audio> 元素引用，供 prepareAudioContext 使用 */
let globalAudioRef: HTMLAudioElement | null = null;

/** 持续守护 AudioContext 不被浏览器挂起 */
function guardAudioContext(ctx: AudioContext): void {
  const resume = () => {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  };
  ctx.onstatechange = () => {
    if (ctx.state === 'suspended') resume();
  };
  // 额外：定时检测（某些浏览器不触发 statechange）
  const timer = setInterval(() => {
    if (ctx.state === 'closed') { clearInterval(timer); return; }
    resume();
  }, 2000);
}

/**
 * 在用户手势上下文中预创建 AudioContext + AnalyserNode
 * 必须由用户点击事件（如打开全屏播放器）同步调用
 * 若 AudioContext 未 resume，浏览器会静音所有经过它的音频
 */
export function prepareAudioContext(): void {
  if (audioAnalyzer) {
    if (audioAnalyzer.ctx.state === 'suspended') {
      audioAnalyzer.ctx.resume();
    }
    return;
  }
  if (!globalAudioRef) return;
  try {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(globalAudioRef);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioAnalyzer = { analyser, ctx };
    if (ctx.state === 'suspended') ctx.resume();
    guardAudioContext(ctx);
  } catch {
    // createMediaElementSource 只能调用一次，重复调用会抛异常
  }
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

/**
 * 全局音频引擎：监听 playerStore 变化，控制 <audio> 播放
 */
export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong, isPlaying, volume, currentTime,
    setCurrentTime, setDuration, next,
  } = usePlayerStore();

  // 保存全局引用供 prepareAudioContext 使用
  useEffect(() => {
    if (audioRef.current) globalAudioRef = audioRef.current;
  });

  // 歌曲变化时获取 URL 并播放
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;

    getSongUrl(currentSong.id)
      .then((data) => {
        const rawUrl = data?.data?.[0]?.url;
        if (rawUrl) {
          audio.src = `${API_BASE}/api/audio?url=${encodeURIComponent(rawUrl)}`;
          audio.play().catch(() => {});
        } else {
          console.warn('歌曲无播放URL:', currentSong.name);
          setTimeout(() => next(), 1500);
        }
      })
      .catch(() => {
        setTimeout(() => next(), 1500);
      });
  }, [currentSong?.id]);

  // 播放/暂停
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
      // 如果 AudioContext 已创建，确保 resume
      if (audioAnalyzer?.ctx.state === 'suspended') {
        audioAnalyzer.ctx.resume();
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
  }, [volume]);

  // 时间更新
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      next();
    };
    const onError = () => {
      console.error('Audio error:', audio.error?.message);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [setCurrentTime, setDuration, next]);

  // seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, currentSong?.id]);

  return <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />;
}