import { Controller, Post, Body, HttpCode } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token)
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() body: { refresh_token: string }) {
    return this.authService.logout(body.refresh_token)
  }
}