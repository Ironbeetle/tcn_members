import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      firstName: string;
      lastName: string;
      tNumber: string;
      verified: boolean;
      activated: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    firstName: string;
    lastName: string;
    tNumber: string;
    verified: boolean;
    activated: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    tNumber: string;
    verified: boolean;
    activated: string;
  }
}
