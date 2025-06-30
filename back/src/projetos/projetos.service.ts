import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class ProjetosService {
  constructor(private readonly mysqlService: MysqlService) {}

  // CRUDS projetos

  async listarProjetos(): Promise<any> {
    const sql = 'SELECT * FROM Projetos';
    return this.mysqlService.query(sql);
  }

  async buscarProjetoPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM Projetos WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async criarProjeto(nome: string, descricao: string): Promise<any> {
    const sql = 'INSERT INTO Projetos (nome, descricao) VALUES (?, ?)';
    return this.mysqlService.query(sql, [nome, descricao]);
  }

  async atualizarProjeto(
    id: number,
    nome: string,
    descricao: string,
  ): Promise<any> {
    const sql = 'UPDATE Projetos SET nome = ?, descricao = ? WHERE id = ?';
    return this.mysqlService.query(sql, [nome, descricao, id]);
  }

  async deletarProjeto(id: number): Promise<any> {
    const sql = 'DELETE FROM Projetos WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }
}
