// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Launch Quantum button
document.querySelector('.btn-primary').addEventListener('click', function() {
    alert('Quantum launcher coming soon! 🚀');
});

// Page load animation
window.addEventListener('load', function() {
    console.log('Blank Paper Comics loaded!');
});
