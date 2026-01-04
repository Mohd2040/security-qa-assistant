import { ObjectId } from "mongodb";

export type UserRole = "admin" | "security" | "developer" | "infra";

export interface User {
    _id?: ObjectId | string;
    name: string;
    email: string;
    password?: string; // Hashed password
    role: UserRole;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const ROLES: UserRole[] = ["admin", "security", "developer", "infra"];
