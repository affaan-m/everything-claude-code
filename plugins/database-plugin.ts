import { Database } from 'sqlite3';

export class DatabasePlugin {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  public query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  public async getUserById(id: number): Promise<any> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const rows = await this.query(sql, [id]);
    return rows[0];
  }

  public async insertUser(userData: any): Promise<any> {
    const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
    const params = [userData.name, userData.email];
    const result = await this.query(sql, params);
    return result;
  }

  public async updateUser(id: number, userData: any): Promise<any> {
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    const params = [userData.name, userData.email, id];
    const result = await this.query(sql, params);
    return result;
  }

  public async deleteUser(id: number): Promise<any> {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await this.query(sql, [id]);
    return result;
  }

  public close(): void {
    this.db.close();
  }
}
