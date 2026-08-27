import { X, AlertCircle } from 'lucide-react';

const DeleteConfirmation = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#2E1A12]/20 backdrop-blur-sm z-40"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full border border-[#C8843B]/20">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[#C8843B]/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-[#2E1A12]">{title}</h2>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-[#F7F4ED] rounded transition-colors text-[#2E1A12]/60"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-[#2E1A12]/80">{message}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 bg-[#F7F4ED]/50 rounded-b-xl border-t border-[#C8843B]/20">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 border border-[#C8843B]/20 text-[#2E1A12] rounded-lg hover:bg-[#C8843B]/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DeleteConfirmation;
