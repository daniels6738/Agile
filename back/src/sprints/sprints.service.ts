import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class SprintsService {
  constructor(private readonly mysqlService: MysqlService) {}

  //CRUDS sprints
  async listarSprints() {
    return this.mysqlService.query('SELECT * FROM Sprints');
  }

  async buscarSprintPorId(id: number) {
    return this.mysqlService.query('SELECT * FROM Sprints WHERE id = ?', [id]);
  }
  async buscarSprintAtualDeUmProjeto(id_projeto: number): Promise<any> {
    const sql = `
    SELECT * FROM Sprints
    WHERE id_projeto = ?
      AND CURDATE() BETWEEN data_inicio AND data_fim
    LIMIT 1
  `;
    const [sprintAtual] = await this.mysqlService.query(sql, [id_projeto]);
    return sprintAtual || null;
  }

  async buscarSprintsDoProjeto(id_projeto: number) {
    return this.mysqlService.query(
      'SELECT * FROM Sprints WHERE id_projeto = ?',
      [id_projeto],
    );
  }

  async criarSprint(
    id_projeto: number,
    nome: string,
    data_inicio: string,
    data_fim: string,
  ) {
    const sql = `
      INSERT INTO Sprints (id_projeto, nome, data_inicio, data_fim)
      VALUES (?, ?, ?, ?)
    `;
    return this.mysqlService.query(sql, [
      id_projeto,
      nome,
      data_inicio,
      data_fim,
    ]);
  }

  async atualizarSprint(
    id: number,
    nome: string,
    data_inicio: string,
    data_fim: string,
  ) {
    const sql = `
      UPDATE Sprints
      SET nome = ?, data_inicio = ?, data_fim = ?
      WHERE id = ?
    `;
    return this.mysqlService.query(sql, [nome, data_inicio, data_fim, id]);
  }

  async deletarSprint(id: number) {
    return this.mysqlService.query('DELETE FROM Sprints WHERE id = ?', [id]);
  }

  async somarPontuacaoPorUsuarioNaSprint(
    id_sprint: number,
    id_usuario: number,
  ): Promise<{ total: number }> {
    const [resultado] = await this.mysqlService.query(
      `SELECT SUM(pontuacao) as total
     FROM Tasks
     WHERE id_sprint = ? AND id_responsavel = ?`,
      [id_sprint, id_usuario],
    );

    return {
      total: Number(resultado?.total ?? 0),
    };
  }
}
