import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async listar() {
    return this.tasksService.listarTasks();
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.tasksService.buscarTaskPorId(Number(id));
  }

  @Get('buscar-tasks-sprint/:id_sprint/:id_projeto')
  async buscarTasksPorSprint(
    @Param('id_sprint') id_sprint: string,
    @Param('id_projeto') id_projeto: string,
  ) {
    return this.tasksService.buscarTaskPorSprintDeUmProjeto(
      Number(id_sprint),
      Number(id_projeto),
    );
  }

  @Post()
  async criar(
    @Body()
    body: {
      id_projeto: number;
      id_sprint?: number;
      id_responsavel?: number;
      titulo: string;
      descricao?: string;
      status?: string;
      pontuacao?: number;
    },
  ) {
    return this.tasksService.criarTask(body);
  }

  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body()
    body: {
      titulo?: string;
      descricao?: string;
      status?: string;
      pontuacao?: number;
      id_sprint?: number;
      id_responsavel?: number;
    },
  ) {
    return this.tasksService.atualizarTask(Number(id), body);
  }

  @Delete(':id')
  async deletar(@Param('id') id: string) {
    return this.tasksService.deletarTask(Number(id));
  }

  @Patch(':id/status')
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.tasksService.atualizarStatus(Number(id), status);
  }

  @Patch(':id/sprint')
  async associarSprint(
    @Param('id') id: string,
    @Body('id_sprint') id_sprint: number,
  ) {
    return this.tasksService.associarSprint(Number(id), id_sprint);
  }
}
