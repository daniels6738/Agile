import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class TasksService {
  constructor(private readonly mysqlService: MysqlService) {}

  async listarTasks() {
    return this.mysqlService.query('SELECT * FROM Tasks');
  }

  async buscarTaskPorId(id: number) {
    return this.mysqlService.query('SELECT * FROM Tasks WHERE id = ?', [id]);
  }

  async buscarTaskPorSprintDeUmProjeto(id_sprint: number, id_projeto: number) {
    return this.mysqlService.query(
      'SELECT * FROM Tasks WHERE id_projeto = ? AND id_sprint = ?',
      [id_projeto, id_sprint],
    );
  }

  async criarTask(data: {
    id_projeto: number;
    id_sprint?: number;
    id_responsavel?: number;
    titulo: string;
    descricao?: string;
    status?: string;
    pontuacao?: number;
  }) {
    const sql = `
      INSERT INTO Tasks (id_projeto, id_sprint, id_responsavel, titulo, descricao, status, pontuacao)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const {
      id_projeto,
      id_sprint,
      id_responsavel,
      titulo,
      descricao,
      status = 'A Fazer',
      pontuacao,
    } = data;

    const insertId: any = await this.mysqlService.insert(sql, [
      id_projeto,
      id_sprint || null,
      id_responsavel || null,
      titulo,
      descricao || null,
      status,
      pontuacao || null,
    ]);
    return { id: insertId };
  }

  async atualizarTask(
    id: number,
    data: {
      titulo?: string;
      descricao?: string;
      status?: string;
      pontuacao?: number;
      id_sprint?: number;
      id_responsavel?: number;
    },
  ) {
    const sql = `
      UPDATE Tasks
      SET titulo = ?, descricao = ?, status = ?, pontuacao = ?, id_sprint = ?, id_responsavel = ?
      WHERE id = ?
    `;

    return this.mysqlService.query(sql, [
      data.titulo,
      data.descricao,
      data.status,
      data.pontuacao,
      data.id_sprint,
      data.id_responsavel,
      id,
    ]);
  }

  async deletarTask(id: number) {
    return this.mysqlService.query('DELETE FROM Tasks WHERE id = ?', [id]);
  }

  async atualizarStatus(id: number, novoStatus: string): Promise<any> {
    const query = 'UPDATE Tasks SET status = ? WHERE id = ?';
    const resultado = await this.mysqlService.query(query, [novoStatus, id]);

    if ((resultado as any).affectedRows === 0) {
      throw new Error('Task não encontrada');
    }

    return { message: 'Status atualizado com sucesso' };
  }

  async associarSprint(id: number, id_sprint: number): Promise<any> {
    const query = 'UPDATE Tasks SET id_sprint = ? WHERE id = ?';
    const resultado = await this.mysqlService.query(query, [id_sprint, id]);

    if ((resultado as any).affectedRows === 0) {
      throw new Error('Task não encontrada');
    }

    return { message: 'Sprint associada com sucesso' };
  }
}
