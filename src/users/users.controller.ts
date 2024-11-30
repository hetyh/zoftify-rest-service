import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ByIdParams } from './dto/by-id-user.dto.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: ByIdParams) {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  update(@Param() params: ByIdParams, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param() params: ByIdParams) {
    return this.usersService.remove(params.id);
  }
}
