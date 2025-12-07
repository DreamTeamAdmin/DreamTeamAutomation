(function() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCurrent = document.getElementById('lightbox-current');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const images = Array.from(galleryItems).map(item => item.querySelector('img').src);
    let currentIndex = 0;

    // Open lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            showImage(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Show image
    function showImage(index) {
        lightboxImg.src = images[index];
        lightboxCurrent.textContent = index + 1;
    }

    // Navigation
    const prev = document.querySelector('.lightbox-prev');
    const next = document.querySelector('.lightbox-next');
    if (prev) {
        prev.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        });
    }
    if (next) {
        next.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        });
    }

    // Close lightbox
    const closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        }
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }
    });
})();

