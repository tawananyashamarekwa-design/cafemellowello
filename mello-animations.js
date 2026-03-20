/**
 * Mello Wello Premium Animation Module (Optimized)
 * Focused on lightweight GSAP and interactive effects.
 */

class MelloAnimations {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    init() {
        this.initGSAP();
        // Wait for elements to be ready
        setTimeout(() => {
            this.initHeroImageScrollEffects();
            this.initBackgroundShapeScrollEffects();
        }, 50); // Faster initialization
        this.initListeners();
        this.createBackgroundParticles();
    }

    createBackgroundParticles() {
        const container = document.getElementById('bakery-particles-container');
        if (!container) return;

        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 5 : 10; // Reduced count for performance

        const particleTypes = ['🧁', '✨', '🥯', '🍰'];
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.fontSize = (Math.random() * 15 + 10) + 'px'; // Slightly smaller
            p.style.animationDelay = (Math.random() * 5) + 's';
            p.style.animationDuration = (Math.random() * 10 + 15) + 's'; // Slower, smoother
            container.appendChild(p);
        }
    }

    initGSAP() {
        if (!window.gsap || !window.ScrollTrigger) return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Section Reveal
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 30, // Reduced movement
                duration: 0.8,
                ease: "power2.out",
                clearProps: "all" // Performance: remove inline styles after animation
            });
        });

        // Showcase Image Scroll Parallax (Simplified)
        gsap.utils.toArray('.showcase-img').forEach(img => {
            gsap.from(img, {
                scrollTrigger: {
                    trigger: img,
                    start: "top 95%",
                    scrub: false // Removed scrub for better performance on mid-range devices
                },
                scale: 0.95,
                opacity: 0.8,
                duration: 0.5
            });
        });
    }

    initHeroImageScrollEffects() {
        const heroImg = document.querySelector('.hero-interactive-img');
        const imgInner = document.querySelector('.interactive-image-inner');

        if (heroImg && imgInner) {
            // Mouse Parallax (Interactive on mouse move) - Debounced feel with longer duration
            window.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const moveX = (clientX - centerX) / 40; // Less extreme
                const moveY = (clientY - centerY) / 40;

                gsap.to(heroImg, {
                    x: moveX,
                    y: moveY,
                    duration: 1.5,
                    ease: "power2.out"
                });

                gsap.to(imgInner, {
                    rotationY: moveX / 4,
                    rotationX: -moveY / 4,
                    duration: 1.5,
                    ease: "power2.out"
                });
            });

            // Scroll Animation (Keep it simple)
            gsap.to(heroImg, {
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                },
                scale: 1.15, // Reduced from 1.3
                y: 30,
                ease: "none"
            });
        }
    }

    initBackgroundShapeScrollEffects() {
        const shapes = document.querySelectorAll('.shape');
        if (!shapes.length) return;

        shapes.forEach((shape, index) => {
            const movement = (index + 1) * 50; // Half the movement

            gsap.to(shape, {
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5,
                },
                y: -movement,
                x: (index % 2 === 0 ? movement : -movement) / 2,
                opacity: 0.4, // Fade out as we scroll down
                ease: "none"
            });
        });
    }

    initListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) - 0.5;
            this.mouseY = (e.clientY / window.innerHeight) - 0.5;
        });
    }
}

// Optimized initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new MelloAnimations());
} else {
    new MelloAnimations();
}
