/// <reference types="vite/client" />

declare module '@vitejs/plugin-react' {
  import type { PluginOption } from 'vite';

  export interface Options {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    jsxImportSource?: string;
    jsxRuntime?: 'classic' | 'automatic';
    reactRefreshHost?: string;
    compiler?: boolean | unknown;
  }

  export default function react(options?: Options): PluginOption[];
}

interface Window {
  google?: any;
  FB?: any;
  fbAsyncInit?: any;
}
