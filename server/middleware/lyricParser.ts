export interface LrcLine {
  time: number;
  text: string;
}

export interface YrcLine {
  time: number;
  duration: number;
  words: YrcWord[];
}

export interface YrcWord {
  time: number;
  duration: number;
  text: string;
}

export function parseLrc(lrcStr: string): LrcLine[] {
  if (!lrcStr) return [];
  const lines = lrcStr.split('\n');
  const result: LrcLine[] = [];

  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
    if (match) {
      const time = parseInt(match[1]) * 60000 + parseFloat(match[2]) * 1000;
      // 清理可能混入的逐字时间码 (offset,duration,flag)
      const text = match[3].replace(/\(\d+,\d+,\d+\)/g, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  }
  return result;
}

export function parseYrc(yrcStr: string): YrcLine[] {
  if (!yrcStr) return [];
  const lines = yrcStr.split('\n');
  const result: YrcLine[] = [];

  for (const line of lines) {
    // 行头：[startTime,duration]
    const timeMatch = line.match(/\[(\d+),(\d+)\]/);
    if (!timeMatch) continue;

    const startTime = parseInt(timeMatch[1]);
    const lineDuration = parseInt(timeMatch[2]);
    const lineContent = line.replace(/\[\d+,\d+\]/, '').trim();

    // 逐字格式：(absoluteTime,duration,flag)word
    // 注意：offset 是绝对时间戳，不是相对于 startTime 的偏移
    const wordRegex = /\((\d+),(\d+)(?:,\d+)?\)([^(]*)/g;
    const words: YrcWord[] = [];
    let match;

    while ((match = wordRegex.exec(lineContent)) !== null) {
      const absoluteTime = parseInt(match[1]);
      const wordDuration = parseInt(match[2]);
      const wordText = match[3];
      if (wordText) {
        words.push({
          time: absoluteTime,
          duration: wordDuration,
          text: wordText,
        });
      }
    }

    // 无逐字匹配则整行作为 fallback
    if (words.length === 0) {
      const cleanText = lineContent.replace(/\(\d+,\d+(?:,\d+)?\)/g, '').trim();
      if (cleanText) {
        words.push({ time: startTime, duration: lineDuration, text: cleanText });
      }
    }

    if (words.length > 0) {
      result.push({ time: startTime, duration: lineDuration, words });
    }
  }
  return result;
}