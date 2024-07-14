import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SigninUserDto, SignupUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.signup.user')
  signupUser(@Payload() signupUserDto: SignupUserDto) {
    return this.authService.signUpSave(signupUserDto);
  }
  @MessagePattern('auth.signin.user')
  signinUser(@Payload() signinUserDto: SigninUserDto) {
    return this.authService.signInSave(signinUserDto);
  }
  @MessagePattern('auth.verify.user')
  verifyToken(@Payload() token: string) {
    return this.authService.verifyToken(token);
  }
}
