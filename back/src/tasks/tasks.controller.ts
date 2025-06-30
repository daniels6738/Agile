import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
}
