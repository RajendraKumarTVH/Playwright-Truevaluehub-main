export class User {
  id: number | undefined;
  username!: string;
  password: string | undefined;
  firstName!: string;
  lastName!: string;
  token?: string;
}
