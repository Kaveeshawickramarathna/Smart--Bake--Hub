import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';

const InventoryManagement = () => {
    const [items, setItems] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [showItemModal, setShowItemModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    
    // Form states
    const initialItemForm = { item_name: '', category: 'bakery', sku: '', stock_quantity: 0, low_stock_threshold: 10, expiry_date: '', status: 'active' };
    const [itemForm, setItemForm] = useState(initialItemForm);
    const [editingId, setEditingId] = useState(null);

    const initialTxForm = { item_id: '', transaction_type: 'stock_in', quantity: 0, remarks: '' };
    const [txForm, setTxForm] = useState(initialTxForm);

    const fetchData = async () => {
        try {
            const [itemsRes, alertsRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/inventory/alerts')
            ]);
            setItems(itemsRes.data);
            setAlerts(alertsRes.data);
        } catch (error) {
            toast.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Item Handlers
    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/inventory/${editingId}`, itemForm);
                toast.success('Inventory item updated');
            } else {
                await api.post('/inventory', itemForm);
                toast.success('Inventory item created');
            }
            setShowItemModal(false);
            setEditingId(null);
            setItemForm(initialItemForm);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/inventory/${id}`);
                toast.success('Item deleted');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete item');
            }
        }
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setItemForm({
            item_name: item.item_name,
            category: item.category,
            sku: item.sku || '',
            stock_quantity: item.stock_quantity,
            low_stock_threshold: item.low_stock_threshold,
            expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
            status: item.status
        });
        setShowItemModal(true);
    };

    // Transaction Handlers
    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory/transaction', txForm);
            toast.success('Transaction successful');
            setShowTransactionModal(false);
            setTxForm(initialTxForm);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        }
    };

    const openTransactionModal = (itemId, type) => {
        setTxForm({ ...initialTxForm, item_id: itemId, transaction_type: type });
        setShowTransactionModal(true);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                <button
                    onClick={() => { setEditingId(null); setItemForm(initialItemForm); setShowItemModal(true); }}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Item</span>
                </button>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
                <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <h2 className="text-lg font-bold text-red-700">Action Required: Low Stock / Expiring Soon</h2>
                    </div>
                    <ul className="list-disc list-inside text-red-600">
                        {alerts.map(alert => (
                            <li key={alert.id}>
                                <strong>{alert.item_name}</strong> - Stock: {alert.stock_quantity} (Threshold: {alert.low_stock_threshold}) {alert.expiry_date && `| Expires: ${new Date(alert.expiry_date).toLocaleDateString()}`}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU/Batch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                                        {item.stock_quantity <= item.low_stock_threshold && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Low Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.category.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{item.stock_quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => openTransactionModal(item.id, 'stock_in')} className="text-green-600 hover:text-green-900 flex items-center" title="Stock In">
                                                <ArrowDownCircle className="w-4 h-4 mr-1" /> In
                                            </button>
                                            <button onClick={() => openTransactionModal(item.id, 'stock_out')} className="text-orange-600 hover:text-orange-900 flex items-center" title="Stock Out">
                                                <ArrowUpCircle className="w-4 h-4 mr-1" /> Out
                                            </button>
                                            <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 ml-4">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 ml-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No inventory items found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={itemForm.item_name}
                                    onChange={e => setItemForm({ ...itemForm, item_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary capitalize"
                                        value={itemForm.category}
                                        onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                                    >
                                        <option value="bakery">Bakery</option>
                                        <option value="meals">Meals</option>
                                        <option value="beverages">Beverages</option>
                                        <option value="cake">Cake</option>
                                        <option value="raw_materials">Raw Materials</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU / Batch</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        value={itemForm.sku}
                                        onChange={e => setItemForm({ ...itemForm, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        disabled={!!editingId}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-50"
                                        value={itemForm.stock_quantity}
                                        onChange={e => setItemForm({ ...itemForm, stock_quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert At</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        value={itemForm.low_stock_threshold}
                                        onChange={e => setItemForm({ ...itemForm, low_stock_threshold: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={itemForm.expiry_date}
                                    onChange={e => setItemForm({ ...itemForm, expiry_date: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowItemModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    {editingId ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {showTransactionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h2 className="text-2xl font-bold mb-6 capitalize">
                            {txForm.transaction_type.replace('_', ' ')}
                        </h2>
                        <form onSubmit={handleTransactionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={txForm.quantity}
                                    onChange={e => setTxForm({ ...txForm, quantity: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    rows="2"
                                    value={txForm.remarks}
                                    onChange={e => setTxForm({ ...txForm, remarks: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTransactionModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-lg ${txForm.transaction_type === 'stock_in' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
