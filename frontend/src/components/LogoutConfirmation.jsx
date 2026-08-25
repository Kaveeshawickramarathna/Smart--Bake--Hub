import { X, LogOut } from 'lucide-react';

const LogoutConfirmation = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#2E1A12]/20 backdrop-blur-sm z-[9999]"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white rounded-xl shadow-lg max-w-sm w-full border border-[#C8843B]/20 pointer-events-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-[#C8843B]/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-[#2E1A12]">Logout</h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-[#F7F4ED] rounded transition-colors text-[#2E1A12]/60"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-center">
                        <p className="text-[#2E1A12]/80 text-lg font-medium">Are you sure you want to log out?</p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-5 bg-[#F7F4ED]/50 rounded-b-xl border-t border-[#C8843B]/20">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 bg-white border border-[#C8843B]/20 text-[#2E1A12] rounded-lg hover:bg-[#C8843B]/5 transition-colors font-medium"
                        >
                            No
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogoutConfirmation;
