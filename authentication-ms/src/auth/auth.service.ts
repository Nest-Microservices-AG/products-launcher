import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { SigninUserDto, SignupUserDto } from '../auth/dto/';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log('MongoDB connected');
  }

  async signUpSave(signupUserDto: SignupUserDto) {
    const { name, email, password } = signupUserDto;
    try {
      const checkUserDB = await this.findUser(email);

      if (checkUserDB) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const user = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });

      delete user.password;
      return {
        user,
        token: await this.generateJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async signInSave(signinUserDto: SigninUserDto) {
    const { email, password } = signinUserDto;
    try {
      const user = await this.findUser(email);

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User not found',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'invalid Credentials',
        });
      }
      delete user.password;
      return {
        user,
        token: await this.generateJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async findUser(email: string) {
    const findUser = await this.user.findUnique({
      where: {
        email: email,
      },
    });
    return findUser;
  }

  async generateJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const { iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      return {
        iat,
        exp,
        user,
        token: await this.generateJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 401,
        message: 'Token not valid',
      });
    }
  }
}
