/**
 * 视频链接解析器
 * 使用 yt-dlp 提取真实流地址
 */
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const YTDLP_COMMANDS = [
  "python3 -m yt_dlp",
  "python -m yt_dlp",
  "yt-dlp",
];

async function runYtDlp(args: string[]): Promise<string | null> {
  const urlArgs = args.join(" ");
  for (const cmd of YTDLP_COMMANDS) {
    try {
      const { stdout, stderr } = await execAsync(`${cmd} ${urlArgs}`, {
        timeout: 25000,
        maxBuffer: 5 * 1024 * 1024,
      });
      if (stderr && !stdout) console.error("[resolver] stderr:", stderr.slice(0, 200));
      if (stdout) return stdout;
    } catch (err: any) {
      // 记录错误并试下一个
      if (err.killed) console.error(`[resolver] ${cmd}: timeout`);
      else console.error(`[resolver] ${cmd}: ${(err.stderr || err.message || "").slice(0, 100)}`);
    }
  }
  return null;
}

const isWebpageUrl = (url: string) =>
  !/\.(mp4|webm|mkv|avi|mov|flv|wmv)($|\?)/i.test(url);

export interface VideoInfo {
  url: string;
  title?: string;
}

export async function resolveVideo(inputUrl: string): Promise<VideoInfo | null> {
  const url = inputUrl.trim();
  if (!isWebpageUrl(url)) return null;
  if (!url.startsWith("http")) return null;

  try {
    const result = await runYtDlp([
      `"${url}"`,
      "--format", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best",
      "--get-url",
      "--get-title",
      "--no-playlist",
      "--socket-timeout", "20",
    ]);

    if (!result) return null;

    const lines = result.trim().split("\n");
    const streamUrl = lines.pop()?.trim();
    const title = lines.join("\n").trim() || undefined;

    if (!streamUrl || !streamUrl.startsWith("http")) {
      return null;
    }

    return { url: streamUrl, title };
  } catch (err: any) {
    console.error("[resolver] Exception:", err.message || err);
    return null;
  }
}
