import Credentials from 'next-auth/providers/credentials';
import type { NextAuthOptions } from "next-auth/";
import { loginAction } from './features/auth/apis/auth.action';
import { sessionMaxAge } from './shared/constant/auth.constant';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }
        const loginData = await loginAction({
          username: credentials.username,
          password: credentials.password,
        });
        return {
          id: loginData.user.id,
          accessToken: loginData.accessToken,
          user: loginData.user,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = user.user;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user;
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: sessionMaxAge,
  },
  jwt: {
    maxAge: sessionMaxAge,
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
};
