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
import { NikoNikoController } from './nikoNiko/nikoNiko.controller';
import { NikoNikoService } from './nikoNiko/nikoNiko.service';
import { PlanningPokerService } from './planningPoker/planningPoker.service';
import { PlanningPokerController } from './planningPoker/planningPoker.controller';
import { BurndownController } from './burndown/burndown.controller';
import { BurndownService } from './burndown/burndown.service';

@Module({
  imports: [],
  controllers: [
    UsuariosController,
    ProjetosController,
    SprintsController,
    TasksController,
    NikoNikoController,
    PlanningPokerController,
    BurndownController,
  ],
  providers: [
    UsuarioService,
    MysqlService,
    ProjetosService,
    SprintsService,
    TasksService,
    NikoNikoService,
    PlanningPokerService,
    BurndownService,
  ],
})
export class AppModule {}
