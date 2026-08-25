import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ 
    children, 
    className = '', 
    variant = 'fade-up', 
    delay = 0, 
    duration = 800 
}) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { 
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px' // triggers slightly before entering to avoid jarring flashes
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    const getVariantStyles = () => {
        switch (variant) {
            case 'fade-up':
                return isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12 pointer-events-none';
            case 'fade-left':
                return isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-12 pointer-events-none';
            case 'fade-right':
                return isVisible 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-12 pointer-events-none';
            case 'zoom-in':
                return isVisible 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-90 pointer-events-none';
            default:
                return isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12 pointer-events-none';
        }
    };

    return (
        <div
            ref={ref}
            className={`transition-all ease-out-sine ${getVariantStyles()} ${className}`}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
