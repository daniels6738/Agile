import { Injectable } from '@nestjs/common';
import { MysqlService } from './app.mysql.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(private readonly mysqlService: MysqlService) {}

  //CRUDS usuario

  async listarUsuarios(): Promise<any> {
    const sql = 'SELECT * FROM usuarios';
    return this.mysqlService.query(sql);
  }

  async buscarUsuarioPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM usuarios WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async criarUsuario(
    nome: string,
    email: string,
    senha_hash: string,
  ): Promise<any> {
    const senhaHash = await bcrypt.hash(senha_hash, 10);
    const sql =
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)';
    return this.mysqlService.query(sql, [nome, email, senhaHash]);
  }

  async atualizarUsuario(
    id: number,
    nome: string,
    email: string,
  ): Promise<any> {
    const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
    return this.mysqlService.query(sql, [nome, email, id]);
  }

  async deletarUsuario(id: number): Promise<any> {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }
}
