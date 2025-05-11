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

    deleteUser(id: string): boolean {
        const initialLength = this.users.length;
        this.users = this.users.filter(user => user.id !== id);
        return this.users.length < initialLength;
    }
}

export const service = new Service();
