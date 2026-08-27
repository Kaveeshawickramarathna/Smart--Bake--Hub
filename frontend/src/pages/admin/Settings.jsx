import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    User, Mail, Shield, Lock, Store, Clock, 
    Check, AlertCircle, Save, Settings as SettingsIcon, Building2, Eye, EyeOff
} from 'lucide-react';

const Settings = () => {
    const { user, login } = useAuthStore();
    const [activeSection, setActiveSection] = useState('profile');
    
    // Profile State
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    
    // Password Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Mock Store Configurations
    const [storeName, setStoreName] = useState('Smart Bake Hub - Headquarters');
    const [storeAddress, setStoreAddress] = useState('No. 45, Galle Road, Colombo 03, Sri Lanka');
    const [storePhone, setStorePhone] = useState('+94 11 234 5678');
    const [taxRate, setTaxRate] = useState('8');
    const [openHours, setOpenHours] = useState('07:00 AM - 09:00 PM');

    const [isLoading, setIsLoading] = useState(false);

    // Load initial user profile info
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                if (data) {
                    setProfileName(data.name || '');
                    setProfileEmail(data.email || '');
                }
            } catch (err) {
                console.error("Failed to load admin profile info", err);
                if (user) {
                    setProfileName(user.name || '');
                    setProfileEmail(user.email || '');
                }
            }
        };
        loadProfile();
    }, [user]);

    // Handle Profile Change
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!profileName.trim() || !profileEmail.trim()) {
            toast.error("Name and Email cannot be empty.");
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await api.put('/users/profile', {
                name: profileName,
                email: profileEmail
            });
            toast.success("Profile updated successfully!");
            // Update auth store with new values
            if (user) {
                const updatedUser = { ...user, name: data.name, email: data.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error(err.response?.data?.message || "Failed to update profile info.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Password Change
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error("Please enter your current password.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await api.put('/users/profile', {
                name: profileName,
                email: profileEmail,
                currentPassword,
                newPassword
            });
            toast.success("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Failed to update password", err);
            toast.error(err.response?.data?.message || "Incorrect current password or update failed.");
        } finally {
            setIsLoading(false);
        }
    };

    // Save general store settings
    const handleSaveStoreSettings = (e) => {
        e.preventDefault();
        toast.success("Store configurations updated successfully!");
    };

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto text-[#2E1A12] pb-12">
            
            {/* Header context */}
            <ScrollReveal variant="fade-up" delay={0}>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-[#C8843B]/10 shadow-[0_15px_30px_rgba(46,26,18,0.02)]">
                    <div className="p-2.5 bg-[#C8843B]/10 text-[#C8843B] rounded-2xl shadow-sm">
                        <SettingsIcon className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold font-serif tracking-tight text-[#2E1A12]">
                            System & Account Settings
                        </h1>
                        <p className="text-xs font-semibold text-[#C8843B]/80 tracking-wider uppercase font-sans">
                            Configure store parameters and manage credentials
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Split layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Sidebar Navigation */}
                <div className="md:col-span-3 space-y-2">
                    <button
                        onClick={() => setActiveSection('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            activeSection === 'profile'
                                ? 'bg-[#2E1A12] border-[#2E1A12] text-white shadow-md'
                                : 'bg-white border-[#C8843B]/10 hover:border-[#C8843B]/30 text-[#2E1A12]'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Profile Credentials</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            activeSection === 'security'
                                ? 'bg-[#2E1A12] border-[#2E1A12] text-white shadow-md'
                                : 'bg-white border-[#C8843B]/10 hover:border-[#C8843B]/30 text-[#2E1A12]'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Security & Password</span>
                    </button>
                    <button
                        onClick={() => setActiveSection('store')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            activeSection === 'store'
                                ? 'bg-[#2E1A12] border-[#2E1A12] text-white shadow-md'
                                : 'bg-white border-[#C8843B]/10 hover:border-[#C8843B]/30 text-[#2E1A12]'
                        }`}
                    >
                        <Store className="w-4 h-4" />
                        <span>Store Details</span>
                    </button>
                </div>

                {/* Form Panels */}
                <div className="md:col-span-9">
                    <div className="bg-white p-8 rounded-[32px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)]">
                        
                        {activeSection === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12]">Account Details</h2>
                                    <p className="text-xs text-gray-400 font-medium">Update your admin profile identity and contact email address.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Admin Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="email"
                                                value={profileEmail}
                                                onChange={(e) => setProfileEmail(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#F7F4ED] flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-70"
                                    >
                                        <Save className="w-4 h-4 text-[#C8843B]" />
                                        <span>Save Profile Details</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'security' && (
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12]">Security Credentials</h2>
                                    <p className="text-xs text-gray-400 font-medium">Reset your system password credentials here.</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2 max-w-md">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Current Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8843B] transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input 
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-12 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8843B] transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input 
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={`w-full bg-gray-50/50 border ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300' : 'border-gray-200/80'} rounded-2xl py-3.5 pl-11 pr-12 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8843B] transition-colors"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-red-500 font-bold mt-1">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#F7F4ED] flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-70"
                                    >
                                        <Lock className="w-4 h-4 text-[#C8843B]" />
                                        <span>Update Password Credentials</span>
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'store' && (
                            <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12]">General Store Settings</h2>
                                    <p className="text-xs text-gray-400 font-medium">Configure store location, contact details, and open hours displayed on receipt ledgers.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Bakery Store Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Phone Hotline</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text"
                                                value={storePhone}
                                                onChange={(e) => setStorePhone(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Address Location</label>
                                        <input 
                                            type="text"
                                            value={storeAddress}
                                            onChange={(e) => setStoreAddress(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Tax & Levy Percentage (%)</label>
                                        <input 
                                            type="number"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(e.target.value)}
                                            className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">Operating Hours</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="text"
                                                value={openHours}
                                                onChange={(e) => setOpenHours(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200/80 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold focus:outline-none focus:border-[#C8843B]/50 transition-all text-[#2E1A12]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#F7F4ED] flex justify-end">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4 text-[#C8843B]" />
                                        <span>Save Store Settings</span>
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>

            </div>

        </div>
    );
};

export default Settings;
