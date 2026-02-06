declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
  }

  export type PoolClient = object;

  export class Pool {
    constructor(config?: PoolConfig);
    end(): Promise<void>;
  }

  const pg: {
    Pool: typeof Pool;
  };

  export default pg;
}
