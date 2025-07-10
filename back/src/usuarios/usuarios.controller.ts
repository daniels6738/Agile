import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsuarioService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly UsuarioService: UsuarioService) {}

  @Get()
  async listarUsuarios() {
    return this.UsuarioService.listarUsuarios();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.UsuarioService.buscarUsuarioPorId(Number(id));
  }

  @Post('cadastrar')
  async cadastrarUsuario(
    @Body() body: { nome: string; email: string; password: string },
  ) {
    return this.UsuarioService.criarUsuario(
      body.nome,
      body.email,
      body.password,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.UsuarioService.login(body.email, body.password);
  }

  @Put(':id')
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() body: { nome: string; email: string },
  ) {
    return this.UsuarioService.atualizarUsuario(
      Number(id),
      body.nome,
      body.email,
    );
  }

  @Delete(':id')
  async deletar(@Param('id') id: string) {
    return this.UsuarioService.deletarUsuario(Number(id));
  }

  @Get('buscar-por-nome-ou-email/:query')
  async buscarPorNomeOuEmail(@Param('query') query: string) {
    return this.UsuarioService.buscarPorNomeOuEmail(query);
  }
}
