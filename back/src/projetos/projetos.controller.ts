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

  @Get('listar-membros/:id_projeto')
  async listarMembrosDoProjeto(@Param('id_projeto') id_projeto: string) {
    return this.projetoService.listarMenbrosDoProjeto(Number(id_projeto));
  }
  @Get('listar-projetos/:id_usuario')
  async listarProjetosPorUsuario(@Param('id_usuario') id_usuario: string) {
    return this.projetoService.listarProjetosPorUsuario(Number(id_usuario));
  }

  @Post()
  async criarProjeto(
    @Body() body: { id_usuario: number; nome: string; descricao: string },
  ) {
    return this.projetoService.criarProjeto(
      body.id_usuario,
      body.nome,
      body.descricao,
    );
  }

  @Post('adicionar-Membro')
  async adicionarUsuariosNoProjeto(
    @Body()
    body: {
      id_projeto: number;
      id_usuario_admin: number;
      email: string;
      funcao: string;
    },
  ) {
    return this.projetoService.adicionarUsuarioNoProjeto(
      body.id_projeto,
      body.id_usuario_admin,
      body.email,
      body.funcao,
    );
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

  @Delete('excluir-membro/:id_projeto/:id_usuario_admin/:id_usuario')
  async excluirMembroDoProjeto(
    @Param('id_projeto') id_projeto: string,
    @Param('id_usuario_admin') id_usuario_admin: string,
    @Param('id_usuario') id_usuario: string,
  ) {
    return this.projetoService.excluirMembroProjeto(
      Number(id_projeto),
      Number(id_usuario_admin),
      Number(id_usuario),
    );
  }

  @Put('alterar-funcao/:id_projeto/:id_usuario_admin/:id_usuario')
  async alterarFuncaoMembro(
    @Param('id_projeto') id_projeto: string,
    @Param('id_usuario_admin') id_usuario_admin: string,
    @Param('id_usuario') id_usuario: string,
    @Body('nova_funcao') nova_funcao: string,
  ) {
    return this.projetoService.alterarFuncaoMembro(
      Number(id_projeto),
      Number(id_usuario_admin),
      Number(id_usuario),
      nova_funcao,
    );
  }

  @Get('membros-funcoes/:id_projeto')
  async listarMembrosComFuncoes(@Param('id_projeto') id_projeto: string) {
    return this.projetoService.listarMembrosComFuncoes(Number(id_projeto));
  }
}
