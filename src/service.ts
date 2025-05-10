import { IUser } from './types/user';

class Service {
    private users: IUser[] = [];

    getAllUsers(): IUser[] {
        return this.users;
    }

    getUserById(id: string): IUser | undefined {
        return this.users.find(user => user.id === id);
    }
}

export const service = new Service(); 