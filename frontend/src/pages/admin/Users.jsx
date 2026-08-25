import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Edit, ShieldAlert, CheckCircle, XCircle, Trash2, X, Key, User, Mail, Shield, ToggleLeft, Eye, EyeOff } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('staff');

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('customer');
    const [status, setStatus] = useState('active');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('customer');
        setStatus('active');
        setShowPassword(false);
        setIsAddModalOpen(true);
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setStatus(user.status);
        setIsEditModalOpen(true);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const newUserPayload = { name, email, password, role, status };
            const { data } = await api.post('/users', newUserPayload);
            setUsers(prev => [data, ...prev]);
            toast.success('User created successfully');
            setIsAddModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = { name, email, role, status };
            await api.put(`/users/${currentUser.id}`, updatePayload);
            setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatePayload } : u));
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleSendResetOTP = async (userEmail) => {
        try {
            await api.post('/auth/forgot-password', { email: userEmail });
            toast.success('Password reset link sent to user email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        }
    };

    const updateRole = async (id, newRole) => {
        try {
            await api.put(`/users/${id}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success('Role updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/users/${id}/status`, { status: newStatus });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
            toast.success('Status updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };



    const filteredUsers = users.filter(u => activeTab === 'staff' ? (u.role === 'staff' || u.role === 'admin') : u.role === 'customer');

    return (
        <div className="font-sans text-[#2E1A12] max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif">User Management</h1>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-[#2E1A12] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C8843B] transition-all duration-300 shadow-sm"
                >
                    <UserPlus className="w-4 h-4" /> Add New User
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[#C8843B]/20 pb-2">
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`font-semibold text-sm pb-2 border-b-2 transition-all ${
                        activeTab === 'staff'
                            ? 'border-[#C8843B] text-[#C8843B]'
                            : 'border-transparent text-[#2E1A12]/60 hover:text-[#2E1A12]'
                    }`}
                >
                    Staff & Admins
                </button>
                <button
                    onClick={() => setActiveTab('customer')}
                    className={`font-semibold text-sm pb-2 border-b-2 transition-all ${
                        activeTab === 'customer'
                            ? 'border-[#C8843B] text-[#C8843B]'
                            : 'border-transparent text-[#2E1A12]/60 hover:text-[#2E1A12]'
                    }`}
                >
                    Customers
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(46,26,18,0.03)] border border-[#C8843B]/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#C8843B]/10">
                        <thead className="bg-[#F7F4ED]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2E1A12]/70">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2E1A12]/70">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2E1A12]/70">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#2E1A12]/70">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#2E1A12]/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#C8843B]/10">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-[#2E1A12]/60">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C8843B]"></div>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-[#2E1A12]/60">No users found in this category.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#F7F4ED]/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-[#2E1A12]">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E1A12]/80">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role === 'customer' || user.role === 'admin' ? (
                                                <span className="text-sm font-medium text-[#2E1A12]/80 capitalize">{user.role}</span>
                                            ) : (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateRole(user.id, e.target.value)}
                                                    className="text-xs bg-[#FAFAFA] border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#C8843B] font-medium text-[#2E1A12]"
                                                >
                                                    <option value="staff">Staff</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => user.role !== 'customer' && user.role !== 'admin' && updateStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                                                disabled={user.role === 'customer' || user.role === 'admin'}
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 transition-all ${
                                                    user.role === 'customer' || user.role === 'admin' ? 'cursor-default opacity-80' : 'cursor-pointer'
                                                } ${
                                                    user.status === 'active' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 
                                                    user.status === 'pending_verification' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' :
                                                    'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                            >
                                                {user.status === 'active' ? (
                                                    <><CheckCircle className="w-3.5 h-3.5" /> Active</>
                                                ) : user.status === 'pending_verification' ? (
                                                    <><ShieldAlert className="w-3.5 h-3.5" /> Pending</>
                                                ) : (
                                                    <><XCircle className="w-3.5 h-3.5" /> Inactive</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="flex items-center gap-1 text-[#2E1A12]/80 hover:text-[#C8843B] transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" /> Edit
                                                </button>
                                                {user.role !== 'customer' && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => updateStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
                                                        className={`flex items-center gap-1 transition-colors ${
                                                            user.status === 'active' 
                                                                ? 'text-red-500 hover:text-red-700' 
                                                                : 'text-green-500 hover:text-green-700'
                                                        }`}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <><XCircle className="w-4 h-4" /> Deactivate</>
                                                        ) : (
                                                            <><CheckCircle className="w-4 h-4" /> Activate</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FFFCF9] rounded-[32px] border border-white max-w-md w-full shadow-2xl overflow-hidden animate-[float_0.3s_ease-out]">
                        <div className="flex justify-between items-center px-6 py-5 bg-[#F7F4ED] border-b border-[#C8843B]/10">
                            <h3 className="font-bold text-lg font-serif">Create New User</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#2E1A12]/60 hover:text-[#2E1A12]"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#2E1A12]/80">Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User className="w-4 h-4" /></span>
                                    <input
                                        type="text" required
                                        className="block w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                        placeholder="Full Name"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#2E1A12]/80">Email</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail className="w-4 h-4" /></span>
                                    <input
                                        type="email" required
                                        className="block w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                        placeholder="email@example.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#2E1A12]/80">Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key className="w-4 h-4" /></span>
                                    <input
                                        type={showPassword ? "text" : "password"} required
                                        className="block w-full pl-9 pr-10 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                        placeholder="Create password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#C8843B] transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#2E1A12]/80">Role</label>
                                    <select
                                        value={role} onChange={(e) => setRole(e.target.value)}
                                        className="block w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#2E1A12]/80">Status</label>
                                    <select
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                        className="block w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending_verification">Pending Verification</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button" onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#2E1A12] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#C8843B] transition-all"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FFFCF9] rounded-[32px] border border-white max-w-md w-full shadow-2xl overflow-hidden animate-[float_0.3s_ease-out]">
                        <div className="flex justify-between items-center px-6 py-5 bg-[#F7F4ED] border-b border-[#C8843B]/10">
                            <h3 className="font-bold text-lg font-serif">
                                {currentUser.role === 'customer' ? 'Edit Customer Details' : 'Edit User Details'}
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[#2E1A12]/60 hover:text-[#2E1A12]"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#2E1A12]/80">Name</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User className="w-4 h-4" /></span>
                                    <input
                                        type="text" required
                                        className="block w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                        value={name} onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#2E1A12]/80">Email</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail className="w-4 h-4" /></span>
                                    <input
                                        type="email" required
                                        className="block w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            {currentUser.role === 'customer' ? (
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSendResetOTP(email)}
                                        className="text-xs font-semibold text-[#C8843B] hover:text-[#9c662e] transition-colors underline"
                                    >
                                        Send new OTP to reset password
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#2E1A12]/80">Role</label>
                                        <select
                                            value={role} onChange={(e) => setRole(e.target.value)}
                                            className="block w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                            disabled={currentUser.role === 'admin'}
                                        >
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#2E1A12]/80">Status</label>
                                        <select
                                            value={status} onChange={(e) => setStatus(e.target.value)}
                                            className="block w-full px-3 py-2 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#C8843B]"
                                            disabled={currentUser.role === 'admin'}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending_verification">Pending Verification</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button" onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#2E1A12] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#C8843B] transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
