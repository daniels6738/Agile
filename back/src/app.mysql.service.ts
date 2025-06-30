import { Injectable, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class MysqlService implements OnModuleInit {
  private connection: mysql.Connection;

  async onModuleInit() {
    this.connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'agile_platform_db',
    });
  }

  async query(sql: string, params?: any[]) {
    const [rows] = await this.connection.execute(sql, params);
    return rows;
  }
}
