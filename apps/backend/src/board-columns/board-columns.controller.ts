/**
 * @file board-columns.controller.ts
 * @description HTTP controller for board column routes (/board-columns). All routes
 * require JWT authentication. The GET list route accepts a required `projectId` query
 * parameter and returns columns with their tasks already embedded, enabling the
 * Kanban board to load in a single HTTP request.
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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BoardColumnsService } from '@/board-columns/board-columns.service';
import { CreateBoardColumnDto } from '@/board-columns/dto/create-board-column.dto';
import { UpdateBoardColumnDto } from '@/board-columns/dto/update-board-column.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('board-columns')
export class BoardColumnsController {
  constructor(private readonly boardColumnsService: BoardColumnsService) {}

  @Post()
  create(
    @Body() createBoardColumnDto: CreateBoardColumnDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.boardColumnsService.create(
      createBoardColumnDto,
      req.user.userId,
    );
  }

  @Get()
  findAll(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.boardColumnsService.findAll(projectId, req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.boardColumnsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoardColumnDto: UpdateBoardColumnDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.boardColumnsService.update(
      id,
      updateBoardColumnDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.boardColumnsService.remove(id, req.user.userId);
  }
}
