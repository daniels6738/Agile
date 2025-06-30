import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProjetosService } from './projetos.service';

@Controller('projetos')
export class ProjetosController {
  constructor(private readonly projetoService: ProjetosService) {}

  @Get()
  async listarProjetos() {
    return this.projetoService.listarProjetos();
  }

  @Get(':id')
  async buscarProjeto(@Param('id') id: string) {
    return this.projetoService.buscarProjetoPorId(Number(id));
  }

  @Post()
  async criarProjeto(@Body() body: { nome: string; descricao: string }) {
    return this.projetoService.criarProjeto(body.nome, body.descricao);
  }

  @Put(':id')
  async atualizarProjeto(
    @Param('id') id: string,
    @Body() body: { nome: string; descricao: string },
  ) {
    return this.projetoService.atualizarProjeto(
      Number(id),
      body.nome,
      body.descricao,
    );
  }

  @Delete(':id')
  async deletarProjeto(@Param('id') id: string) {
    return this.projetoService.deletarProjeto(Number(id));
  }
}
