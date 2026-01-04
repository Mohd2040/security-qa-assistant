"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, Plus, MoreVertical, Trash2, Edit2, X, ArrowLeft, AlertTriangle } from "lucide-react";
import { User, ROLES } from "@/lib/models/user";
import Link from "next/link";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "developer"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        if (activeDropdown) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [activeDropdown]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsAddModalOpen(false);
                fetchUsers();
                setFormData({ name: "", email: "", password: "", role: "developer" });
            }
        } catch (error) {
            console.error("Failed to create user", error);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser?._id) return;

        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                fetchUsers();
                setSelectedUser(null);
                setFormData({ name: "", email: "", password: "", role: "developer" });
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser?._id) return;

        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setIsDeleteModalOpen(false);
                fetchUsers();
                setSelectedUser(null);
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role
        });
        setIsEditModalOpen(true);
        setActiveDropdown(null);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
        setActiveDropdown(null);
    };

    return (
        <MainLayout>
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
                <div className="container-neo max-w-6xl mx-auto">
                    {/* Back Button */}
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Admin Dashboard</span>
                    </Link>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                            <p className="text-slate-400">Manage access and roles for team members.</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add User
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user._id?.toString()} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.name}</div>
                                                        <div className="text-sm text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                        user.role === 'security' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                            'bg-sky-500/10 border-sky-500/20 text-sky-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-sm text-slate-300">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdown(activeDropdown === user._id?.toString() ? null : user._id?.toString() || null);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    {activeDropdown === user._id?.toString() && (
                                                        <div className="absolute right-0 top-full mt-1 w-40 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                                                            <button
                                                                onClick={() => openEditModal(user)}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Add User Modal */}
                    {isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl animate-scale-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Add New User</h2>
                                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleAddUser} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50 [&>option]:bg-slate-900"
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold mt-4"
                                    >
                                        Create Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit User Modal */}
                    {isEditModalOpen && selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl animate-scale-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Edit User</h2>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditUser} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">New Password (leave empty to keep current)</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50"
                                            placeholder="Leave blank to keep current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500/50 [&>option]:bg-slate-900"
                                        >
                                            {ROLES.map(role => (
                                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold mt-4"
                                    >
                                        Update User
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {isDeleteModalOpen && selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl animate-scale-in">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-white text-center mb-2">Delete User</h2>
                                <p className="text-slate-400 text-center mb-6">
                                    Are you sure you want to delete <span className="text-white font-medium">{selectedUser.name}</span>? This action cannot be undone.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
