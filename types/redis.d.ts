declare module "redis" {
  interface RedisClientType {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
    del(key: string): Promise<number>;
    on(event: "error", callback: (err: Error) => void): void;
    connect(): Promise<void>;
  }

  export function createClient(options?: { url?: string }): RedisClientType;
}
