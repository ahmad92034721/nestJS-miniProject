import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard, Roles } from '@thallesp/nestjs-better-auth';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import { UpdateHackathonDto } from './dto/update-hackathon.dto.js';
import { HackathonService } from './hackathon.service.js';

type AuthenticatedRequest = ExpressRequest & {
  user?: {
    id: string;
  };
};

@UseGuards(AuthGuard)
@Controller('hackathon')
export class HackathonController {
  constructor(private readonly hackathonService: HackathonService) {}

  @Get()
  findAll() {
    return this.hackathonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackathonService.findOne(id);
  }

  @Roles(['admin'])
  @ResponseMessage('Hackathon created')
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createHackathonDto: CreateHackathonDto,
  ) {
    const authorId = req.user?.id;

    if (!authorId) {
      throw new UnauthorizedException();
    }

    return this.hackathonService.create(authorId, createHackathonDto);
  }

  @Roles(['admin'])
  @ResponseMessage('Hackathon updated')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHackathonDto: UpdateHackathonDto,
  ) {
    return this.hackathonService.update(id, updateHackathonDto);
  }

  @Roles(['admin'])
  @ResponseMessage('Hackathon deleted')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hackathonService.remove(id);
  }

  @Roles(['participant'])
  @ResponseMessage('Joined hackathon')
  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return this.hackathonService.join(id, userId);
  }
}
