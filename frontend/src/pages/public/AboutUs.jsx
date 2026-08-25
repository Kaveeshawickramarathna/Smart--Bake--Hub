import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import AnimatedCounter from '../../components/AnimatedCounter';
import { Wheat, Award, ShieldCheck, Cpu, Phone, Mail, MapPin, Sparkles, Clock, Users, Heart, Camera, Compass, Eye, Star, CheckCircle, QrCode, Calendar, Percent } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between">
            <div>
                <Header />
                
                {/* 1. Hero Section */}
                <section className="relative w-full pt-24 pb-32 lg:pt-28 lg:pb-40 overflow-hidden">
                    {/* Blurred background image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center filter blur-[8px] scale-105 opacity-25"
                        style={{ backgroundImage: 'url("/images/about_event_hall.png")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFC]/95 via-[#fef9e1]/75 to-transparent"></div>
                    
                    <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
                        <ScrollReveal variant="fade-up" duration={1000} delay={100}>
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white px-4.5 py-2.5 rounded-full shadow-[0_4px_12px_rgba(46,26,18,0.03)] text-[#d68b3b] font-semibold text-xs tracking-wide mb-8">
                                <Wheat className="w-4 h-4 text-[#C8843B]" />
                                <span>Est. 1986. <span className="text-[#3a1d08]">Crafted with Pride.</span></span>
                            </div>
                        </ScrollReveal>
                        
                        <ScrollReveal variant="fade-up" duration={1000} delay={300}>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2c1d11] leading-[1.1] mb-6 font-serif tracking-tight text-balance">
                                Heritage In Every Loaf, <br />
                                <span className="relative inline-block mt-2">
                                    <span className="text-[#C8843B] italic">Future In Every Byte</span>
                                    <svg className="absolute w-full h-3 -bottom-2.5 left-0 text-[#C8843B]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent" />
                                    </svg>
                                </span>
                            </h1>
                        </ScrollReveal>
                        
                        <ScrollReveal variant="fade-up" duration={1000} delay={500}>
                            <p className="text-[#5a4d41] text-xs md:text-sm max-w-2xl mx-auto leading-relaxed font-medium mt-6 text-balance text-gray-600">
                                Wijayasiri Fresh Food has combined family values, authentic Sri Lankan recipes, and cutting-edge automation to create an unforgettable smart bakery experience.
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* 2. Our Story Section (Scroll animations on text/image) */}
                <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-24 relative z-10">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-[0_30px_60px_-15px_rgba(46,26,18,0.06)] border border-white/60 p-8 lg:p-20 flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                        
                        {/* Text Left (Slides upward on scroll) */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <ScrollReveal variant="fade-up" duration={900}>
                                <div>
                                    <span className="block font-display text-3xl lg:text-4xl text-[#C8843B] font-normal leading-none mb-1 select-none">The Heritage Legacy</span>
                                    <h2 className="text-4xl lg:text-5xl font-bold text-[#2c1d11] font-serif leading-tight">Our Story</h2>
                                </div>
                            </ScrollReveal>
                            
                            <ScrollReveal variant="fade-up" duration={900} delay={150}>
                                <p className="text-[#5a4d41] text-base leading-relaxed">
                                    In <strong>1986</strong>, Mr. B. A. L. Wijayasiri founded our bakery in the remote village of Horana. With a wood oven built by himself, he baked his first fresh loaf of bread and sold it with his wife and a few loyal employees in a tiny corner shop.
                                </p>
                            </ScrollReveal>
                            
                            <ScrollReveal variant="fade-up" duration={900} delay={300}>
                                <p className="text-[#5a4d41] text-base leading-relaxed">
                                    The rich aroma and pure, uncompromising quality of his bread demand started growing rapidly. This trust prompted the birth of <strong>Wijayasiri Fresh Food (Pvt) Ltd</strong>. Through over four decades of dedication, our goal has remained identical: providing premium, wholesome food that delights families.
                                </p>
                            </ScrollReveal>
                            
                            <ScrollReveal variant="fade-up" duration={900} delay={450}>
                                <p className="text-[#5a4d41] text-base leading-relaxed">
                                    Today, we combine Mr. Wijayasiri's original recipes with automated packaging, smart self-service ordering, and real-time updates to bring you the future of bakery food services.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal variant="fade-up" duration={900} delay={600}>
                                <div className="flex flex-wrap items-center gap-8 mt-4 pt-4 border-t border-[#f0e6d8]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shrink-0">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#2c1d11] text-sm">Family Run</h4>
                                            <p className="text-[11px] text-gray-500 font-semibold">Generations of baking trust</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#fef9e1] flex items-center justify-center text-[#C8843B] shrink-0">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#2c1d11] text-sm">Pure Ingredients</h4>
                                            <p className="text-[11px] text-gray-500 font-semibold">No chemical preservatives</p>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                        
                        {/* Image Right (Smooth zoom and fade in from side) */}
                        <div className="w-full lg:w-1/2 relative">
                            <ScrollReveal variant="zoom-in" duration={1100}>
                                <div className="rounded-[32px] overflow-hidden shadow-[0_25px_50px_rgba(46,26,18,0.15)] border-8 border-white aspect-[4/3] bg-[#fbf9f5] relative group">
                                    <img 
                                        src="/images/about_event_hall.png" 
                                        alt="Flagship Horana Outlet" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#2E1A12]/30 via-transparent to-transparent"></div>
                                </div>
                            </ScrollReveal>
                            
                            {/* Floating Stats Medal */}
                            <div className="absolute -bottom-8 -left-4 md:-left-8 z-20">
                                <ScrollReveal variant="fade-up" duration={800} delay={600}>
                                    <div className="bg-gradient-to-br from-[#d68b3b] to-[#b36a1c] text-white rounded-[24px] px-8 py-6 shadow-[0_15px_35px_rgba(200,132,59,0.35)] flex flex-col items-center gap-1">
                                        <Award className="w-8 h-8 text-white animate-[bounce_3s_infinite]" />
                                        <span className="font-bold text-3xl font-serif mt-1">1986</span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Year Founded</span>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Mission and Vision Section (Glassmorphism cards) */}
                <section className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mission Card */}
                        <ScrollReveal variant="fade-up" duration={800}>
                            <div className="glass rounded-3xl p-6 lg:p-10 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden bg-white/40">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8843B]/5 rounded-full filter blur-2xl group-hover:bg-[#C8843B]/10 transition-colors"></div>
                                <div className="w-12 h-12 rounded-xl bg-white border border-[#f0e6d8] flex items-center justify-center text-[#C8843B] mb-4 shadow-sm group-hover:bg-[#C8843B] group-hover:text-white transition-all duration-500">
                                    <Compass className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2c1d11] font-serif mb-2">Our Mission</h3>
                                <p className="text-[#5a4d41] text-xs md:text-sm leading-relaxed">
                                    To delight customers every day by preparing and serving the highest quality bakery items, snacks, and meals, combining local culinary heritage with innovative, smart service platforms that make dining effortless.
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Vision Card */}
                        <ScrollReveal variant="fade-up" duration={800} delay={200}>
                            <div className="glass rounded-3xl p-6 lg:p-10 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden bg-white/40">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2E1A12]/5 rounded-full filter blur-2xl group-hover:bg-[#2E1A12]/10 transition-colors"></div>
                                <div className="w-12 h-12 rounded-xl bg-white border border-[#f0e6d8] flex items-center justify-center text-[#C8843B] mb-4 shadow-sm group-hover:bg-[#2E1A12] group-hover:text-white transition-all duration-500">
                                    <Eye className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2c1d11] font-serif mb-2">Our Vision</h3>
                                <p className="text-[#5a4d41] text-xs md:text-sm leading-relaxed">
                                    To lead Sri Lanka's food and bakery sector by being the benchmark for freshness, health, and operational automation, establishing the ultimate smart self-service baking network.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* 4. Features Section (Staggered upward card scroll) */}
                <section className="max-w-[1400px] mx-auto px-6 py-16">
                    <div className="text-center mb-16">
                        <ScrollReveal variant="fade-up" duration={800}>
                            <span className="block font-display text-3xl lg:text-4xl text-[#C8843B] font-normal leading-none mb-2 select-none">Why Choose Us</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-[#2c1d11] font-serif">Smart Baking Features</h2>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Feature 1 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={0}>
                            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_25px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] mb-6">
                                        <QrCode className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#2E1A12] font-serif mb-2">QR Code Ordering</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Scan, select and order in just a few taps.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 2 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={150}>
                            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_25px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] mb-6">
                                        <Clock className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#2E1A12] font-serif mb-2">Real-Time Updates</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Track your order status in real time.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 3 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={300}>
                            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_25px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] mb-6">
                                        <Calendar className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#2E1A12] font-serif mb-2">Event Booking</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Book your events and celebrations easily.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 4 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={450}>
                            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_25px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] mb-6">
                                        <Sparkles className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#2E1A12] font-serif mb-2">Personalized Offers</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Smart recommendations and best deals for you.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Feature 5 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={600}>
                            <div className="bg-white rounded-3xl p-6 shadow-[0_12px_25px_rgba(46,26,18,0.03)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-[#fef9e1] flex items-center justify-center text-[#C8843B] mb-6">
                                        <Percent className="w-6 h-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="text-base font-bold text-[#2E1A12] font-serif mb-2">Exclusive Discounts</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Enjoy our daily specials and smart discounts.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>



                {/* 6. Statistics Section (Animated Counters) */}
                <section className="max-w-[1400px] mx-auto px-6 py-16 lg:py-24">
                    <div className="bg-[#3a2618] rounded-[36px] p-8 lg:p-16 text-white grid grid-cols-1 sm:grid-cols-3 gap-10 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#2c1d11] to-[#4A3C31] opacity-50"></div>
                        
                        {/* Stat 1 */}
                        <ScrollReveal variant="fade-up" duration={800} className="relative z-10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-[#C8843B] mb-2 font-serif">
                                <AnimatedCounter end={10240} duration={2500} suffix="+" />
                            </div>
                            <p className="text-xs text-gray-300 font-semibold uppercase tracking-widest">Active Customers</p>
                        </ScrollReveal>

                        {/* Stat 2 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={150} className="relative z-10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-[#C8843B] mb-2 font-serif">
                                <AnimatedCounter end={485300} duration={2500} suffix="+" />
                            </div>
                            <p className="text-xs text-gray-300 font-semibold uppercase tracking-widest">Cumulative Orders</p>
                        </ScrollReveal>

                        {/* Stat 3 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={300} className="relative z-10">
                            <div className="text-4xl lg:text-5xl font-extrabold text-[#C8843B] mb-2 font-serif">
                                <AnimatedCounter end={120} duration={2500} suffix="+" />
                            </div>
                            <p className="text-xs text-gray-300 font-semibold uppercase tracking-widest">Baking Varieties</p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* 7. Gallery Section (Masonry Staggered Grid) */}
                <section className="max-w-[1400px] mx-auto px-6 py-6 pb-12">
                    <div className="text-center mb-10">
                        <ScrollReveal variant="fade-up" duration={800}>
                            <span className="block font-display text-3xl lg:text-4xl text-[#C8843B] font-normal leading-none mb-2 select-none">Our Showcase</span>
                            <h2 className="text-2xl lg:text-3xl font-bold text-[#2c1d11] font-serif">Spaces & Baking Artistry</h2>
                        </ScrollReveal>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Item 1 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={0} className="h-full">
                            <div className="h-full flex flex-col rounded-2xl overflow-hidden border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fcf9f5] group">
                                <img 
                                    src="/images/about_dining_hall.png" 
                                    alt="Fine Dining Space" 
                                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2E1A12] text-sm font-serif">Fine Dining Space</h4>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">Elegant, clean dining area in Horana</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Item 2 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={100} className="h-full">
                            <div className="h-full flex flex-col rounded-2xl overflow-hidden border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fcf9f5] group">
                                <img 
                                    src="/images/about_event_hall.png" 
                                    alt="Flagship Horana Outlet" 
                                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2E1A12] text-sm font-serif">Flagship Horana Outlet</h4>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">Our beautiful multi-level bakery, café, and restaurant at night</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Item 3 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={200} className="h-full">
                            <div className="h-full flex flex-col rounded-2xl overflow-hidden border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fcf9f5] group">
                                <img 
                                    src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400" 
                                    alt="Our Smart Kitchen" 
                                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2E1A12] text-sm font-serif">Our Smart Kitchen</h4>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">State-of-the-art baking automated machinery</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Item 4 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={300} className="h-full">
                            <div className="h-full flex flex-col rounded-2xl overflow-hidden border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fcf9f5] group">
                                <img 
                                    src="/images/chocolate_cake_1779987318818.png" 
                                    alt="Handcrafted Cakes" 
                                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2E1A12] text-sm font-serif">Handcrafted Cakes</h4>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">Celebration cakes made with fresh butter</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Item 5 */}
                        <ScrollReveal variant="fade-up" duration={800} delay={400} className="h-full">
                            <div className="h-full flex flex-col rounded-2xl overflow-hidden border-4 border-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fcf9f5] group">
                                <img 
                                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400" 
                                    alt="Fresh Crusty Loaves" 
                                    className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2E1A12] text-sm font-serif">Fresh Crusty Loaves</h4>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">Our original wood-fired recipe since 1986</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* 8. Call to Action Section */}
                <section className="max-w-[1400px] mx-auto px-6 pb-16">
                    <ScrollReveal variant="zoom-in" duration={900}>
                        <div className="bg-[#2c1d11] rounded-3xl text-white p-8 md:p-14 text-center relative overflow-hidden border border-white/10 shadow-2xl">
                            {/* Background Cover Overlay */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 mix-blend-overlay transition-transform duration-1000"
                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200")' }}
                            ></div>
                            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#d68b3b] rounded-full mix-blend-overlay filter blur-[100px] opacity-40"></div>
                            
                            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center gap-4">
                                <span className="block font-display text-3xl lg:text-4xl text-[#C8843B] font-normal leading-none mb-2 select-none">Ready to Taste the Future?</span>
                                <h3 className="text-2xl md:text-3xl font-bold font-serif leading-tight text-white">
                                    Experience Wholesome Quality and Smart Comfort
                                </h3>
                                <p className="text-[#e6dfd5] text-xs md:text-sm opacity-90 leading-relaxed font-sans max-w-sm">
                                    Explore our delicious deals, add fresh bundles to your cart, or scan a table QR code to start eating instantly.
                                </p>
                                
                                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                                    <a 
                                        href="/menus" 
                                        className="bg-[#C8843B] hover:bg-[#b36a1c] text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2"
                                    >
                                        Explore Curated Menu <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </a>
                                    <a 
                                        href="/order" 
                                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3 rounded-full border border-white/20 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        Order Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>
            </div>
            
            <Footer />
        </div>
    );
};

export default AboutUs;
