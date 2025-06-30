import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios/usuarios.controller';
import { UsuarioService } from './usuarios/usuarios.service';
import { MysqlService } from './db/app.mysql.service';
import { ProjetosService } from './projetos/projetos.service';
import { ProjetosController } from './projetos/projetos.controller';
import { SprintsController } from './sprints/sprints.controller';
import { SprintsService } from './sprints/sprints.service';
import { TasksService } from './tasks/tasks.service';
import { TasksController } from './tasks/tasks.controller';

@Module({
  imports: [],
  controllers: [
    UsuariosController,
    ProjetosController,
    SprintsController,
    TasksController,
  ],
  providers: [
    UsuarioService,
    MysqlService,
    ProjetosService,
    SprintsService,
    TasksService,
  ],
})
export class AppModule {}
