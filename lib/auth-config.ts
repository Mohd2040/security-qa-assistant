import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { User } from "@/lib/models/user";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log('[AUTH] Attempting login for:', credentials?.email);

                    if (!credentials?.email || !credentials?.password) {
                        console.log('[AUTH] Missing credentials');
                        throw new Error("Invalid credentials");
                    }

                    console.log('[AUTH] Getting database connection...');
                    const db = await getDb();
                    console.log('[AUTH] Database connected, searching for user...');

                    const user = await db.collection<User>("users").findOne({ email: credentials.email });

                    console.log('[AUTH] User found:', user ? 'Yes' : 'No');
                    if (user) {
                        console.log('[AUTH] User details:', { email: user.email, hasPassword: !!user.password });
                    }

                    if (!user || !user.password) {
                        console.log('[AUTH] User not found or no password');
                        throw new Error("Invalid credentials");
                    }

                    console.log('[AUTH] Comparing passwords...');
                    const isValid = await compare(credentials.password, user.password);
                    console.log('[AUTH] Password valid:', isValid);

                    if (!isValid) {
                        console.log('[AUTH] Invalid password');
                        throw new Error("Invalid credentials");
                    }

                    console.log('[AUTH] Login successful for:', user.email);
                    return {
                        id: user._id?.toString() || "",
                        name: user.name,
                        email: user.email,
                        image: user.role,
                    };
                } catch (error: any) {
                    console.error('[AUTH] Error during authorization:', error.message);
                    console.error('[AUTH] Full error:', error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).image;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "super-secret-key-change-me",
};
