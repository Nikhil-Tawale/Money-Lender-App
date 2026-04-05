/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORAGE_TYPE: string;
  readonly VITE_API_URL: string;
  readonly REACT_APP_CURRENCY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}