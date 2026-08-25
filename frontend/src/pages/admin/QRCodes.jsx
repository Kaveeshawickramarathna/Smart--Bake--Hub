import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Download, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const QRCodes = () => {
    // Array of tables to generate QR codes for
    const [tables, setTables] = useState([
        { id: 1, number: '1', label: 'Table 1' },
        { id: 2, number: '2', label: 'Table 2' },
        { id: 3, number: '3', label: 'Table 3' },
        { id: 4, number: '4', label: 'Table 4' },
    ]);
    const [newTable, setNewTable] = useState('');

    const qrRefs = useRef({});

    const handleAddTable = (e) => {
        e.preventDefault();
        if (!newTable.trim()) return;
        const exists = tables.some(t => t.number === newTable.trim());
        if (exists) {
            toast.error('Table already exists!');
            return;
        }
        const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
        setTables([...tables, { id: newId, number: newTable.trim(), label: `Table ${newTable.trim()}` }]);
        setNewTable('');
        toast.success(`Added Table ${newTable.trim()}`);
    };

    const handleDeleteTable = (id) => {
        setTables(tables.filter(t => t.id !== id));
    };

    const downloadQRCode = (tableNumber) => {
        const svg = qrRefs.current[tableNumber];
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            // Draw white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            const filename = tableNumber === 'general' ? 'SmartBakeHub_General_QR.png' : `SmartBakeHub_Table_${tableNumber}_QR.png`;
            downloadLink.download = filename;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const getBaseUrl = () => {
        return window.location.origin;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#2E1A12] font-serif flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-[#C8843B]" />
                        Table QR Codes
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Generate and download QR codes for tables. Customers scanning these will have their table number pre-filled.
                    </p>
                </div>
                
                <form onSubmit={handleAddTable} className="flex gap-2 w-full sm:w-auto">
                    <input 
                        type="text"
                        placeholder="Table No (e.g. 5)"
                        value={newTable}
                        onChange={(e) => setNewTable(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#C8843B]"
                    />
                    <button 
                        type="submit"
                        className="bg-[#2E1A12] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#C8843B] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General / Takeaway QR Code */}
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-[#2E1A12]">General QR Code</h3>
                        <p className="text-[11px] text-amber-700 font-medium">For Takeaway / Online Orders</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-amber-300">
                        <QRCodeSVG
                            id={`qr-general`}
                            value={`${getBaseUrl()}/menus`}
                            size={180}
                            level={"H"}
                            includeMargin={true}
                            ref={(el) => (qrRefs.current['general'] = el)}
                            imageSettings={{
                                src: "/images/logo.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>
                    
                    <p className="text-[10px] text-center text-amber-600 break-all px-2 font-medium">
                        {`${getBaseUrl()}/menus`}
                    </p>

                    <div className="flex items-center gap-3 w-full mt-2">
                        <button 
                            onClick={() => downloadQRCode('general')}
                            className="flex-1 bg-[#2E1A12] hover:bg-[#C8843B] text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                </div>

                {/* Table QR Codes */}
                {tables.map(table => {
                    const orderUrl = `${getBaseUrl()}/menus?table=${encodeURIComponent(table.number)}`;
                    return (
                        <div key={table.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-[#2E1A12]">{table.label}</h3>
                            
                            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200">
                                <QRCodeSVG
                                    id={`qr-${table.number}`}
                                    value={orderUrl}
                                    size={180}
                                    level={"H"}
                                    includeMargin={true}
                                    ref={(el) => (qrRefs.current[table.number] = el)}
                                    imageSettings={{
                                        src: "/images/logo.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            
                            <p className="text-[10px] text-center text-gray-400 break-all px-2 font-medium">
                                {orderUrl}
                            </p>

                            <div className="flex items-center gap-3 w-full mt-2">
                                <button 
                                    onClick={() => downloadQRCode(table.number)}
                                    className="flex-1 bg-[#F7F4ED] hover:bg-[#C8843B] text-[#C8843B] hover:text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </button>
                                <button 
                                    onClick={() => handleDeleteTable(table.id)}
                                    className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                                    title="Delete Table"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QRCodes;
