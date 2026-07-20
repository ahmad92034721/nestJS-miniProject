import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { CreateHackathonDto } from './dto/create-hackathon.dto.js';
import { UpdateHackathonDto } from './dto/update-hackathon.dto.js';

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hackathon.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon ${id} not found`);
    }

    return hackathon;
  }

  create(authorId: string, createHackathonDto: CreateHackathonDto) {
    return this.prisma.hackathon.create({
      data: {
        name: createHackathonDto.name,
        description: createHackathonDto.description,
        startDate: createHackathonDto.startsAt,
        endDate: createHackathonDto.endsAt,
        isActive: createHackathonDto.isActive,
        authorId,
      },
    });
  }

  async update(id: string, updateHackathonDto: UpdateHackathonDto) {
    await this.findOne(id);

    return this.prisma.hackathon.update({
      where: { id },
      data: {
        name: updateHackathonDto.name,
        description: updateHackathonDto.description,
        startDate: updateHackathonDto.startsAt,
        endDate: updateHackathonDto.endsAt,
        isActive: updateHackathonDto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.hackathon.delete({
      where: { id },
    });
  }

  async join(id: string, userId: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon ${id} not found`);
    }

    if (!hackathon.isActive) {
      throw new BadRequestException('Hackathon is not active');
    }

    if (hackathon.endDate.getTime() <= Date.now()) {
      throw new BadRequestException('Hackathon has ended');
    }

    try {
      return await this.prisma.hackathonParticipant.create({
        data: {
          hackathonId: hackathon.id,
          userId,
        },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new BadRequestException('You have already joined this hackathon');
      }

      throw error;
    }
  }
}
