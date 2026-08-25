import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, User, Clock, Send, CheckCircle } from 'lucide-react';

const ChatSupport = () => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const fetchSessions = async () => {
        try {
            const { data } = await api.get('/chat/admin/sessions');
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        }
    };

    const fetchMessages = async (sid) => {
        if (!sid) return;
        try {
            const { data } = await api.get(`/chat/${sid}/messages`);
            setMessages(data.messages);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(() => {
            fetchSessions();
            if (activeSession) fetchMessages(activeSession.session_id);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectSession = (session) => {
        setActiveSession(session);
        fetchMessages(session.session_id);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeSession) return;

        try {
            await api.post(`/chat/admin/${activeSession.session_id}/reply`, { message: input });
            setInput('');
            fetchMessages(activeSession.session_id);
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    const closeSession = async () => {
        if (!activeSession) return;
        try {
            await api.post(`/chat/admin/${activeSession.session_id}/close`);
            toast.success('Chat session closed');
            setActiveSession(null);
            setMessages([]);
            fetchSessions();
        } catch (error) {
            toast.error('Failed to close session');
        }
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#2E1A12] font-serif">Chat Support</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e6dfd5]/40 h-[70vh] flex overflow-hidden">
                {/* Left: Sessions List */}
                <div className="w-1/3 border-r border-[#e6dfd5]/40 flex flex-col bg-gray-50/50">
                    <div className="p-4 border-b border-[#e6dfd5]/40 bg-white">
                        <h2 className="font-bold text-[#2E1A12]">Active Chats ({sessions.length})</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {sessions.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 mt-10">No active chats</p>
                        ) : (
                            sessions.map(session => (
                                <div 
                                    key={session.session_id} 
                                    onClick={() => handleSelectSession(session)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                        activeSession?.session_id === session.session_id 
                                            ? 'bg-blue-50 border-blue-200' 
                                            : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-[#2E1A12]/10 p-1.5 rounded-full text-[#2E1A12]">
                                                <User size={16} />
                                            </div>
                                            <span className="font-bold text-[#2E1A12] text-sm truncate max-w-[120px]">
                                                {session.customer_name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 truncate pr-2 flex-1">
                                            {session.last_message || 'New chat started...'}
                                        </p>
                                        {session.status === 'admin_requested' && (
                                            <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                WAITING
                                            </span>
                                        )}
                                        {session.status === 'admin_active' && (
                                            <span className="bg-green-100 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Chat Window */}
                <div className="flex-1 flex flex-col bg-white relative">
                    {activeSession ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-[#e6dfd5]/40 flex justify-between items-center bg-white z-10 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#C8843B]/10 p-2 rounded-full text-[#C8843B]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#2E1A12]">{activeSession.customer_name}</h3>
                                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <Clock size={12} /> Started {new Date(activeSession.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeSession}
                                    className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                                >
                                    <CheckCircle size={14} /> Resolve Chat
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 bg-[#F7F4ED]/50 space-y-4 custom-scrollbar">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                            msg.sender === 'admin' 
                                                ? 'bg-[#C8843B] text-white rounded-tr-sm' 
                                                : msg.sender === 'bot'
                                                    ? 'bg-gray-200 text-gray-600 rounded-tl-sm text-xs italic'
                                                    : 'bg-white text-[#2E1A12] shadow-sm rounded-tl-sm border border-gray-100'
                                        }`}>
                                            <p className={msg.sender === 'bot' ? 'text-xs' : 'text-sm'}>{msg.message}</p>
                                            <span className={`text-[9px] mt-1 block text-right ${msg.sender === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                                                {msg.sender === 'bot' ? 'Bot - ' : ''} {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#e6dfd5]/40 flex gap-3 items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your reply here..."
                                    className="flex-1 bg-gray-50 border border-gray-200 focus:border-[#C8843B] rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim()}
                                    className="bg-[#2E1A12] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-[#C8843B] transition-colors disabled:opacity-50"
                                >
                                    Send <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
                            <MessageSquare size={64} className="mb-4 opacity-20" />
                            <p className="font-medium">Select a session to view chat</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatSupport;
