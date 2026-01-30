// ============================================
// Navigation & Mobile Menu
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Active navigation highlighting
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinksAll = document.querySelectorAll('.nav-link');

navLinksAll.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
        link.classList.add('active');
    }
});

// ============================================
// Smooth Scroll
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Scroll Animations
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.destination-card, .stat-card, .gallery-item');
    animatedElements.forEach(el => observer.observe(el));
});

// ============================================
// Image Slider/Carousel
// ============================================

class ImageSlider {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.slider-track');
        this.slides = container.querySelectorAll('.slider-slide');
        this.prevBtn = container.querySelector('.slider-nav.prev');
        this.nextBtn = container.querySelector('.slider-nav.next');
        this.dots = container.querySelectorAll('.slider-dot');
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        this.startAutoPlay();
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.updateSlider();
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.updateSlider();
    }
    
    updateSlider() {
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize all sliders
document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => new ImageSlider(slider));
});

// ============================================
// Modal/Lightbox
// ============================================

class ImageLightbox {
    constructor() {
        this.modal = null;
        this.currentImages = [];
        this.currentIndex = 0;
        this.init();
    }
    
    init() {
        // Create modal structure
        this.createModal();
        
        // Add click listeners to gallery items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-item') || e.target.closest('.attraction-image')) {
                const item = e.target.closest('.gallery-item') || e.target.closest('.attraction-image');
                this.openLightbox(item);
            }
        });
    }
    
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="" alt="">
                <button class="modal-nav prev">&#8249;</button>
                <button class="modal-nav next">&#8250;</button>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeLightbox());
        modal.querySelector('.modal-nav.prev').addEventListener('click', () => this.prevImage());
        modal.querySelector('.modal-nav.next').addEventListener('click', () => this.nextImage());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.classList.contains('active')) {
                if (e.key === 'Escape') this.closeLightbox();
                if (e.key === 'ArrowLeft') this.prevImage();
                if (e.key === 'ArrowRight') this.nextImage();
            }
        });
    }
    
    openLightbox(item) {
        // Get all images in the gallery
        const gallery = item.closest('.gallery-grid') || item.closest('.attractions-list');
        let images = [];
        
        if (gallery) {
            const items = gallery.querySelectorAll('img');
            images = Array.from(items).map(img => img.src);
        } else {
            images = [item.src || item.querySelector('img')?.src];
        }
        
        this.currentImages = images;
        this.currentIndex = images.findIndex(src => 
            src === item.src || src === item.querySelector('img')?.src
        );
        
        if (this.currentIndex === -1) this.currentIndex = 0;
        
        this.updateModalImage();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    updateModalImage() {
        const img = this.modal.querySelector('img');
        img.src = this.currentImages[this.currentIndex];
    }
    
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
        this.updateModalImage();
    }
    
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
        this.updateModalImage();
    }
}

// Initialize lightbox
document.addEventListener('DOMContentLoaded', () => {
    new ImageLightbox();
});

// ============================================
// Tab Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.querySelector(`.tab-content[data-tab="${targetTab}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});

// ============================================
// Form Validation
// ============================================

class FormValidator {
    constructor(form) {
        this.form = form;
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validate()) {
                this.handleSubmit();
            }
        });
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }
    
    validate() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(input) {
        const errorElement = input.parentElement.querySelector('.form-error');
        let isValid = true;
        let errorMessage = '';
        
        // Check if required field is empty
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Update error display
        if (errorElement) {
            if (isValid) {
                errorElement.classList.remove('active');
                input.style.borderColor = '#e0e0e0';
            } else {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('active');
                input.style.borderColor = '#e74c3c';
            }
        }
        
        return isValid;
    }
    
    handleSubmit() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const successMsg = this.form.querySelector('.form-success');
        
        // Show loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
            
            if (successMsg) {
                successMsg.classList.add('active');
                this.form.reset();
                
                setTimeout(() => {
                    successMsg.classList.remove('active');
                }, 5000);
            }
        }, 1500);
    }
}

// Initialize form validation
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.contact-form, .newsletter-form');
    forms.forEach(form => new FormValidator(form));
});

// ============================================
// Back to Top Button
// ============================================

const backToTopBtn = document.querySelector('.back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Animated Counter (for stats)
// ============================================

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + (element.dataset.suffix || '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
        }
    }, 16);
}

// Observe stat numbers
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target || entry.target.textContent);
            animateCounter(entry.target, target);
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => statObserver.observe(stat));
});

// ============================================
// Page Load Animation
// ============================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Fade in hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.animation = 'fadeInUp 1s ease forwards';
    }
});


