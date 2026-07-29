/**
 * 将视频平台链接转换为内嵌播放器地址
 * 支持：Bilibili、YouTube
 */

const VIDEO_EXTS = /\.(mp4|webm|mkv|avi|mov|flv|wmv)($|\?)/i;

// B站：https://www.bilibili.com/video/BVxxx → player.bilibili.com/player.html?bvid=BVxxx
function parseBilibili(url: string): string | null {
  const m = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (!m) return null;
  return `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=1`;
}

// YouTube：https://www.youtube.com/watch?v=xxx → youtube.com/embed/xxx
function parseYouTube(url: string): string | null {
  const m = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`;
  const s = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (s) return `https://www.youtube.com/embed/${s[1]}?autoplay=1`;
  return null;
}

export function resolveEmbedUrl(input: string): string | null {
  const url = input.trim();

  // 已经是视频直链 → 不需要转换
  if (VIDEO_EXTS.test(url)) return null;

  return parseBilibili(url) || parseYouTube(url) || null;
}

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTS.test(url);
}
