import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  AddCollectionItemDto,
  ReorderCollectionItemsDto,
} from './dto/collection.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UserRole } from '@repo/types';
import { Roles } from '../common/decorators';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    const designerId = req.user.role === UserRole.DESIGNER ? req.user.id : null;
    return this.collectionsService.findAll(req.user.role, designerId, query);
  }

  @Get(':id')
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.collectionsService.findById(id, req.user.id, req.user.role);
  }

  @Post()
  @Roles(UserRole.DESIGNER)
  create(@Body() dto: CreateCollectionDto, @Request() req: { user: { id: string } }) {
    return this.collectionsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.DESIGNER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.collectionsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.DESIGNER)
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.collectionsService.remove(id, req.user.id);
  }

  @Post(':id/items')
  @Roles(UserRole.DESIGNER)
  addItem(
    @Param('id') id: string,
    @Body() dto: AddCollectionItemDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.collectionsService.addItem(id, dto, req.user.id);
  }

  @Post(':id/items/reorder')
  @Roles(UserRole.DESIGNER)
  reorderItems(
    @Param('id') id: string,
    @Body() dto: ReorderCollectionItemsDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.collectionsService.reorderItems(id, dto, req.user.id);
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.DESIGNER)
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.collectionsService.removeItem(id, itemId, req.user.id);
  }
}
