export enum UserActionTypes {
  setUser = '[SetUser] Put',
  destroyUser = '[DestroyUser] Get',
}

export class SetUser {
  static readonly type = UserActionTypes.setUser;
  constructor(public userData: { [key: string]: string }) {}
}

export class DestroyUser {
  static readonly type = UserActionTypes.destroyUser;
}

export type UserActions = SetUser | DestroyUser;
