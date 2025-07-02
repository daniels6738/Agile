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

  @Get(':id')
  async listarVotosPlanningPoker(@Param('id') id: string) {
    return this.planningPokerService.listarVotosDaTaskPlanningPoker(Number(id));
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

  @Post('concluir/:id_task')
  concluir(@Param('id_task', ParseIntPipe) id_task: number) {
    return this.planningPokerService.concluirVotacaoPLanningPoker(id_task);
  }
}
