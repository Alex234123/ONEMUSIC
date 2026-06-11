import { useState, useEffect, useCallback, useRef } from 'react';
import { getLyric } from '../services/api';
import type { LyricLine } from '@applemusic-like-lyrics/core';
import type { YrcLine, LrcLine as ApiLrcLine } from '../types';

/** 将后端歌词数据转换为 AMLL LyricLine[] 格式 */
export function useLyricSync(songId?: number): LyricLine[] {
  const [lines, setLines] = useState<LyricLine[]>([]);
  const fetchingIdRef = useRef<number | undefined>();

  const fetchAndConvert = useCallback(async (id: number) => {
    fetchingIdRef.current = id;
    try {
      const data = await getLyric(id);
      if (fetchingIdRef.current !== id) return;

      const { lrc, yrc, tlyric } = data;
      if (!lrc || lrc.length === 0) { setLines([]); return; }

      // 构建 YRC 时间 → 行 的查找表（LRC 和 YRC 时间戳可能有几百ms偏差）
      const yrcLines: YrcLine[] = yrc ?? [];
      const findYrcLine = (lrcTime: number): YrcLine | undefined => {
        // 优先精确匹配，其次找最近的（偏差 < 800ms）
        let best: YrcLine | undefined;
        let bestDiff = 800;
        for (const yl of yrcLines) {
          const diff = Math.abs(yl.time - lrcTime);
          if (diff === 0) return yl;
          if (diff < bestDiff) { bestDiff = diff; best = yl; }
        }
        return best;
      };

      // 以 LRC 为骨架（保证所有行都存在），YRC 仅增强逐字数据
      const converted: LyricLine[] = lrc.map((line, i) => {
        const nextTime = lrc[i + 1]?.time ?? line.time + 5000;
        const yrcLine = findYrcLine(line.time);

        // 有 YRC 时用 YRC 行时间（更精确），否则用 LRC 时间
        const startTime = yrcLine?.time ?? line.time;
        const endTime = lrc[i + 1]
          ? (findYrcLine(lrc[i + 1].time)?.time ?? nextTime)
          : nextTime;

        return {
          startTime,
          endTime,
          translatedLyric: tlyric?.find(t => Math.abs(t.time - line.time) < 200)?.text || '',
          romanLyric: '',
          isBG: false,
          isDuet: false,
          words: yrcLine && yrcLine.words.length > 0
            ? yrcLine.words.map(w => ({
                word: w.text,
                startTime: w.time,
                endTime: w.time + w.duration,
              }))
            : line.text
              ? [{ word: line.text, startTime, endTime }]
              : [],
        };
      });

      if (fetchingIdRef.current !== id) return;
      setLines(converted);
    } catch {
      if (fetchingIdRef.current === id) setLines([]);
    }
  }, []);

  useEffect(() => {
    if (songId) fetchAndConvert(songId);
  }, [songId, fetchAndConvert]);

  return lines;
}
