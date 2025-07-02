import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { NikoNikoService } from './nikoNiko.service';

@Controller('nikoNiko')
export class NikoNikoController {
  constructor(private readonly nikoNikoService: NikoNikoService) {}

  @Get()
  async listarNikoNiko() {
    return this.nikoNikoService.listarNinoNiKO();
  }

  @Get(':id')
  async buscarNikoNiko(@Param('id') id: string) {
    return this.nikoNikoService.buscarNikoNikoPorId(Number(id));
  }

  @Post()
  async criarNikoNiko(
    @Body()
    body: {
      id_usuario: number;
      id_projeto: number;
      mood: string;
      entry_date: string;
    },
  ) {
    return this.nikoNikoService.criarNikoNiko(
      body.id_usuario,
      body.id_projeto,
      body.mood,
      body.entry_date,
    );
  }

  @Put(':id')
  async atualizarNikoNiko(
    @Param('id') id: string,
    @Body()
    body: {
      id_usuario: number;
      id_projeto: number;
      mood: string;
      entry_date: string;
    },
  ) {
    return this.nikoNikoService.atualizarNikoNiko(
      Number(id),
      body.id_usuario,
      body.id_projeto,
      body.mood,
      body.entry_date,
    );
  }

  @Delete(':id')
  async deletarNikoNiko(@Param('id') id: string) {
    return this.nikoNikoService.deletarNikoNiko(Number(id));
  }
}
