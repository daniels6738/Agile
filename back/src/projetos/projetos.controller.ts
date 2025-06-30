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
  constructor(private readonly appService: ProjetosService) {}

  @Get()
  async listarProjetos() {
    return this.appService.listarProjetos();
  }

  @Get(':id')
  async buscarProjeto(@Param('id') id: string) {
    return this.appService.buscarProjetoPorId(Number(id));
  }

  @Post()
  async criarProjeto(@Body() body: { nome: string; descricao: string }) {
    return this.appService.criarProjeto(body.nome, body.descricao);
  }

  @Put(':id')
  async atualizarProjeto(
    @Param('id') id: string,
    @Body() body: { nome: string; descricao: string },
  ) {
    return this.appService.atualizarProjeto(
      Number(id),
      body.nome,
      body.descricao,
    );
  }

  @Delete(':id')
  async deletarProjeto(@Param('id') id: string) {
    return this.appService.deletarProjeto(Number(id));
  }
}
