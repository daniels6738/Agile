import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BurndownService } from './burndown.service';

@Controller('burndown')
export class BurndownController {
  constructor(private readonly burndownService: BurndownService) {}

  @Post('criar')
  async criarBurnDown(
    @Body() body: { id_sprint: number; width: number; height: number },
  ) {
    console.log('entrou : ', body.id_sprint, body.width, body.height);
    return this.burndownService.gerarBurndown(
      body.id_sprint,
      body.width,
      body.height,
    );
  }

  @Get('buscar/:id_sprint')
  async buscarBurnDown(@Param('id_sprint') id_sprint: string) {
    return this.burndownService.buscarBurnDown(Number(id_sprint));
  }

  @Delete('excluir/:id_sprint')
  async excluirBurnDown(@Param('id_sprint') id_sprint: string) {
    return this.burndownService.deletarBurnDown(Number(id_sprint));
  }
}
