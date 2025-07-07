import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import * as dayjs from 'dayjs';
import { ChartConfiguration } from 'chart.js';

@Injectable()
export class BurndownService {
  constructor(private readonly mysqlService: MysqlService) {}

  async gerarBurndown(
    id_sprint: number,
    width: number,
    height: number,
  ): Promise<{ message: string; image: string }> {
    // Buscar dados da sprint
    const [sprint] = await this.mysqlService.query(
      'SELECT nome, data_inicio, data_fim FROM Sprints WHERE id = ?',
      [id_sprint],
    );

    if (!sprint) {
      return { message: 'Sprint não encontrada', image: '' };
    }

    const nomeSprint = sprint.nome;
    const inicio = dayjs(sprint.data_inicio);
    const fim = dayjs(sprint.data_fim);
    const diasSprint = fim.diff(inicio, 'day');

    // Total de pontos da sprint
    const [{ total }] = await this.mysqlService.query(
      'SELECT SUM(pontuacao) as total FROM Tasks WHERE id_sprint = ?',
      [id_sprint],
    );

    if (total === 0) {
      return { message: 'Sprint sem pontuação de tasks definidas', image: '' };
    }
    const pontosTotais = Number(total || 0);

    // Buscar tasks concluídas
    const concluidas = await this.mysqlService.query(
      `SELECT data_atualizacao, pontuacao FROM Tasks 
       WHERE id_sprint = ? AND status = 'Concluído'`,
      [id_sprint],
    );

    //Calcular progresso real (quantos pontos restam por dia)
    const progressoPorDia: Record<string, number> = {};
    for (let i = 0; i <= diasSprint; i++) {
      const dia = inicio.add(i, 'day').format('YYYY-MM-DD');
      progressoPorDia[dia] = 0;
    }

    for (const task of concluidas) {
      const data = dayjs(task.data_atualizacao).format('YYYY-MM-DD');
      if (progressoPorDia[data] !== undefined) {
        progressoPorDia[data] += Number(task.pontuacao);
      }
    }

    const progresso: number[] = [];
    let restante = pontosTotais;
    for (let i = 0; i <= diasSprint; i++) {
      const dia = inicio.add(i, 'day').format('YYYY-MM-DD');
      restante -= progressoPorDia[dia] || 0;
      progresso.push(restante < 0 ? 0 : Number(restante.toFixed(1)));
    }

    // Calcular linha ideal
    const ideal: number[] = Array.from({ length: diasSprint + 1 }, (_, i) =>
      Number((pontosTotais * ((diasSprint - i) / diasSprint)).toFixed(1)),
    );

    // Gerar gráfico
    const canvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: 'white',
    });
    const labels = Array.from({ length: diasSprint + 1 }, (_, i) =>
      inicio.add(i, 'day').format('DD/MM'),
    );

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Ideal',
            data: ideal,
            borderColor: 'blue',
            fill: false,
            tension: 0.0,
          },
          {
            label: 'Real',
            data: progresso,
            borderColor: 'red',
            fill: false,
            tension: 0.0,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Gráfico de Burndown - ${nomeSprint}`,
          },
        },
      },
    };

    const image = await canvas.renderToDataURL(config);

    //  Salvar no banco
    const [burndownExiste] = await this.mysqlService.query(
      'SELECT * FROM GraficosBurndown WHERE id_sprint = ?',
      [id_sprint],
    );

    //se a sprint não tiver o grafico
    if (!burndownExiste) {
      await this.mysqlService.query(
        `INSERT INTO GraficosBurndown 
      (id_sprint, nome_sprint, dias_sprint, pontos_totais, progresso_json, imagem_base64)
      VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id_sprint,
          nomeSprint,
          diasSprint,
          pontosTotais,
          JSON.stringify(progresso),
          image,
        ],
      );

      return {
        message: 'Gráfico gerado e salvo com sucesso.',
        image,
      };
    }
    //se a sprint ja tiver o grafico
    else {
      await this.mysqlService.query(
        `UPDATE GraficosBurndown SET
      id_sprint = ?, nome_sprint = ?, dias_sprint = ?, pontos_totais = ?, progresso_json = ?, imagem_base64 = ? WHERE id = ?
      `,
        [
          id_sprint,
          nomeSprint,
          diasSprint,
          pontosTotais,
          JSON.stringify(progresso),
          image,
          burndownExiste.id,
        ],
      );

      return {
        message: 'Gráfico atualizado e salvo com sucesso.',
        image,
      };
    }
  }
  async buscarBurnDown(id_sprint: number): Promise<any> {
    const sql = 'SELECT * FROM GraficosBurndown WHERE id_sprint = ?';
    return this.mysqlService.query(sql, [id_sprint]);
  }

  async deletarBurnDown(id_sprint: number): Promise<any> {
    const sql = 'DELETE FROM GraficosBurndown WHERE id_sprint = ?';
    return this.mysqlService.query(sql, [id_sprint]);
  }
}
