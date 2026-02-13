/**
 * ASHWIN SDK — Carousel Module
 * Horizontal snap carousel for project cards with 3D tilt,
 * center-focus, and keyboard navigation.
 */

(function () {
    'use strict';

    const track = document.querySelector('.carousel__track');
    const cards = document.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.carousel__arrow--prev');
    const nextBtn = document.querySelector('.carousel__arrow--next');

    if (!track || cards.length === 0) return;

    let currentIndex = 0;

    // ── Update Center Card ──────────────────────────────────
    function updateCenter() {
        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;

        let closestIdx = 0;
        let closestDist = Infinity;

        cards.forEach((card, i) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const dist = Math.abs(trackCenter - cardCenter);

            card.classList.remove('center');

            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        });

        cards[closestIdx]?.classList.add('center');
        currentIndex = closestIdx;
    }

    // ── Scroll To Index ─────────────────────────────────────
    function scrollToIndex(index) {
        index = Math.max(0, Math.min(index, cards.length - 1));
        const card = cards[index];
        if (!card) return;

        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const trackCenter = track.offsetWidth / 2;
        track.scrollTo({
            left: cardCenter - trackCenter,
            behavior: 'smooth',
        });
    }

    // ── Arrow Navigation ────────────────────────────────────
    prevBtn?.addEventListener('click', () => {
        scrollToIndex(currentIndex - 1);
    });

    nextBtn?.addEventListener('click', () => {
        scrollToIndex(currentIndex + 1);
    });

    // ── Keyboard Navigation ────────────────────────────────
    track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollToIndex(currentIndex - 1);
            cards[Math.max(0, currentIndex - 1)]?.focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollToIndex(currentIndex + 1);
            cards[Math.min(cards.length - 1, currentIndex + 1)]?.focus();
        }
    });

    // ── Scroll listener ────────────────────────────────────
    let scrollTimer;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateCenter, 50);
    }, { passive: true });

    // ── 3D Tilt on Hover (center card only) ────────────────
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('center')) return;

            const reducedMotion = document.documentElement.dataset.reduceMotion === 'true' ||
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reducedMotion) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 3; // ±3deg max
            const rotateX = ((centerY - y) / centerY) * 3;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`;
        });

        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('center')) {
                card.style.transform = 'scale(1)';
            }
        });
    });

    // ── Initialize ──────────────────────────────────────────
    window.addEventListener('DOMContentLoaded', () => {
        // Small delay to let layout settle
        setTimeout(() => {
            scrollToIndex(0);
            updateCenter();
        }, 100);
    });

})();
