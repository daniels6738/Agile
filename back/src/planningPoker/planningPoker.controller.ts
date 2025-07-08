import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PlanningPokerService } from './planningPoker.service';

@Controller('planning-poker')
export class PlanningPokerController {
  constructor(private readonly planningPokerService: PlanningPokerService) {}

  @Get(':id_task')
  async listarVotosPlanningPoker(@Param('id_task') id_task: string) {
    console.log('entrou: ', Number(id_task));
    const quantidade =
      await this.planningPokerService.listarVotosDaTaskPlanningPoker(
        Number(id_task),
      );
    return { quantidade };
  }

  @Post('votar')
  votar(
    @Body() body: { id_task: number; id_usuario: number; valor_voto: number },
  ) {
    return this.planningPokerService.votarPLanningPoker(
      body.id_task,
      body.id_usuario,
      body.valor_voto,
    );
  }

  @Get('concluir/:id_task')
  concluir(@Param('id_task') id_task: String) {
    return this.planningPokerService.concluirVotacaoPLanningPoker(
      Number(id_task),
    );
  }
}
