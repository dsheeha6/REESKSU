// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
    this.classList.toggle('active');
});

// Slideshow Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentSlide = 0;
    const slideCount = slides.length;

    // Show first slide
    slides[0].style.opacity = '1';

    // Function to update slideshow
    function updateSlideshow() {
        slides.forEach((slide, index) => {
            slide.style.opacity = index === currentSlide ? '1' : '0';
        });
        dots.forEach((dot, index) => {
            dot.style.background = index === currentSlide ? 'var(--primary)' : '#ccc';
        });
    }

    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlideshow();
    }

    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlideshow();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlideshow();
        });
    });

    // Auto advance slides every 5 seconds
    setInterval(nextSlide, 5000);
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.navbar')) {
        document.querySelector('.nav-links').classList.remove('active');
    }
}); 