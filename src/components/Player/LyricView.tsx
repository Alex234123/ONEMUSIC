import { useEffect, useState, useCallback, useRef } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { getLyric } from '../../services/api';
import type { LyricData, YrcWord } from '../../types';

export default function LyricView() {
  const { currentSong, currentTime, isPlaying } = usePlayerStore();
  const [lyric, setLyric] = useState<LyricData | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLyric = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await getLyric(id);
      setLyric(data);
    } catch {
      setLyric(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (currentSong) {
      setLyric(null);
      fetchLyric(currentSong.id);
    }
  }, [currentSong, fetchLyric]);

  // 自动滚动到当前行
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  if (!currentSong || loading || !lyric || lyric.lrc.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/20 text-lg">
          {loading ? '加载中...' : '暂无歌词'}
        </p>
      </div>
    );
  }

  const currentMs = currentTime * 1000;

  // 找到当前播放行
  const activeIndex = lyric.lrc.findIndex((line, i) => {
    const next = lyric.lrc[i + 1];
    return currentMs >= line.time && (!next || currentMs < next.time);
  });

  // AMLL 风格字体大小 — 双重视口单位 + 最小值保护
  const baseFontSize = 'max(max(4.5vh, 2.2vw), 15px)';
  const activeFontSize = 'max(max(6vh, 3vw), 20px)';

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden py-[30vh]"
      style={{
        scrollbarWidth: 'none',
        fontSize: baseFontSize,
        lineHeight: '1.3',
        userSelect: 'none',
      }}
    >
      <style>{`.amll-lyric-scroll::-webkit-scrollbar { display: none; }`}</style>

      {lyric.lrc.map((line, i) => {
        const isActive = i === activeIndex;
        const distance = Math.abs(i - activeIndex);

        // AMLL 视觉层级：当前行最亮，上下行渐隐，远离模糊
        let opacity: number;
        let blur: string;
        let scale: number;

        if (isActive) {
          opacity = 1;
          blur = 'blur(0px)';
          scale = 1;
        } else if (distance === 1) {
          opacity = 0.45;
          blur = isPlaying ? 'blur(0.5px)' : 'blur(0px)';
          scale = 0.92;
        } else if (distance === 2) {
          opacity = 0.22;
          blur = isPlaying ? 'blur(1px)' : 'blur(0.5px)';
          scale = 0.85;
        } else {
          opacity = Math.max(0.06, 0.18 - distance * 0.03);
          blur = isPlaying ? `blur(${Math.min(3, distance * 0.8)}px)` : `${Math.min(1.5, distance * 0.3)}px`;
          scale = Math.max(0.7, 0.9 - distance * 0.04);
        }

        // 获取当前行的逐字歌词（YRC 已按行分组）
        const yrcLine = lyric.yrc?.find(yl => Math.abs(yl.time - line.time) < 200);
        const yrcWords = yrcLine?.words;

        return (
          <div
            key={i}
            data-active={isActive}
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              padding: '0.35em 1em',
              marginBottom: '0',
              opacity,
              filter: blur,
              transform: `scale(${scale})`,
              transformOrigin: 'left center',
              transition: isPlaying
                ? 'opacity 0.4s ease, filter 0.4s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
                : 'opacity 0.25s ease, filter 0.25s ease, transform 0.5s cubic-bezier(0.5, 0, 0.75, 0)',
              willChange: 'transform, opacity, filter',
            }}
          >
            {yrcWords && yrcWords.length > 0 ? (
              <span style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
                {yrcWords.map((word: YrcWord, wi: number) => (
                  <KaraokeWord
                    key={wi}
                    word={word}
                    currentMs={currentMs}
                    isActiveLine={isActive}
                    baseFontSize={activeFontSize}
                  />
                ))}
              </span>
            ) : (
              <span
                style={{
                  fontSize: isActive ? activeFontSize : undefined,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#fff' : undefined,
                  letterSpacing: '0.02em',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {line.text || '\u00A0'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 逐字 karaoke 单词渲染 */
function KaraokeWord({
  word,
  currentMs,
  isActiveLine,
  baseFontSize,
}: {
  word: YrcWord;
  currentMs: number;
  isActiveLine: boolean;
  baseFontSize: string;
}) {
  const { time, duration, text } = word;
  const endTime = time + duration;

  let progress = 0;
  if (currentMs >= endTime) {
    progress = 1;
  } else if (currentMs > time && duration > 0) {
    progress = (currentMs - time) / duration;
  }

  const isFilled = currentMs >= time;
  const durationSec = Math.max(0.3, duration / 1000);

  // 当前激活行的字亮度更高
  const baseOpacity = isActiveLine ? 0.28 : 0.08;
  const fillOpacity = 1;

  return (
    <span className="relative inline whitespace-pre-wrap" style={{ display: 'inline-block' }}>
      {/* 底层：暗色文字 */}
      <span
        style={{
          color: `rgba(255,255,255,${baseOpacity})`,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text}
      </span>

      {/* 顶层：高亮填充，clip 动画由左到右 */}
      {isFilled && (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{
            color: `rgba(255,255,255,${fillOpacity})`,
            whiteSpace: 'pre-wrap',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
              transition: `clip-path ${durationSec}s linear`,
              whiteSpace: 'pre-wrap',
            }}
          >
            {text}
          </span>
        </span>
      )}
    </span>
  );
}
