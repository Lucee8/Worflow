/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, UserRole } from '../types';
import { generateUUID } from '../db/store';
import { Users, Filter, PlusCircle, Search, Edit2, ShieldAlert, Power, Check, X } from 'lucide-react';

interface UsersTabProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  currentUser: User;
}

export default function UsersTab({ users, onAddUser, onUpdateUser, currentUser }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = React.useState<string>('All Statuses');

  // Modular user model edits
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // Form states
  const [fullName, setFullName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userRole, setUserRole] = React.useState<UserRole>('carpenter');
  const [initials, setInitials] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);

  // Compute metric cards
  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.is_active).length;
  const inactiveUsersCount = users.filter((u) => !u.is_active).length;
  const rolesCount = 3; // admin, carpenter, polish_person

  // Filter lists
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter.toLowerCase().replace(' ', '_');

    let matchesStatus = true;
    if (statusFilter !== 'All Statuses') {
      if (statusFilter === 'Active') matchesStatus = user.is_active;
      else if (statusFilter === 'Inactive') matchesStatus = !user.is_active;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setFullName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setInitials(u.initials);
    setIsActive(u.is_active);
    setShowAddModal(false);
  };

  const startAddNewUser = () => {
    setEditingUser(null);
    setFullName('');
    setUserEmail('');
    setUserRole('carpenter');
    setInitials('');
    setIsActive(true);
    setShowAddModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !userEmail || !initials) {
      alert('Required: Name, Email and 2-Character initials are mandatory.');
      return;
    }

    if (initials.length !== 2) {
      alert('Initials must be exactly 2-characters in length (uppercase).');
      return;
    }

    const newUser: User = {
      id: 'user_' + generateUUID().split('-')[0],
      name: fullName,
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      initials: initials.trim().toUpperCase(),
      is_active: true,
      last_seen: 'Never active yet',
      created_at: new Date().toISOString(),
      created_by: currentUser.id,
    };

    onAddUser(newUser);
    setShowAddModal(false);
    alert(`Success: User account created for "${fullName}". Initials configured: ${initials.toUpperCase()}`);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!fullName || !userEmail || !initials) {
      alert('Required: Name, Email and 2-Character initials are mandatory.');
      return;
    }

    const updated: User = {
      ...editingUser,
      name: fullName,
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      initials: initials.trim().toUpperCase(),
      is_active: isActive,
    };

    onUpdateUser(updated);
    setEditingUser(null);
    alert(`Success: Profile settings saved for ${fullName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black font-display text-stone-900 tracking-tight">Users Management</h1>
          <p className="text-stone-500 text-xs mt-1">Manage workshop staff directory, account active levels and role authorizations</p>
        </div>
        <button
          onClick={startAddNewUser}
          className="flex items-center gap-2 bg-[#593622] hover:bg-[#402414] text-white font-bold py-2.5 px-4 rounded-xl shadow transition text-xs"
        >
          <PlusCircle size={15} />
          Add New User
        </button>
      </div>

      {/* KPI Counters row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ contentVisibility: 'auto' }}>
        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono tracking-wider">Total Users</span>
            <strong className="text-xl font-bold font-display text-stone-800 tracking-tight mt-0.5 block">{totalUsers}</strong>
          </div>
          <div className="bg-stone-50 text-stone-500 p-2.5 rounded-lg border border-stone-150">
            <Users size={16} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono tracking-wider">Active Users</span>
            <strong className="text-xl font-bold font-display text-stone-800 tracking-tight mt-0.5 block text-green-700">{activeUsersCount}</strong>
          </div>
          <div className="bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-150">
            <Users size={17} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono tracking-wider">Inactive Users</span>
            <strong className="text-xl font-bold font-display text-stone-800 tracking-tight mt-0.5 block text-rose-700">{inactiveUsersCount}</strong>
          </div>
          <div className="bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-150">
            <Users size={17} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase font-mono tracking-wider">Roles Active</span>
            <strong className="text-xl font-bold font-display text-stone-800 tracking-tight mt-0.5 block">{rolesCount}</strong>
          </div>
          <div className="bg-[#fcf8f2] text-amber-700 p-2.5 rounded-lg border border-amber-200/40">
            <Users size={17} />
          </div>
        </div>
      </div>

      {/* Filter Options bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 text-stone-400" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or role badge..."
            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none transition font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#593622] transition shrink-0 min-w-[125px]"
          >
            <option>All Roles</option>
            <option>Admin</option>
            <option>Carpenter</option>
            <option>Polish Person</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#593622] transition shrink-0 min-w-[125px]"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button onClick={() => alert('Search filters reset.')} className="px-3 py-2.5 border border-stone-250 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0">
            <Filter size={12} /> Filter
          </button>
        </div>
      </div>

      {/* Users table registry */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 border-collapse" style={{ contentVisibility: 'auto' }}>
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 font-mono text-[10px] uppercase text-stone-400 font-black">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role Designation</th>
                <th className="py-3 px-4 text-center">Serials Initials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Seen</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-[#fcf8f2] text-amber-900 font-black flex items-center justify-center text-[10px] uppercase tracking-wide shrink-0 border border-amber-200">
                        {user.initials}
                      </div>
                      <span>
                        {user.name} {currentUser.id === user.id ? '(You)' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-550">{user.email}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : user.role === 'carpenter'
                          ? 'bg-amber-50 text-amber-800 border-amber-250'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-800 text-center">{user.initials}</td>
                  <td className="py-3.5 px-4">
                    {user.is_active ? (
                      <span className="text-green-700 font-bold inline-flex items-center gap-1 text-[11px]">
                        <span className="h-1.5 w-1.5 bg-green-600 rounded-full" /> Active
                      </span>
                    ) : (
                      <span className="text-stone-400 font-bold inline-flex items-center gap-1 text-[11px]">
                        <span className="h-1.5 w-1.5 bg-stone-300 rounded-full" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-400 text-[10px]">{user.last_seen || 'Not logged recently'}</td>
                  <td className="py-3.5 px-4 text-right shrink-0">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="bg-stone-100 hover:bg-[#593622] hover:text-white p-1.5 rounded-lg text-stone-600 transition"
                      title="Edit Profile specifications"
                    >
                      <Edit2 size={12} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Creation and Edits Modular Dialog */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <strong className="text-stone-900 text-sm font-black font-display uppercase tracking-tight">
                {editingUser ? 'Edit User Credentials' : 'Add New Workshop User Account'}
              </strong>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                }}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={editingUser ? handleSaveUserEdit : handleCreateUser} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 tracking-wider uppercase mb-1.5 font-sans">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Bhavesh Patel"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-250 focus:outline-none focus:border-[#593622] rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 tracking-wider uppercase mb-1.5 font-sans">Email Address (Google Account email) *</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="bhavesh@bhisesworkshop.com"
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-250 focus:outline-none focus:border-[#593622] rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 tracking-wider uppercase mb-1.5 font-sans">Role *</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-250 focus:outline-none rounded-xl font-bold text-stone-700"
                  >
                    <option value="admin">Administrator</option>
                    <option value="carpenter">Carpenter</option>
                    <option value="polish_person">Polish Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 tracking-wider uppercase mb-1.5 font-sans">Initials (2 chars) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value)}
                    placeholder="BH"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-250 focus:outline-none focus:border-[#593622] rounded-xl font-black font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2 select-none border-t border-stone-100 pt-3">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    className="h-4 w-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <label htmlFor="isActiveToggle" className="font-bold text-stone-700 font-sans cursor-pointer text-xs">
                    This account is Active (Unchecking denies login access)
                  </label>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl border text-stone-500 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#593622] hover:bg-[#402414] text-white font-bold px-4 py-2 rounded-xl shadow-sm"
                >
                  {editingUser ? 'Save Settings' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
