import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { UsersService } from './users.service.js'
import { JwtAuthGuard } from '../auth/jwt.guard.js'
import { Roles, Role } from '../common/decorators/roles.decorator.js'
import { RolesGuard } from '../common/guards/roles.guard.js'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOkResponse({ description: 'List users' })
  list() { return this.users.list() }

  @Patch(':id/role')
  @ApiOkResponse({ description: 'Update user role' })
  setRole(@Param('id') id: string, @Body() body: { role: Role }) { return this.users.setRole(id, body.role) }
}

