import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class NikoNikoService {
  constructor(private readonly mysqlService: MysqlService) {}

  // CRUDS NikoNiko

  async listarNinoNiKO(): Promise<any> {
    const sql = 'SELECT * FROM NikoNikoEntries';
    return this.mysqlService.query(sql);
  }

  async buscarNikoNikoPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM NikoNikoEntries WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async criarNikoNiko(
    id_usuario: number,
    id_projeto: number,
    mood: string,
    entry_date: string,
  ): Promise<any> {
    const sql =
      'INSERT INTO NikoNikoEntries (id_usuario, id_projeto, mood, entry_date) VALUES (?, ?, ?, ?)';
    return this.mysqlService.query(sql, [
      id_usuario,
      id_projeto,
      mood,
      entry_date,
    ]);
  }

  async atualizarNikoNiko(
    id: number,
    id_usuario: number,
    id_projeto: number,
    mood: string,
    entry_date: string,
  ): Promise<any> {
    const sql =
      'UPDATE NikoNikoEntries SET id_usuario = ?, id_projeto = ?, mood = ?, entry_date = ? WHERE id = ?';
    return this.mysqlService.query(sql, [
      id_usuario,
      id_projeto,
      mood,
      entry_date,
      id,
    ]);
  }

  async deletarNikoNiko(id: number): Promise<any> {
    const sql = 'DELETE FROM NikoNikoEntries WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }
}
