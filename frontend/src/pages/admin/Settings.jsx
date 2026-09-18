import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/ScrollReveal';
import { 
    User, Mail, Shield, Lock, Store, Clock, 
    Check, AlertCircle, Save, Settings as SettingsIcon, Building2, Eye, EyeOff,
    Sparkles, RefreshCw, Play, CheckCircle2
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

    // AI Automation & Schedule State
    const [aiDailyRunTime, setAiDailyRunTime] = useState('00:00');
    const [aiAutoRunEnabled, setAiAutoRunEnabled] = useState(true);
    const [aiLastRunTimestamp, setAiLastRunTimestamp] = useState(null);
    const [aiLastRunStatus, setAiLastRunStatus] = useState('Ready');
    const [isAiRunning, setIsAiRunning] = useState(false);
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);

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
        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            if (data) {
                if (data.ai_daily_run_time) setAiDailyRunTime(data.ai_daily_run_time);
                if (data.ai_auto_run_enabled !== undefined) setAiAutoRunEnabled(data.ai_auto_run_enabled === 'true');
                if (data.ai_last_run_timestamp) setAiLastRunTimestamp(data.ai_last_run_timestamp);
                if (data.ai_last_run_status) setAiLastRunStatus(data.ai_last_run_status);
            }
        } catch (err) {
            console.error("Failed to load settings", err);
        }
    };

    const handleSaveAiSchedule = async (e) => {
        e.preventDefault();
        setIsSavingSchedule(true);
        try {
            await api.put('/settings', { key: 'ai_daily_run_time', value: aiDailyRunTime });
            await api.put('/settings', { key: 'ai_auto_run_enabled', value: aiAutoRunEnabled ? 'true' : 'false' });
            toast.success(`Daily AI run time set to ${aiDailyRunTime} successfully!`);
            loadSettings();
        } catch (err) {
            console.error("Failed to update AI schedule", err);
            toast.error(err.response?.data?.message || "Failed to update AI schedule.");
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleRunAiNow = async () => {
        setIsAiRunning(true);
        try {
            await api.post('/settings/run-ai-now');
            toast.success("AI daily forecast & waste analysis executed successfully!");
            loadSettings();
        } catch (err) {
            console.error("Failed to run AI calculations now", err);
            toast.error(err.response?.data?.message || "Failed to execute AI calculations.");
        } finally {
            setIsAiRunning(false);
        }
    };

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
                        onClick={() => setActiveSection('ai-schedule')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all border cursor-pointer ${
                            activeSection === 'ai-schedule'
                                ? 'bg-[#2E1A12] border-[#2E1A12] text-white shadow-md'
                                : 'bg-white border-[#C8843B]/10 hover:border-[#C8843B]/30 text-[#2E1A12]'
                        }`}
                    >
                        <Sparkles className="w-4 h-4 text-[#C8843B]" />
                        <span>AI Daily Schedule</span>
                    </button>
                </div>

                {/* Form Panels */}
                <div className="md:col-span-9">
                    <div className="bg-white p-8 rounded-[32px] border border-[#C8843B]/10 shadow-[0_8px_30px_rgba(46,26,18,0.01)]">
                        
                        {activeSection === 'profile' && (
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12]">Account Details</h2>
                                    <p className="text-xs text-gray-400 font-medium">Update your {user?.role === 'staff' ? 'staff member' : 'admin'} profile identity and contact email address.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider">{user?.role === 'staff' ? 'Staff Member' : 'Admin'} Name</label>
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

                        {activeSection === 'ai-schedule' && (
                            <form onSubmit={handleSaveAiSchedule} className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C8843B]/10 text-[#C8843B] border border-[#C8843B]/20">
                                            Automated Background Cron
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold font-serif text-[#2E1A12] mt-1">
                                        AI Daily Automation Schedule
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                                        Configure the daily execution time for AI Demand Forecasting and Food Waste Reduction. The system automatically recalculates forecasts and store waste suggestions once each day at this scheduled time.
                                    </p>
                                </div>

                                {/* Status Card */}
                                <div className="p-5 rounded-2xl bg-[#FDFCFB] border border-[#C8843B]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#2E1A12] text-[#C8843B] flex items-center justify-center font-bold">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Scheduled Daily Time</div>
                                            <div className="text-xl font-bold font-serif text-[#2E1A12]">
                                                {aiDailyRunTime} <span className="text-xs font-normal text-gray-500 font-sans">({aiDailyRunTime === '00:00' ? 'Midnight / End of Day' : '24-hour time'})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                            aiAutoRunEnabled 
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                                : 'bg-gray-100 text-gray-600 border border-gray-300'
                                        }`}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>{aiAutoRunEnabled ? 'Daily Cron Active' : 'Automated Run Disabled'}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Form Inputs */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-wider block">
                                            Daily Run Time (Default: 00:00)
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C8843B]" />
                                            <input 
                                                type="time"
                                                value={aiDailyRunTime}
                                                onChange={(e) => setAiDailyRunTime(e.target.value)}
                                                className="w-full bg-gray-50/50 border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:outline-none focus:border-[#C8843B] transition-all text-[#2E1A12]"
                                                required
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            Recommended: <strong>00:00</strong> (runs at the end of each day to analyze full day sales).
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-600 uppercase tracking-wider block">
                                            Automation Switch
                                        </label>
                                        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between">
                                            <span className="text-xs font-bold text-[#2E1A12]">Enable Automatic Daily Execution</span>
                                            <input 
                                                type="checkbox"
                                                checked={aiAutoRunEnabled}
                                                onChange={(e) => setAiAutoRunEnabled(e.target.checked)}
                                                className="w-5 h-5 accent-[#C8843B] cursor-pointer rounded"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-400">
                                            When enabled, backend executes calculations automatically without requiring admin manual clicks.
                                        </p>
                                    </div>
                                </div>

                                {/* Last Execution Logs Info */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Last Execution Timestamp:</span>
                                        <span className="font-bold text-[#2E1A12]">
                                            {aiLastRunTimestamp ? new Date(aiLastRunTimestamp).toLocaleString() : 'Not yet executed today'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 font-semibold">Execution Status:</span>
                                        <span className="font-bold text-emerald-700">{aiLastRunStatus || 'Ready'}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-[#F7F4ED] flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handleRunAiNow}
                                        disabled={isAiRunning}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#C8843B]/40 hover:bg-[#F7F4ED] text-[#2E1A12] px-5 py-3 rounded-2xl text-xs font-black shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
                                    >
                                        <RefreshCw className={`w-4 h-4 text-[#C8843B] ${isAiRunning ? 'animate-spin' : ''}`} />
                                        <span>{isAiRunning ? 'Calculating AI Forecast...' : 'Run AI Calculations Now'}</span>
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSavingSchedule}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2E1A12] hover:bg-[#C8843B] text-white px-6 py-3 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70"
                                    >
                                        <Save className="w-4 h-4 text-[#C8843B]" />
                                        <span>{isSavingSchedule ? 'Saving...' : 'Save AI Schedule'}</span>
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
