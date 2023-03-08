declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "production" | "development" | "test";
            PORT: string;
            SECRET: string;
            CDN_DIRECTORY: string;
        }
    }
}

export {};
