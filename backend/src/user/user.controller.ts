import { Controller, Get, UseGuards, Req }from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../auth/jwt.guard';
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {

  constructor(private userService: UserService) { }
  @Get()
  findAll() {
    return this.userService.findAll()
  }
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }
}