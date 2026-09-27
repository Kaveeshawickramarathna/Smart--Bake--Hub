import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, UserCog, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Chatbot = () => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('bot'); // 'bot', 'admin_requested', 'admin_active', 'closed'
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);


    const initChat = async () => {
        let sid = localStorage.getItem('chat_session_id');
        if (!sid) {
            sid = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chat_session_id', sid);
        }
        setSessionId(sid);
        try {
            await api.post('/chat/init', {
                session_id: sid,
                user_id: user ? user.id : null,
                customer_name: user ? user.name : 'Guest'
            });
            fetchMessages(sid);
        } catch (error) {
            console.error('Failed to init chat', error);
        }
    };

    const fetchMessages = async (sid = sessionId) => {
        if (!sid) return;
        try {
            const { data } = await api.get(`/chat/${sid}/messages`);
            setMessages(data.messages);
            setStatus(data.status);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    useEffect(() => {
        if (isOpen && !sessionId) {
            initChat();
        }
        
        let interval;
        if (isOpen && sessionId) {
            interval = setInterval(() => {
                fetchMessages(sessionId);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen, sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const msg = input.trim();
        setInput('');
        
        // Optimistic update
        setMessages(prev => [...prev, { sender: 'customer', message: msg, created_at: new Date() }]);
        scrollToBottom();

        try {
            await api.post(`/chat/${sessionId}/send`, { message: msg });
            
            // If in bot mode, trigger intelligent AI assistant reply powered by gpt-5.6-luna
            if (status === 'bot') {
                setIsTyping(true);
                const lowerMsg = msg.toLowerCase();
                let keyword = null;
                if (lowerMsg.includes('hour') || lowerMsg.includes('open') || lowerMsg.includes('time')) keyword = 'hours';
                else if (lowerMsg.includes('deliver') || lowerMsg.includes('takeaway')) keyword = 'delivery';

                try {
                    await api.post(`/chat/${sessionId}/bot-reply`, { message: msg, keyword });
                } finally {
                    setIsTyping(false);
                }
            }
            fetchMessages();
        } catch (error) {
            console.error('Failed to send message', error);
            setIsTyping(false);
        }
    };

    const handleQuickReply = async (keyword) => {
        if (!sessionId) return;
        setIsTyping(true);
        try {
            await api.post(`/chat/${sessionId}/bot-reply`, { keyword });
            await fetchMessages();
        } finally {
            setIsTyping(false);
        }
    };

    const requestAdmin = async () => {
        try {
            await api.post(`/chat/${sessionId}/request-admin`);
            fetchMessages();
        } catch (error) {
            console.error('Failed to request admin', error);
        }
    };

    // Don't render chatbot widget for admin or staff
    if (user && (user.role === 'admin' || user.role === 'staff')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col border border-[#C8843B]/20 mb-4 h-[500px]">
                    {/* Header */}
                    <div className="bg-[#2E1A12] text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative">
                                {status === 'admin_active' ? <UserCog size={20} /> : <Bot size={20} />}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2E1A12] rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{status === 'admin_active' ? 'Live Support' : 'Smart Bake AI Assistant'}</h3>
                                <p className="text-[10px] text-white/70">
                                    {status === 'bot' ? (isTyping ? 'AI is thinking...' : 'GPT-5.6 Assistant Online') : status === 'admin_requested' ? 'Waiting for Admin...' : 'Admin is connected'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#F7F4ED] space-y-4 text-sm custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                    msg.sender === 'customer' 
                                        ? 'bg-[#C8843B] text-white rounded-tr-sm' 
                                        : msg.sender === 'admin' 
                                            ? 'bg-blue-600 text-white rounded-tl-sm'
                                            : 'bg-white text-[#2E1A12] shadow-sm rounded-tl-sm border border-gray-100'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                    <span className={`text-[9px] mt-1 block ${msg.sender === 'customer' ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white text-[#2E1A12] shadow-sm rounded-2xl rounded-tl-sm px-4 py-2 border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                    <Loader2 size={13} className="animate-spin text-[#C8843B]" />
                                    <span>AI Assistant is typing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (Bot Mode) */}
                    {status === 'bot' && (
                        <div className="bg-white p-2 border-t border-gray-100 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
                            <button onClick={() => handleQuickReply('hours')} className="px-3 py-1.5 bg-[#C8843B]/10 text-[#C8843B] text-xs font-semibold rounded-full hover:bg-[#C8843B]/20 transition-colors">Opening Hours</button>
                            <button onClick={() => handleQuickReply('delivery')} className="px-3 py-1.5 bg-[#C8843B]/10 text-[#C8843B] text-xs font-semibold rounded-full hover:bg-[#C8843B]/20 transition-colors">Delivery Info</button>
                            <button onClick={requestAdmin} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors">Talk to Admin</button>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about cakes, menu, events, or orders..."
                            disabled={status === 'closed'}
                            className="flex-1 bg-[#F7F4ED] border border-transparent focus:border-[#C8843B]/30 rounded-full px-4 py-2 text-sm focus:outline-none transition-all disabled:opacity-50"
                        />
                        <button type="submit" disabled={!input.trim() || status === 'closed'} className="w-10 h-10 bg-[#2E1A12] text-white rounded-full flex items-center justify-center hover:bg-[#C8843B] transition-colors disabled:opacity-50">
                            <Send size={16} className="ml-1" />
                        </button>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-red-500 text-white rotate-90 scale-90' : 'bg-[#C8843B] text-white hover:scale-105 hover:bg-[#b07130]'
                }`}
            >
                {isOpen ? <X size={24} className="-rotate-90" /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

export default Chatbot;
