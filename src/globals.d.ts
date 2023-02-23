declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            SECRET: string;
            CDN_DIRECTORY: string;
        }
    }
}

export {};
