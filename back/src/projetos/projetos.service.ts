import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';

@Injectable()
export class ProjetosService {
  constructor(private readonly mysqlService: MysqlService) {}

  // Funções válidas para membros de projeto
  private readonly validFuncoes = ['Admin', 'Membro', 'Developer', 'Designer', 'Tester'];

  // CRUDS projetos

  async listarProjetos(): Promise<any> {
    const sql = 'SELECT * FROM Projetos';
    return this.mysqlService.query(sql);
  }

  async buscarProjetoPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM Projetos WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async listarMenbrosDoProjeto(id: number): Promise<any> {
    return this.mysqlService.query(
      `
    SELECT u.id, u.nome 
    FROM ProjectMembers pm
    JOIN Usuarios u ON u.id = pm.id_usuario
    WHERE pm.id_projeto = ?
    `,
      [id],
    );
  }
  // Lista todos os projetos dos quais o usuário é membro
  async listarProjetosPorUsuario(id_usuario: number): Promise<any> {
    const sql = `
    SELECT 
      p.id,
      p.nome,
      pm.funcao AS funcao, 
      (
        SELECT COUNT(*) 
        FROM ProjectMembers 
        WHERE id_projeto = p.id
      ) AS membersCount
    FROM Projetos p
    INNER JOIN ProjectMembers pm ON p.id = pm.id_projeto
    WHERE pm.id_usuario = ?
  `;
    return this.mysqlService.query(sql, [id_usuario]);
  }

  async criarProjeto(
    id_usuario: number,
    nome: string,
    descricao: string,
  ): Promise<any> {
    const idProjeto = await this.mysqlService.insert(
      'INSERT INTO Projetos (nome, descricao) VALUES (?, ?)',
      [nome, descricao],
    );

    await this.mysqlService.query(
      'INSERT INTO ProjectMembers (id_projeto, id_usuario, funcao) VALUES (?, ?, ?)',
      [idProjeto, id_usuario, 'Admin'],
    );

    return { message: 'Projeto criado com sucesso', idProjeto };
  }

  async adicionarUsuarioNoProjeto(
    id_projeto: number,
    id_usuario_admin: number,
    email: string,
    funcao: string,
  ): Promise<any> {
    // Validação da função
    if (!this.validFuncoes.includes(funcao)) {
      return { message: 'Função inválida. Use Admin, Membro, Developer, Designer ou Tester.' };
    }
    const result = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ? AND funcao = ?',
      [id_projeto, id_usuario_admin, 'Admin'],
    );
    if (result.length === 0) {
      return { message: 'projeto não existe ou usuario não é admin' };
    }
    const [usuario] = await this.mysqlService.query(
      'SELECT id FROM Usuarios WHERE email = ?',
      [email],
    );
    if (!usuario) {
      return { message: 'Usuário com esse email não encontrado' };
    }
    // Insere ou atualiza a função do membro
    const exists = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ?',
      [id_projeto, usuario.id],
    );
    if (exists.length > 0) {
      // Atualiza a função se já existe
      await this.mysqlService.query(
        'UPDATE ProjectMembers SET funcao = ? WHERE id_projeto = ? AND id_usuario = ?',
        [funcao, id_projeto, usuario.id],
      );
      return { message: 'Função do membro atualizada com sucesso' };
    } else {
      // Insere novo membro
      return this.mysqlService.query(
        'INSERT INTO ProjectMembers (id_projeto, id_usuario, funcao) VALUES (?, ?, ?)',
        [id_projeto, usuario.id, funcao],
      );
    }
  }

  async atualizarProjeto(
    id: number,
    nome: string,
    descricao: string,
  ): Promise<any> {
    const sql = 'UPDATE Projetos SET nome = ?, descricao = ? WHERE id = ?';
    return this.mysqlService.query(sql, [nome, descricao, id]);
  }

  async deletarProjeto(id: number): Promise<any> {
    const sql = 'DELETE FROM Projetos WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async excluirMembroProjeto(
    id_projeto: number,
    id_usuario_admin: number,
    id_usuario: number,
  ): Promise<any> {
    const result = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ? AND funcao = ?',
      [id_projeto, id_usuario_admin, 'Admin'],
    );
    if (result.length === 0) {
      return { message: 'projeto não existe ou usuario não é admin' };
    }
    const sql =
      'DELETE FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ?';
    return this.mysqlService.query(sql, [id_projeto, id_usuario]);
  }

  async alterarFuncaoMembro(
    id_projeto: number,
    id_usuario_admin: number,
    id_usuario: number,
    nova_funcao: string,
  ): Promise<any> {
    // Validação da função
    if (!this.validFuncoes.includes(nova_funcao)) {
      return { message: 'Função inválida. Use Admin, Membro, Developer, Designer ou Tester.' };
    }
    // Verifica se o admin é realmente admin do projeto
    const result = await this.mysqlService.query(
      'SELECT * FROM ProjectMembers WHERE id_projeto = ? AND id_usuario = ? AND funcao = ?',
      [id_projeto, id_usuario_admin, 'Admin'],
    );
    if (result.length === 0) {
      return { message: 'projeto não existe ou usuario não é admin' };
    }
    // Atualiza a função do membro
    const sql =
      'UPDATE ProjectMembers SET funcao = ? WHERE id_projeto = ? AND id_usuario = ?';
    await this.mysqlService.query(sql, [nova_funcao, id_projeto, id_usuario]);
    return { message: 'Função do membro atualizada com sucesso' };
  }

  async listarMembrosComFuncoes(id_projeto: number): Promise<any> {
    // Retorna todos os membros do projeto com suas funções
    const sql = `
      SELECT u.id, u.nome, pm.funcao
      FROM ProjectMembers pm
      JOIN Usuarios u ON u.id = pm.id_usuario
      WHERE pm.id_projeto = ?
    `;
    return this.mysqlService.query(sql, [id_projeto]);
  }
}
