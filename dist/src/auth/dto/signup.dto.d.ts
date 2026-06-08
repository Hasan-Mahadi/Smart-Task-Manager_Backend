import { Role } from '../../common/enums/role.enum';
export declare class SignupDto {
    name: string;
    email: string;
    password: string;
    role?: Role;
}
