import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller('usuarios')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async listarUsuarios() {
    return this.appService.listarUsuarios();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.appService.buscarUsuarioPorId(Number(id));
  }

  @Post()
  async cadastrarUsuario(
    @Body() body: { nome: string; email: string; senha: string },
  ) {
    return this.appService.criarUsuario(body.nome, body.email, body.senha);
  }

  @Put(':id')
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() body: { nome: string; email: string },
  ) {
    return this.appService.atualizarUsuario(Number(id), body.nome, body.email);
  }

  @Delete(':id')
  async deletar(@Param('id') id: string) {
    return this.appService.deletarUsuario(Number(id));
  }
}
