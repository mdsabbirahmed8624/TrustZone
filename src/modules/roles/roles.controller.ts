import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('write:settings')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto) {
    return {
      success: true,
      data: await this.rolesService.create(dto),
    };
  }

  @Get()
  @Permissions('read:settings')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return {
      success: true,
      data: await this.rolesService.findAll(),
    };
  }

  @Get(':id')
  @Permissions('read:settings')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.rolesService.findOne(id),
    };
  }

  @Put(':id')
  @Permissions('write:settings')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return {
      success: true,
      data: await this.rolesService.update(id, dto),
    };
  }

  @Delete(':id')
  @Permissions('write:settings')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return {
      success: true,
      message: 'Role deleted successfully.',
    };
  }
}
