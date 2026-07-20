import { Module } from '@nestjs/common';
import { HackathonController } from './hackathon.controller.js';
import { HackathonService } from './hackathon.service.js';
import { PrismaModule } from '../../lib/database/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [HackathonController],
  providers: [HackathonService],
})
export class HackathonModule {}
