import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class PlanningPokerService {
  constructor(private readonly mysqlService: MysqlService) {}

  async listarVotosDaTaskPlanningPoker(id_task: number): Promise<number> {
    const sql =
      'SELECT COUNT(*) as quantidade FROM VotosPlanningPoker WHERE id_task = ?';
    const resultado = await this.mysqlService.query(sql, [id_task]);
    return resultado[0]?.quantidade || 0;
  }

  async votarPLanningPoker(
    id_task: number,
    id_usuario: number,
    valor_voto: number,
  ) {
    try {
      await this.mysqlService.query(
        `INSERT INTO VotosPlanningPoker (id_task, id_usuario, valor_voto)
       VALUES (?, ?, ?)`,
        [id_task, id_usuario, valor_voto],
      );
      return { message: 'Voto registrado com sucesso.' };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Usuário já votou nesta task.');
      }
      throw new InternalServerErrorException('Erro ao registrar voto.');
    }
  }

  async concluirVotacaoPLanningPoker(id_task: number) {
    const votos = await this.mysqlService.query<{ valor_voto: number }>(
      'SELECT valor_voto FROM VotosPlanningPoker WHERE id_task = ?',
      [id_task],
    );

    if (votos.length === 0) {
      throw new BadRequestException('Nenhum voto encontrado para esta task.');
    }

    const soma = votos.reduce((total, voto) => total + voto.valor_voto, 0);
    const media = soma / votos.length;

    await this.mysqlService.query(
      'UPDATE Tasks SET pontuacao = ? WHERE id = ?',
      [media.toFixed(1), id_task],
    );

    return {
      message: 'Planning Poker concluído.',
      media: parseFloat(media.toFixed(1)),
    };
  }
}
