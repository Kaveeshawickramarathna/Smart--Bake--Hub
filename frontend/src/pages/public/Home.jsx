import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Utensils, Clock, Calendar, Sparkles, Percent, Star, Award, ShoppingBag, Users, CalendarDays, ArrowRight, Wheat, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const Home = () => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const handleBookClick = (e) => {
        if (!user) {
            e.preventDefault();
            toast.error("Login or Signup Required to book an event!");
            navigate('/login');
        } else {
            navigate('/bookings');
        }
    };
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewName, setReviewName] = useState('');
    const [reviewRole, setReviewRole] = useState('Customer');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const defaultReviews = [
        {
            name: "Kasun Perera",
            role: "Regular Customer",
            rating: 5,
            text: "The Smart Deals feature is amazing! I always get exactly what I'm craving for a discounted price. Their chocolate truffle cake is absolutely out of this world."
        },
        {
            name: "Nethmi Silva",
            role: "Event Organizer",
            rating: 5,
            text: "Booking an event through the Smart Bake Hub was seamless. The pastries were fresh, and the self-service ordering system made our party run so smoothly!"
        },
        {
            name: "Kavindi Fernando",
            role: "Food Blogger",
            rating: 5,
            text: "The QR code ordering is incredibly fast. I love how I can sit down, scan, and have my coffee and croissants brought right to me without waiting in line."
        }
    ];

    const [testimonials, setTestimonials] = useState(() => {
        const saved = localStorage.getItem('smart_bake_reviews');
        return saved ? JSON.parse(saved) : defaultReviews;
    });

    const handleOpenModal = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setReviewName(user?.name || '');
        setReviewRole(user?.role === 'admin' ? 'Admin' : user?.role === 'staff' ? 'Staff' : 'Customer');
        setReviewRating(rating || 5);
        setReviewText('');
        setShowReviewModal(true);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!reviewName.trim() || !reviewText.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (isEditing) {
            const updated = testimonials.map((item, i) => {
                if (i === editingIndex) {
                    return {
                        ...item,
                        name: reviewName,
                        role: reviewRole || 'Customer',
                        rating: reviewRating,
                        text: reviewText
                    };
                }
                return item;
            });
            setTestimonials(updated);
            localStorage.setItem('smart_bake_reviews', JSON.stringify(updated));

            setIsEditing(false);
            setEditingIndex(null);
            setReviewText('');
            setShowReviewModal(false);
            toast.success('Review updated successfully.');
        } else {
            const newReview = {
                name: reviewName,
                role: reviewRole || 'Customer',
                rating: reviewRating,
                text: reviewText,
                userId: user?.id || null
            };

            const updated = [newReview, ...testimonials];
            setTestimonials(updated);
            localStorage.setItem('smart_bake_reviews', JSON.stringify(updated));

            // Reset and close
            setReviewText('');
            setShowReviewModal(false);
            toast.success('Thank you! Your review has been submitted.');
        }
    };

    const handlePrevReview = () => {
        setCurrentReviewIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const handleNextReview = () => {
        setCurrentReviewIndex(prev => (prev + 1) % testimonials.length);
    };

    const handleDeleteReview = (index) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            const updated = testimonials.filter((_, i) => i !== index);
            setTestimonials(updated);
            localStorage.setItem('smart_bake_reviews', JSON.stringify(updated));

            if (currentReviewIndex >= updated.length) {
                setCurrentReviewIndex(Math.max(0, updated.length - 1));
            }
            toast.success("Review deleted successfully.");
        }
    };

    const handleEditReview = (index) => {
        const review = testimonials[index];
        setReviewName(review.name);
        setReviewRole(review.role);
        setReviewText(review.text);
        setReviewRating(review.rating);
        setEditingIndex(index);
        setIsEditing(true);
        setShowReviewModal(true);
    };

    const visibleReviews = testimonials.length > 0 ? [
        testimonials[currentReviewIndex],
        testimonials[(currentReviewIndex + 1) % testimonials.length],
        testimonials[(currentReviewIndex + 2) % testimonials.length]
    ] : [];

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const categoriesList = [
        {
            title: "Bakery",
            description: "Freshly baked daily",
            img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop",
            link: "/menus",
            icon: (className) => (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V9m0 0l-3.5 3.5M12 9l3.5 3.5M12 3v2M5 10c0-2.5 2-5 6-5s6 2.5 6 5M5 21v-6a2 2 0 012-2h10a2 2 0 012 2v6" />
                </svg>
            )
        },
        {
            title: "Meals",
            description: "Delicious & healthy",
            img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop",
            link: "/menus",
            icon: (className) => <Utensils className={className} />
        },
        {
            title: "Beverages",
            description: "Refreshing drinks",
            img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500&auto=format&fit=crop",
            link: "/menus",
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2 v-5l-3-4z" />
                </svg>
            )
        },
        {
            title: "Cakes",
            description: "Made for celebrations",
            img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=500&auto=format&fit=crop",
            link: "/menus",
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                </svg>
            )
        }
    ];



    const eventTypes = [
        { title: 'Birthday Parties', desc: 'Celebrate your special day with our custom cakes and beautiful venues.', icon: '🎉' },
        { title: 'Weddings & Anniversaries', desc: 'Make your big day unforgettable with elegant decor and premium catering.', icon: '💍' },
        { title: 'Corporate Events', desc: 'Professional settings, high-quality catering, and seamless service.', icon: '🏢' },
    ];

    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                {/* Hero Section */}
                 {/* Hero Section */}
                <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden py-16 lg:py-24 bg-[#FEF9E1]">
                    {/* Parallax Background Widescreen Pastries Image (Full Width) */}
                    <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-right bg-no-repeat transition-transform duration-100 ease-out pointer-events-none"
                        style={{ 
                            backgroundImage: 'url("/images/hero_cake_pastries_full.png")',
                            transform: `translateY(${scrollY * 0.12}px)`,
                        }}
                    ></div>
                    {/* Smooth blend overlay matching mockup */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FEF9E1] via-[#FEF9E1]/75 to-transparent pointer-events-none"></div>

                    <div className="w-full max-w-[1400px] mx-auto px-6 relative z-10">
                        <div className="flex flex-col items-center justify-center w-full">
                            
                            {/* Hero Text */}
                            <div className="w-full max-w-3xl relative z-10 flex flex-col items-center text-center mx-auto">
                                <ScrollReveal variant="fade-up" duration={900} delay={100} className="w-full flex justify-center">
                                    <div className="inline-flex items-center gap-2 bg-white border border-[#e8decf] px-4 py-2.5 rounded-full shadow-sm mb-2">
                                        <Wheat className="w-4 h-4 text-[#d68b3b]" />
                                        <span className="text-xs font-semibold text-[#3a1d08] tracking-wide">
                                            Freshly Baked. <span className="text-[#d68b3b]">Smartly Served.</span>
                                        </span>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal variant="fade-up" duration={950} delay={200} className="w-full text-center flex justify-center">
                                    <span className="block font-display text-4xl lg:text-5xl text-[#C8843B] font-normal leading-none -mb-2 select-none text-center relative z-10">Welcome to</span>
                                </ScrollReveal>

                                <ScrollReveal variant="fade-up" duration={950} delay={250} className="w-full text-center flex flex-col items-center justify-center">
                                    <h1 className="text-4xl lg:text-[3.25rem] font-bold text-[#2E1A12] leading-[1.05] tracking-tight font-sans text-center">
                                        Smart Bakery <br />
                                        Smarter Experience
                                    </h1>
                                    <div className="w-32 h-[3px] bg-[#C8843B] my-2 rounded-full mx-auto"></div>
                                </ScrollReveal>

                                <ScrollReveal variant="fade-up" duration={1000} delay={400} className="w-full text-center flex justify-center">
                                    <p className="text-[#5a4d41] text-sm lg:text-base mb-4 max-w-xl leading-relaxed font-medium mx-auto text-center">
                                        Scan, Order, Enjoy! Explore our delicious bakery items, meals, beverages and cakes with a smart self-service experience.
                                    </p>
                                </ScrollReveal>


                            </div>

                        </div>
                    </div>
                </section>

                {/* Info Bar (Staggered Reveals) */}
                <section className="max-w-[1400px] mx-auto px-6 relative z-20 -mt-16 lg:-mt-24 mb-16">
                    <ScrollReveal variant="fade-up" duration={850}>
                        <div className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(44,29,17,0.08)] p-6 lg:px-10 lg:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 items-center border border-white/60">
                            
                            <div className="flex items-start gap-4">
                                <div className="text-[#3a1d08] mt-1 shrink-0">
                                    <QrCode className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2c1d11] text-sm mb-1">QR Code Ordering</h4>
                                    <p className="text-[11px] text-[#888] leading-relaxed">Scan, select and order<br/>in just a few taps.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="text-[#3a1d08] mt-1 shrink-0">
                                    <Clock className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2c1d11] text-sm mb-1">Real-Time Updates</h4>
                                    <p className="text-[11px] text-[#888] leading-relaxed">Track your order status<br/>in real time.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="text-[#3a1d08] mt-1 shrink-0">
                                    <Calendar className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2c1d11] text-sm mb-1">Event Booking</h4>
                                    <p className="text-[11px] text-[#888] leading-relaxed">Book your events and<br/>celebrations easily.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="text-[#3a1d08] mt-1 shrink-0">
                                    <Sparkles className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2c1d11] text-sm mb-1">Personalized Offers</h4>
                                    <p className="text-[11px] text-[#888] leading-relaxed">Smart recommendations<br/>and best deals for you.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="text-[#3a1d08] mt-1 shrink-0">
                                    <Percent className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2c1d11] text-sm mb-1">Exclusive Discounts</h4>
                                    <p className="text-[11px] text-[#888] leading-relaxed">Enjoy our daily specials<br/>and smart discounts.</p>
                                </div>
                            </div>

                        </div>
                    </ScrollReveal>
                </section>

                {/* Premium Smart Deals CTA Banner */}
                <section className="max-w-[1100px] mx-auto px-6 py-2 mb-10">
                    <ScrollReveal variant="zoom-in" duration={900}>
                        <Link to="/smart-deals" className="block relative overflow-hidden rounded-3xl shadow-[0_15px_30px_-10px_rgba(46,26,18,0.15)] group bg-[#2c1d11]">
                            <div 
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop")' }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1A110B] via-[#1A110B]/80 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1A110B]/80 via-transparent to-transparent opacity-80"></div>
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#d68b3b] rounded-full mix-blend-overlay filter blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>

                            <div className="relative z-10 px-6 py-6 sm:px-10 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex-1 max-w-xl z-20">
                                    <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-[#fef9e1] px-2.5 py-1 rounded-full mb-3 transform transition-transform group-hover:-translate-y-1">
                                        <Sparkles className="w-3 h-3 text-[#d68b3b]" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Limited Time Offers</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl lg:text-[2.25rem] text-white font-bold font-serif leading-tight mb-2.5 drop-shadow-md">
                                        Unlock <span className="text-[#d68b3b] italic">Exclusive</span> Savings
                                    </h3>
                                    <p className="text-[#e6dfd5] text-xs sm:text-sm opacity-95 mb-4 max-w-md">
                                        Grab our freshly baked daily specials before they're gone! Click to view all live active deals.
                                    </p>

                                    <div className="relative inline-flex group/btn">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[#d68b3b] to-[#f4a261] rounded-full blur opacity-30 group-hover/btn:opacity-80 transition duration-500"></div>
                                        <div className="relative bg-[#d68b3b] text-white px-5 py-2 rounded-full font-bold text-xs flex items-center gap-2 overflow-hidden shadow-lg border border-white/10">
                                            <span className="relative z-10">Explore Deals</span>
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center relative z-10 group-hover/btn:translate-x-1 transition-transform">
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </ScrollReveal>
                </section>



                {/* Popular Categories (Staggered Grid) */}
                <section className="max-w-[1400px] mx-auto px-6 py-8 mb-16">
                    <div className="text-center mb-12">
                        <ScrollReveal variant="fade-up" duration={800}>
                            <span className="text-[#d68b3b] text-[10px] font-bold uppercase tracking-widest mb-2 block">What would you like today?</span>
                            <h2 className="text-3xl font-bold text-[#2c1d11] font-serif flex flex-col items-center">
                                Popular Categories
                                <svg width="80" height="20" viewBox="0 0 80 20" fill="none" className="mt-2 text-[#d68b3b]">
                                    <path d="M40 10c-5-2-10-5-20-5S5 8 5 8m35 2c5-2 10-5 20-5s15 3 15 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                    <circle cx="40" cy="10" r="3" fill="currentColor"/>
                                </svg>
                            </h2>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categoriesList.map((cat, idx) => (
                            <ScrollReveal 
                                key={idx} 
                                variant="fade-up" 
                                duration={800} 
                                delay={idx * 150}
                            >
                                <Link to={cat.link} className="flex flex-col items-center text-center cursor-pointer group bg-white p-6 rounded-3xl border border-[#f0e6d8]/40 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                                    <div className="relative mb-5 w-[110px] mx-auto">
                                        <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-4 border-white bg-[#fcfaf5] relative z-10 shadow-md">
                                            <img src={cat.img} alt={cat.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full p-2.5 shadow-md z-30 text-[#d68b3b] border border-white group-hover:bg-[#d68b3b] group-hover:text-white transition-all duration-300">
                                            {cat.icon("w-4.5 h-4.5")}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-[#2E1A12] text-base mb-1 group-hover:text-[#d68b3b] transition-colors">{cat.title}</h3>
                                    <p className="text-[11px] text-[#2E1A12]/60 font-semibold">{cat.description}</p>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>

                {/* Bottom Stats Bar */}
                <section className="max-w-[1400px] mx-auto px-6 mb-16">
                    <ScrollReveal variant="fade-up" duration={850}>
                        <div className="bg-[#3a2618] rounded-[32px] py-8 px-10 text-white grid grid-cols-2 lg:grid-cols-5 gap-8 justify-between items-center shadow-xl">
                            <div className="flex items-center gap-4">
                                <ShoppingBag className="w-7 h-7 text-[#C8843B] shrink-0 stroke-[1.5]" />
                                <div>
                                    <div className="text-2xl font-bold font-serif mb-0.5">500+</div>
                                    <div className="text-[10px] text-gray-300">Daily Orders</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Users className="w-7 h-7 text-[#C8843B] shrink-0 stroke-[1.5]" />
                                <div>
                                    <div className="text-2xl font-bold font-serif mb-0.5">10K+</div>
                                    <div className="text-[10px] text-gray-300">Happy Customers</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Wheat className="w-7 h-7 text-[#C8843B] shrink-0 stroke-[1.5]" />
                                <div>
                                    <div className="text-2xl font-bold font-serif mb-0.5">50+</div>
                                    <div className="text-[10px] text-gray-300">Bakery Varieties</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <CalendarDays className="w-7 h-7 text-[#C8843B] shrink-0 stroke-[1.5]" />
                                <div>
                                    <div className="text-2xl font-bold font-serif mb-0.5">200+</div>
                                    <div className="text-[10px] text-gray-300">Events Managed</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 col-span-2 lg:col-span-1">
                                <Star className="w-7 h-7 text-[#C8843B] shrink-0 stroke-[1.5] fill-[#C8843B]" />
                                <div>
                                    <div className="text-2xl font-bold font-serif mb-0.5">4.8 / 5</div>
                                    <div className="text-[10px] text-gray-300">Customer Rating</div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                {/* Event Types Section */}
                <section className="max-w-[1400px] mx-auto px-6 py-12 mb-4 relative">
                    <div className="text-center mb-12">
                        <ScrollReveal variant="fade-up" duration={800}>
                            <span className="text-[#C8843B] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Celebrate With Us</span>
                            <h2 className="text-3xl font-bold text-[#2E1A12] font-serif leading-tight">Our Event Types</h2>
                            <p className="text-sm text-gray-500 mt-4 max-w-xl mx-auto">
                                Host your events at our beautiful venues. Discover the perfect setting for your next unforgettable occasion.
                            </p>
                        </ScrollReveal>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {eventTypes.map((ev, idx) => (
                            <ScrollReveal key={idx} variant="fade-up" duration={800} delay={idx * 150}>
                                <div className="bg-[#FFFDFC] rounded-3xl p-6 border border-[#f0e6d8] shadow-sm hover:shadow-md transition-all text-center h-full flex flex-col items-center justify-center">
                                    <div className="text-4xl mb-4">{ev.icon}</div>
                                    <h3 className="text-lg font-bold text-[#2E1A12] mb-2 font-serif">{ev.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed px-4">{ev.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>



                {/* Customer Reviews Section */}
                <section className="max-w-[1400px] mx-auto px-6 py-12 relative mb-16">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFFDFC] via-[#fdfaf5] to-[#f4ebe1] rounded-[32px] border border-white z-0"></div>
                    <div className="absolute inset-0 overflow-hidden rounded-[32px] z-0 pointer-events-none">
                        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#C8843B]/10 blur-[120px]"></div>
                        <div className="absolute bottom-[-20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#2E1A12]/5 blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 px-4 py-8 md:p-12">
                        <div className="text-center mb-10">
                            <ScrollReveal variant="fade-up" duration={800}>
                                <span className="text-[#C8843B] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Testimonials</span>
                                <h2 className="text-3xl font-bold text-[#2E1A12] font-serif leading-tight">What Our Customers Say</h2>
                            </ScrollReveal>
                        </div>

                        <div className="relative flex items-center w-full mb-8">
                            {/* Left Arrow Button */}
                            <button 
                                onClick={handlePrevReview}
                                className="absolute -left-4 lg:-left-12 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#f0e6d8] shadow-md flex items-center justify-center text-[#2E1A12] hover:bg-[#C8843B] hover:text-white transition-all cursor-pointer active:scale-95"
                                aria-label="Previous review"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Grid of Reviews */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-6 lg:px-0">
                                {visibleReviews.map((item, idx) => {
                                    const originalIndex = (currentReviewIndex + idx) % testimonials.length;
                                    return (
                                        <ScrollReveal 
                                            key={`${currentReviewIndex}-${idx}`} 
                                            variant="fade-up" 
                                            duration={500}
                                            className={
                                                idx === 1 
                                                    ? "hidden md:block h-full animate-[fadeIn_0.3s_ease-out]" 
                                                    : idx === 2 
                                                        ? "hidden lg:block h-full animate-[fadeIn_0.3s_ease-out]" 
                                                        : "h-full animate-[fadeIn_0.3s_ease-out]"
                                            }
                                        >
                                            <div className="bg-white rounded-[24px] p-6 shadow-[0_12px_25px_rgba(46,26,18,0.02)] border border-[#f0e6d8]/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full relative">
                                                {/* Action buttons (Edit/Delete) */}
                                                {user && (user.role === 'admin' || item.userId === user.id || item.name === user.name) && (
                                                    <div className="absolute top-6 right-6 flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleEditReview(originalIndex)}
                                                            className="p-1.5 text-gray-400 hover:text-[#C8843B] hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                                                            title="Edit Review"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteReview(originalIndex)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                                                            title="Delete Review"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="flex gap-1 mb-4 text-[#F5A623]">
                                                        {Array.from({ length: 5 }).map((_, sIdx) => (
                                                            <Star 
                                                                key={sIdx} 
                                                                className={`w-3.5 h-3.5 ${sIdx < item.rating ? 'fill-current text-[#F5A623]' : 'text-gray-200'}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-[#2E1A12]/70 text-xs leading-relaxed mb-6 font-medium pr-12">
                                                        "{item.text}"
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#2E1A12] text-sm font-serif">{item.name}</h4>
                                                    <span className="text-[9px] text-[#C8843B] font-bold uppercase tracking-wider">{item.role}</span>
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                    );
                                })}
                            </div>

                            {/* Right Arrow Button */}
                            <button 
                                onClick={handleNextReview}
                                className="absolute -right-4 lg:-right-12 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#f0e6d8] shadow-md flex items-center justify-center text-[#2E1A12] hover:bg-[#C8843B] hover:text-white transition-all cursor-pointer active:scale-95"
                                aria-label="Next review"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Interactive Review Star Selector CTA */}
                        <ScrollReveal variant="fade-up" duration={800} delay={400}>
                            <div className="flex justify-center mt-8">
                                <div className="bg-white/80 backdrop-blur-xl rounded-full p-2.5 pr-6 shadow-sm border border-[#f0e6d8] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:shadow-md transition-all">
                                    <button 
                                        onClick={handleOpenModal}
                                        className="w-full sm:w-auto bg-[#2E1A12] text-white hover:bg-[#C8843B] py-3 px-8 rounded-full font-medium text-[11px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Write a Review <Sparkles className="w-4 h-4 text-[#C8843B]" />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-[#2E1A12] text-[11px] hidden sm:block">Rate your visit:</span>
                                        <div className="flex gap-1 cursor-pointer">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star}
                                                    onClick={() => { setRating(star); toast.success(`Rated ${star} Stars! Thank you.`); }}
                                                    onMouseEnter={() => setHover(star)}
                                                    onMouseLeave={() => setHover(0)}
                                                    className={`w-5.5 h-5.5 transition-all duration-300 transform hover:scale-110 ${
                                                        star <= (hover || rating) 
                                                            ? 'text-[#F5A623] fill-current' 
                                                            : 'text-gray-200'
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </div>

            <Footer />

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-[#2E1A12]/40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowReviewModal(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-[#FFFDFC] border border-[#e6dfd5] w-full max-w-md rounded-[32px] p-8 shadow-2xl z-10 animate-[zoomIn_0.3s_ease-out]">
                        <h3 className="text-2xl font-bold font-serif text-[#2E1A12] mb-2 text-center">{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>
                        <p className="text-[11px] text-gray-500 font-medium text-center mb-6">{isEditing ? 'Update your review comment below' : 'Share your baking experience with our community'}</p>
                        
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            {/* Stars Selector */}
                            <div className="flex flex-col items-center gap-1.5 mb-4">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Rating</span>
                                <div className="flex gap-1.5 cursor-pointer">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star}
                                            onClick={() => setReviewRating(star)}
                                            className={`w-7 h-7 transition-all duration-300 transform hover:scale-115 ${
                                                star <= reviewRating 
                                                    ? 'text-[#F5A623] fill-current' 
                                                    : 'text-gray-200'
                                            }`} 
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C8843B] focus:ring-1 focus:ring-[#C8843B] transition-all font-medium text-[#2E1A12]"
                                    placeholder="Enter your name"
                                    value={reviewName}
                                    onChange={(e) => setReviewName(e.target.value)}
                                />
                            </div>

                            {/* Role/Designation Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Role</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C8843B] focus:ring-1 focus:ring-[#C8843B] transition-all font-medium text-[#2E1A12]"
                                    placeholder="e.g. Regular Customer, Food Critic"
                                    value={reviewRole}
                                    onChange={(e) => setReviewRole(e.target.value)}
                                />
                            </div>

                            {/* Comment Textarea */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Review Comment</label>
                                <textarea 
                                    required 
                                    rows="4"
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm outline-none focus:border-[#C8843B] focus:ring-1 focus:ring-[#C8843B] transition-all font-medium text-[#2E1A12] resize-none"
                                    placeholder="Tell us what you liked (or how we can improve!)..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                ></textarea>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-grow py-3 px-4 border border-[#e6dfd5] text-[#2E1A12] font-bold text-xs rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-center font-sans"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-grow py-3 px-4 bg-[#2E1A12] text-white font-bold text-xs rounded-xl hover:bg-[#C8843B] transition-all shadow-md cursor-pointer text-center font-sans"
                                >
                                    {isEditing ? 'Save Changes' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
