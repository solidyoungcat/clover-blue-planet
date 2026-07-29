// Electron webview 类型扩展
declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        allowfullscreen?: string;
        preload?: string;
      },
      HTMLElement
    >;
  }
}

interface Window {
  electronAPI?: {
    openFileDialog: () => Promise<string | null>;
    platform: string;
  };
}
