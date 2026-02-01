import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // Standard username/password credentials
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Find user by username in fnauth table with member relation
          const authRecord = await prisma.fnauth.findUnique({
            where: { username: credentials.username },
            include: {
              fnmember: true
            }
          });

          if (!authRecord) {
            return null;
          }

          // Check if account is locked
          if (authRecord.lockedUntil && authRecord.lockedUntil > new Date()) {
            throw new Error("Account is temporarily locked. Please try again later.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, authRecord.password);
          
          if (!isValidPassword) {
            // Increment login attempts
            await prisma.fnauth.update({
              where: { id: authRecord.id },
              data: {
                loginAttempts: authRecord.loginAttempts + 1,
                lockedUntil: authRecord.loginAttempts >= 4 
                  ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes after 5 failed attempts
                  : null
              }
            });
            return null;
          }

          // Reset login attempts and update last login on success
          await prisma.fnauth.update({
            where: { id: authRecord.id },
            data: {
              loginAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date()
            }
          });

          // Return user object that will be stored in JWT
          return {
            id: authRecord.fnmemberId,
            email: authRecord.email,
            name: `${authRecord.fnmember.first_name} ${authRecord.fnmember.last_name}`,
            firstName: authRecord.fnmember.first_name,
            lastName: authRecord.fnmember.last_name,
            tNumber: authRecord.fnmember.t_number,
            verified: authRecord.verified,
            activated: authRecord.fnmember.activated,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    }),
    // WebAuthn/Fingerprint credentials - authenticated by server action, 
    // this provider just creates the session
    CredentialsProvider({
      id: "webauthn",
      name: "webauthn",
      credentials: {
        memberId: { label: "Member ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.memberId) {
          return null;
        }

        try {
          // The actual WebAuthn verification happens in the server action
          // This provider just looks up the member and creates a session
          // The memberId is passed after successful WebAuthn verification
          const authRecord = await prisma.fnauth.findUnique({
            where: { fnmemberId: credentials.memberId },
            include: {
              fnmember: true
            }
          });

          if (!authRecord) {
            return null;
          }

          // Return user object that will be stored in JWT
          return {
            id: authRecord.fnmemberId,
            email: authRecord.email,
            name: `${authRecord.fnmember.first_name} ${authRecord.fnmember.last_name}`,
            firstName: authRecord.fnmember.first_name,
            lastName: authRecord.fnmember.last_name,
            tNumber: authRecord.fnmember.t_number,
            verified: authRecord.verified,
            activated: authRecord.fnmember.activated,
          };
        } catch (error) {
          console.error("WebAuthn auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30 for security)
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 1 day (reduced from 30 for security)
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to the token right after signin
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.tNumber = user.tNumber;
        token.verified = user.verified;
        token.activated = user.activated;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.tNumber = token.tNumber as string;
        session.user.verified = token.verified as boolean;
        session.user.activated = token.activated as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/TCN_Enter",
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      },
    },
  },
};