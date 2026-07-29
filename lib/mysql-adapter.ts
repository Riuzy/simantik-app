import { createConnection, type Connection } from 'mysql2/promise';

export interface MySqlAdapterConfig {
  url: string;
}

export class MySqlQueryResult {
  constructor(
    public rows: unknown[],
    public fields?: unknown[],
  ) {}
}

export class MySqlTransaction {
  constructor(private conn: Connection) {}

  async query(query: string, params?: unknown[]): Promise<MySqlQueryResult> {
    const [rows, fields] = await this.conn.execute(query, params || []);
    return new MySqlQueryResult(rows as unknown[], fields as unknown[]);
  }

  async commit(): Promise<void> {
    await this.conn.commit();
  }

  async rollback(): Promise<void> {
    await this.conn.rollback();
  }
}

export class MySqlAdapter {
  private conn: Connection | null = null;

  constructor(private config: MySqlAdapterConfig) {}

  async connect(): Promise<void> {
    this.conn = await createConnection(this.config.url);
  }

  async query(query: string, params?: unknown[]): Promise<MySqlQueryResult> {
    if (!this.conn) throw new Error('Not connected');
    const [rows, fields] = await this.conn.execute(query, params || []);
    return new MySqlQueryResult(rows as unknown[], fields as unknown[]);
  }

  async transaction(): Promise<MySqlTransaction> {
    if (!this.conn) throw new Error('Not connected');
    await this.conn.beginTransaction();
    return new MySqlTransaction(this.conn);
  }

  async disconnect(): Promise<void> {
    if (this.conn) {
      await this.conn.end();
      this.conn = null;
    }
  }
}
