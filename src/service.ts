import { IUser } from './types/user';

class Service {
    private users: IUser[] = [];

    getAllUsers(): IUser[] {
        return this.users;
    }

    getUserById(id: string): IUser | undefined {
        return this.users.find(user => user.id === id);
    }

    postUser(newUser: IUser): IUser {
        this.users.push(newUser);
        return newUser;
    }
}

export const service = new Service();
