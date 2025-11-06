/// <reference types="node" />

// Make this file a module so global augmentation works.
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Common environment variables — customize to your project.
      PROTECTION_KEY: string;
      API_KEY: string;
    }
  }
}
