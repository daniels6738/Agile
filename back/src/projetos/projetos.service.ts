import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class ProjetosService {
  constructor(private readonly mysqlService: MysqlService) {}

  // CRUDS projetos

  async listarProjetos(): Promise<any> {
    const sql = 'SELECT * FROM ProjectMembers';
    return this.mysqlService.query(sql);
  }

  async buscarProjetoPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM Projetos WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async listarMenbrosDoProjeto(id: number): Promise<any> {
    return this.mysqlService.query(
      'SELECT id_usuario FROM ProjectMembers WHERE id_projeto = ?',
      [id],
    );
  }

  async criarProjeto(
    id_usuario: number,
    nome: string,
    descricao: string,
  ): Promise<any> {
    const idProjeto = await this.mysqlService.insert(
      'INSERT INTO Projetos (nome, descricao) VALUES (?, ?)',
      [nome, descricao],
    );

    await this.mysqlService.query(
      'INSERT INTO ProjectMembers (id_projeto, id_usuario, funcao) VALUES (?, ?, ?)',
      [idProjeto, id_usuario, 'Admin'],
    );

    return { message: 'Projeto criado com sucesso', idProjeto };
  }

  async adicionarUsuarioNoProjeto(
    id_projeto: number,
    id_usuario_admin: number,
    id_usuario: number,
    funcao: string,
  ): Promise<any> {
    const result = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ? AND funcao = ?',
      [id_projeto, id_usuario_admin, 'Admin'],
    );
    if (result.length === 0) {
      return { message: 'projeto não existe ou usuario não é admin' };
    }
    const sql =
      'INSERT INTO ProjectMembers (id_projeto, id_usuario, funcao) VALUES (?, ?, ?)';
    return this.mysqlService.query(sql, [id_projeto, id_usuario, funcao]);
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

  async excluirMembroProjeto(
    id_projeto: number,
    id_usuario_admin: number,
    id_usuario: number,
  ): Promise<any> {
    const result = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ? AND funcao = ?',
      [id_projeto, id_usuario_admin, 'Admin'],
    );
    if (result.length === 0) {
      return { message: 'projeto não existe ou usuario não é admin' };
    }
    const sql =
      'DELETE FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ?';
    return this.mysqlService.query(sql, [id_projeto, id_usuario]);
  }
}
