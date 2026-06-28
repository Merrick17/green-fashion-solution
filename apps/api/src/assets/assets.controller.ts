import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Request,
  ForbiddenException,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateFabricAssetDto } from './dto/create-fabric-asset.dto';
import { CreateProductAssetDto } from './dto/create-product-asset.dto';
import { UpdateFabricAssetDto, UpdateProductAssetDto } from './dto/update-asset.dto';
import { ListAssetsQueryDto } from './dto/list-assets-query.dto';
import { UserRole } from '@repo/types';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('fabrics')
  createFabric(@Body() dto: CreateFabricAssetDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can upload fabrics');
    }
    return this.assetsService.createFabric(dto, req.user.id);
  }

  @Get('fabrics')
  findAllFabrics(
    @Query() query: ListAssetsQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.assetsService.findFabricsForRole(req.user.id, req.user.role, query);
  }

  @Get('fabrics/:id/stats')
  getFabricStats(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers and admins can view stats');
    }
    return this.assetsService.getFabricStats(id);
  }

  @Get('fabrics/:id')
  findFabric(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.assetsService.findFabricByIdForRole(id, req.user.id, req.user.role);
  }

  @Patch('fabrics/:id')
  updateFabric(
    @Param('id') id: string,
    @Body() dto: UpdateFabricAssetDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can update fabrics');
    }
    return this.assetsService.updateFabric(id, dto, req.user.id, req.user.role);
  }

  @Delete('fabrics/:id')
  removeFabric(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can delete fabrics');
    }
    return this.assetsService.removeFabric(id, req.user.id, req.user.role);
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductAssetDto, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can upload products');
    }
    return this.assetsService.createProduct(dto, req.user.id);
  }

  @Get('products')
  findAllProducts(
    @Query() query: ListAssetsQueryDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    return this.assetsService.findProductsForRole(req.user.id, req.user.role, query);
  }

  @Get('products/:id/stats')
  getProductStats(@Param('id') id: string, @Request() req: { user: { role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers and admins can view stats');
    }
    return this.assetsService.getProductStats(id);
  }

  @Get('products/:id')
  findProduct(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.assetsService.findProductByIdForRole(id, req.user.id, req.user.role);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductAssetDto,
    @Request() req: { user: { id: string; role: string } },
  ) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can update products');
    }
    return this.assetsService.updateProduct(id, dto, req.user.id, req.user.role);
  }

  @Delete('products/:id')
  removeProduct(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== UserRole.DESIGNER && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only designers can delete products');
    }
    return this.assetsService.removeProduct(id, req.user.id, req.user.role);
  }
}
