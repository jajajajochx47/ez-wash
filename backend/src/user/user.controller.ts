import { Controller, Get, UseGuards, Req }from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../auth/jwt.guard';
@Controller('users')
export class UserController {

  constructor(private userService: UserService) { }
  @Get()
  findAll() {
    return this.userService.findAll()
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }
}