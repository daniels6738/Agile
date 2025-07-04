import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SprintsService } from './sprints.service';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Get()
  async listar() {
    return this.sprintsService.listarSprints();
  }

  @Get('buscar-sprint/:id_sprint')
  async buscar(@Param('id_sprint') id_sprint: string) {
    return this.sprintsService.buscarSprintPorId(Number(id_sprint));
  }
  @Get('buscar-sprints-projeto/:id_projeto')
  async buscarSprintsDoProjeto(@Param('id_projeto') id_projeto: string) {
    return this.sprintsService.buscarSprintsDoProjeto(Number(id_projeto));
  }
  @Get('buscar-sprint-atual/:id_projeto')
  async buscarSprintAtualDeUmProjeto(@Param('id_projeto') id_projeto: string) {
    return this.sprintsService.buscarSprintAtualDeUmProjeto(Number(id_projeto));
  }
  @Get('estatistica-usuario/:id_sprint/:id_usuario')
  async somarPontuacaoSprint(
    @Param('id_sprint') id_sprint: string,
    @Param('id_usuario') id_usuario: string,
  ) {
    return this.sprintsService.somarPontuacaoPorUsuarioNaSprint(
      Number(id_sprint),
      Number(id_usuario),
    );
  }

  @Post()
  async criar(
    @Body()
    body: {
      id_projeto: number;
      nome: string;
      data_inicio: string;
      data_fim: string;
    },
  ) {
    const { id_projeto, nome, data_inicio, data_fim } = body;
    return this.sprintsService.criarSprint(
      id_projeto,
      nome,
      data_inicio,
      data_fim,
    );
  }

  @Put(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: { nome: string; data_inicio: string; data_fim: string },
  ) {
    const { nome, data_inicio, data_fim } = body;
    return this.sprintsService.atualizarSprint(
      Number(id),
      nome,
      data_inicio,
      data_fim,
    );
  }

  @Delete(':id')
  async deletar(@Param('id') id: string) {
    return this.sprintsService.deletarSprint(Number(id));
  }
}
