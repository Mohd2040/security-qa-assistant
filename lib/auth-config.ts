import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import { compare } from "bcryptjs";
import { User } from "@/lib/models/user";
import { validateEmail } from "@/lib/input-validator";

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
                    // ✅ SECURITY: Only log in development mode
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[AUTH] Login attempt');
                    }

                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Invalid credentials");
                    }

                    // ✅ SECURITY: Validate email format and prevent NoSQL injection
                    let validatedEmail: string;
                    try {
                        validatedEmail = validateEmail(credentials.email);
                    } catch (emailError: any) {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[AUTH] Email validation failed:', emailError.message);
                        }
                        throw new Error("Invalid credentials");
                    }

                    const db = await getDb();
                    const user = await db.collection<User>("users").findOne({ email: validatedEmail });

                    if (!user || !user.password) {
                        throw new Error("Invalid credentials");
                    }

                    const isValid = await compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid credentials");
                    }

                    if (process.env.NODE_ENV === 'development') {
                        console.log('[AUTH] Login successful');
                    }

                    return {
                        id: user._id?.toString() || "",
                        name: user.name,
                        email: user.email,
                        image: user.role,
                    };
                } catch (error: any) {
                    console.error('[AUTH] Authentication failed');
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
        maxAge: 24 * 60 * 60, // 1 day
    },
    secret: process.env.NEXTAUTH_SECRET,
};

// ✅ SECURITY: Enforce strong secret key at startup
if (!authOptions.secret || authOptions.secret.length < 32) {
    throw new Error(
        '❌ NEXTAUTH_SECRET must be set in environment variables and be at least 32 characters long.\n' +
        'Generate one with: openssl rand -base64 32\n' +
        'Or online: https://generate-secret.vercel.app/32'
    );
}
