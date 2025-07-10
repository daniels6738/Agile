import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MysqlService } from '../db/app.mysql.service';
import * as bcrypt from 'bcrypt';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  data_criacao: string;
}

@Injectable()
export class UsuarioService {
  constructor(private readonly mysqlService: MysqlService) {}

  //CRUDS Usuario
  async listarUsuarios(): Promise<any> {
    const sql = 'SELECT * FROM Usuarios';
    return this.mysqlService.query(sql);
  }

  async buscarUsuarioPorId(id: number): Promise<any> {
    const sql = 'SELECT * FROM Usuarios WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async login(email: string, senha: string) {
    const resultado = await this.mysqlService.query<Usuario>(
      'SELECT * FROM Usuarios WHERE email = ?',
      [email],
    );

    if (resultado.length === 0) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const usuario = resultado[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const { senha_hash, ...usuarioSemSenha } = usuario;
    return usuario;
  }

  async criarUsuario(
    nome: string,
    email: string,
    senha_hash: string,
  ): Promise<any> {
    const senhaHash = await bcrypt.hash(senha_hash, 10);
    const sql =
      'INSERT INTO Usuarios (nome, email, senha_hash) VALUES (?, ?, ?)';
    return this.mysqlService.query(sql, [nome, email, senhaHash]);
  }

  async atualizarUsuario(
    id: number,
    nome: string,
    email: string,
  ): Promise<any> {
    const sql = 'UPDATE Usuarios SET nome = ?, email = ? WHERE id = ?';
    return this.mysqlService.query(sql, [nome, email, id]);
  }

  async deletarUsuario(id: number): Promise<any> {
    const sql = 'DELETE FROM Usuarios WHERE id = ?';
    return this.mysqlService.query(sql, [id]);
  }

  async buscarPorNomeOuEmail(query: string): Promise<any> {
    const sql = `SELECT id, nome, email FROM Usuarios WHERE nome LIKE ? OR email LIKE ? LIMIT 10`;
    const likeQuery = `%${query}%`;
    return this.mysqlService.query(sql, [likeQuery, likeQuery]);
  }
}
