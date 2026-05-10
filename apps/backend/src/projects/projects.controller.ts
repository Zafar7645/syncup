/**
 * @file projects.controller.ts
 * @description HTTP controller for project routes (/projects). All routes are protected
 * by JwtAuthGuard. The authenticated user's ID is extracted from req.user and passed
 * to the service so ownership is enforced at the data layer.
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ProjectsService } from '@/projects/projects.service';
import { CreateProjectDto } from '@/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@/projects/dto/update-project.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: number; email: string } }) {
    return this.projectsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.projectsService.remove(id, req.user.userId);
  }
}
