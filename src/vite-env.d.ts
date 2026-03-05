interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_API_USER: string;
  readonly VITE_API_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}