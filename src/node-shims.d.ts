declare module "fs" {
  export const promises: {
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    access(path: string): Promise<void>;
    writeFile(path: string, data: string, encoding?: string): Promise<void>;
    readFile(path: string, encoding: string): Promise<string>;
  };
}

declare module "path" {
  interface PathModule {
    resolve(...paths: string[]): string;
    join(...paths: string[]): string;
  }

  const path: PathModule;
  export default path;
}

declare const process: {
  cwd(): string;
  argv: string[];
  exit(code?: number): never;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
};
