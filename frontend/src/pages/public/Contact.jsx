import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Sending your inquiry to Smart Bake Hub team...',
                success: () => {
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                    setSubmitting(false);
                    return 'Thank you! Your message has been received. We will get back to you shortly.';
                },
                error: 'Submission failed. Please try again.',
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                {/* Hero Header */}
                <section className="relative w-full pt-20 pb-24 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#FFFDFC] to-transparent">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-[#e8decf] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C8843B]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-pulse"></div>

                    <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
                        <ScrollReveal variant="fade-up" duration={1000} delay={100}>
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white px-4 py-2.5 rounded-full shadow-sm text-[#d68b3b] font-semibold text-xs tracking-wide mb-6">
                                <MessageSquare className="w-4 h-4 text-[#C8843B]" />
                                <span>Get In Touch. <span className="text-[#3a1d08]">We Are Listening.</span></span>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal variant="fade-up" duration={1000} delay={300}>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#2c1d11] leading-tight mb-6 font-serif tracking-tight">
                                Contact <span className="text-[#C8843B] italic">Us</span>
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal variant="fade-up" duration={1000} delay={500}>
                            <p className="text-[#5a4d41] text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium text-gray-500">
                                Have questions about our custom cakes, event bookings, smart catering packages, or order tracking? Drop us a line.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Contact Columns Section */}
                <section className="max-w-[1400px] mx-auto px-6 py-6 pb-24 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        
                        {/* Left Column: Details Cards */}
                        <div className="w-full lg:w-5/12 flex flex-col gap-8">
                            <ScrollReveal variant="fade-up" duration={800} delay={100}>
                                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_15px_30px_rgba(46,26,18,0.02)] border border-white/60 space-y-6">
                                    <h2 className="text-2xl font-bold font-serif mb-4 text-[#2E1A12]">Get in Touch</h2>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shrink-0">
                                            <MapPin className="w-5.5 h-5.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Bakery & Event Hall</h4>
                                            <p className="text-sm font-semibold mt-1">No.288, Rathnapura Road, 12400 Horana, Sri Lanka</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shrink-0">
                                            <Phone className="w-5.5 h-5.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Phone Number</h4>
                                            <p className="text-sm font-semibold mt-1">076 123 4567</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shrink-0">
                                            <Mail className="w-5.5 h-5.5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-400 uppercase tracking-widest">Email Address</h4>
                                            <p className="text-sm font-semibold mt-1">info@wijayasiri.com</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal variant="fade-up" duration={800} delay={200}>
                                <div className="bg-[#2E1A12] text-[#fef9e1] rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden border border-white/5">
                                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#C8843B]/20 rounded-full filter blur-xl"></div>
                                    
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-6 h-6 text-[#C8843B]" />
                                        <h3 className="text-xl font-bold font-serif text-white">Opening Hours</h3>
                                    </div>

                                    <div className="space-y-3.5 text-xs text-gray-300 font-medium">
                                        <div className="flex justify-between border-b border-white/10 pb-2.5">
                                            <span>Monday - Friday</span>
                                            <span className="text-white font-bold">8:00 AM - 10:00 PM</span>
                                        </div>
                                        <div className="flex justify-between border-b border-white/10 pb-2.5">
                                            <span>Saturday</span>
                                            <span className="text-white font-bold">9:00 AM - 11:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sunday</span>
                                            <span className="text-white font-bold">9:00 AM - 8:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="w-full lg:w-7/12">
                            <ScrollReveal variant="fade-up" duration={900} delay={250}>
                                <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_20px_40px_rgba(46,26,18,0.03)] border border-[#e6dfd5]/40">
                                    <h2 className="text-2xl font-bold font-serif mb-6 text-[#2E1A12]">Send Us a Message</h2>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]/60">Your Name</label>
                                                <input
                                                    type="text" required
                                                    className="block w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all"
                                                    placeholder="Enter your name"
                                                    value={name} onChange={(e) => setName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]/60">Email Address</label>
                                                <input
                                                    type="email" required
                                                    className="block w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all"
                                                    placeholder="Enter your email"
                                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]/60">Subject</label>
                                            <input
                                                type="text" required
                                                className="block w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all"
                                                placeholder="What is this inquiry about?"
                                                value={subject} onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#2E1A12]/60">Message</label>
                                            <textarea
                                                required rows={5}
                                                className="block w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-[#C8843B] focus:border-[#C8843B] transition-all resize-none"
                                                placeholder="Write your details here..."
                                                value={message} onChange={(e) => setMessage(e.target.value)}
                                            ></textarea>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <button
                                                type="submit" disabled={submitting}
                                                className="flex items-center justify-center gap-2 bg-[#2E1A12] text-white hover:bg-[#C8843B] font-semibold py-3.5 px-8 rounded-xl text-xs hover:shadow-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {submitting ? "Sending..." : (
                                                    <>
                                                        <Send className="w-4 h-4" /> Send Inquiry
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                {/* Google Maps Section */}
                <section className="max-w-[1400px] mx-auto px-6 pb-24">
                    <ScrollReveal variant="fade-up" duration={900}>
                        <div className="bg-white rounded-[32px] overflow-hidden border border-[#e6dfd5]/60 shadow-[0_20px_40px_rgba(46,26,18,0.02)] p-4">
                            <div className="w-full h-[400px] rounded-2xl overflow-hidden relative group">
                                <iframe 
                                    title="Smart Bake Hub Horana Location"
                                    src="https://maps.google.com/maps?q=Wijayasiri%20Fresh%20Food,%20Ratnapura%20-%20Horana%20-%20Panadura%20Hwy,%20Horana&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="grayscale hover:grayscale-0 transition-all duration-700"
                                ></iframe>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;
