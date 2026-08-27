import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PublicCateringPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await api.get('/catering');
                if (response.data.success) {
                    // Filter only active packages for the public view
                    const activePackages = response.data.data.filter(pkg => pkg.status === 'active');
                    setPackages(activePackages);
                }
            } catch (error) {
                console.error('Failed to fetch catering packages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);



    return (
        <div className="min-h-screen bg-[#fef9e1] font-sans selection:bg-[#d68b3b] selection:text-white flex flex-col justify-between text-[#2E1A12]">
            <div>
                <Header />

                {/* Hero Section */}
                <section className="pt-32 pb-16 px-6 text-center">
                    <ScrollReveal variant="fade-up" duration={800}>
                        <span className="text-[#C8843B] text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Premium Dining</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#2E1A12] font-serif leading-tight">Our Catering Packages</h1>
                        <p className="text-sm md:text-base text-gray-500 mt-4 max-w-xl mx-auto">
                            Explore our premium catering options designed to make your events truly spectacular.
                        </p>
                    </ScrollReveal>
                </section>

                {/* Catering Packages Showcase Section */}
                <section className="max-w-[1400px] mx-auto px-6 py-12 mb-16 relative">
                    {loading ? (
                        <div className="text-center py-20 text-gray-500 font-medium">Loading packages...</div>
                    ) : packages.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 font-medium">No catering packages available at the moment.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {packages.map((pkg, idx) => (
                                <ScrollReveal key={pkg.id} variant="fade-up" duration={800} delay={idx * 150}>
                                    <div className="bg-white rounded-3xl p-8 border border-[#f0e6d8] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8843B]/5 rounded-bl-[100px] -z-10"></div>
                                        <h3 className="text-xl font-bold text-[#2E1A12] mb-1 font-serif">{pkg.name}</h3>
                                        <div className="text-2xl font-black text-[#C8843B] mb-4">
                                            Rs. {Number(pkg.price).toLocaleString()} <span className="text-xs text-gray-400 font-semibold uppercase">/ Head</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed pb-4 border-b border-gray-100">{pkg.description}</p>
                                        
                                        <ul className="text-xs text-gray-600 space-y-2.5 mb-8 flex-1">
                                            {Array.isArray(pkg.items) && pkg.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#C8843B] shrink-0"></div>
                                                    <span className="leading-tight">{item}</span>
                                                </li>
                                            ))}
                                        </ul>


                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <Footer />
        </div>
    );
};

export default PublicCateringPackages;
