/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly OPENROUTER_API_KEY: string;
    readonly OPENROUTER_MODEL?: string;
    readonly GHOST_URL?: string;
    readonly GHOST_ADMIN_API_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
