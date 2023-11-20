import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' })
    }

    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUserByEmail(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }

        if (!user.activatedAccount) {
            throw new ForbiddenException();
        }
        return user;
    }
}
