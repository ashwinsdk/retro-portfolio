/**
 * ASHWIN SDK — Motion System
 * Stagger, easing, and animation helpers.
 * All motion respects prefers-reduced-motion and HUD toggle.
 */

const Motion = (() => {
    'use strict';

    // ── Constants ───────────────────────────────────────────
    const EASING = {
        snappy: 'cubic-bezier(.22,1,.36,1)',
        smooth: 'cubic-bezier(.2,.8,.2,1)',
    };

    const DURATION = {
        instant: 80,
        micro: 100,
        fast: 150,
        normal: 250,
        reveal: 360,
        overlay: 450,
        modal: 600,
    };

    const STAGGER = {
        fast: 60,
        normal: 80,
        slow: 90,
    };

    // ── State ───────────────────────────────────────────────
    let reducedMotion = false;

    function checkReducedMotion() {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotion = mq.matches || document.documentElement.dataset.reduceMotion === 'true';
        return reducedMotion;
    }

    // ── Stagger Reveal ──────────────────────────────────────
    function staggerReveal(elements, options = {}) {
        const {
            delay = STAGGER.normal,
            duration = DURATION.normal,
            easing = EASING.snappy,
            translateY = 8,
        } = options;

        checkReducedMotion();

        elements.forEach((el, i) => {
            if (reducedMotion) {
                el.style.opacity = '1';
                el.style.transform = 'none';
                el.classList.add('visible');
                return;
            }
            el.animate([
                { opacity: 0, transform: `translateY(${translateY}px)` },
                { opacity: 1, transform: 'translateY(0)' },
            ], {
                duration,
                easing,
                delay: i * delay,
                fill: 'forwards',
            }).onfinish = () => {
                el.classList.add('visible');
            };
        });
    }

    // ── Section Entrance ────────────────────────────────────
    function sectionEntrance(el) {
        checkReducedMotion();
        if (reducedMotion) {
            el.classList.add('visible');
            return;
        }
        el.animate([
            { opacity: 0, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ], {
            duration: DURATION.reveal,
            easing: EASING.snappy,
            fill: 'forwards',
        }).onfinish = () => {
            el.classList.add('visible');
        };
    }

    // ── Modal Transitions ──────────────────────────────────
    function modalOpen(modal) {
        checkReducedMotion();
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (reducedMotion) return;

        const container = modal.querySelector('.modal__container');
        if (container) {
            container.animate([
                { opacity: 0, transform: 'scale(0.95)' },
                { opacity: 1, transform: 'scale(1)' },
            ], {
                duration: DURATION.modal,
                easing: EASING.smooth,
                fill: 'forwards',
            });
        }
    }

    function modalClose(modal) {
        checkReducedMotion();
        document.body.style.overflow = '';

        if (reducedMotion) {
            modal.setAttribute('aria-hidden', 'true');
            return;
        }

        const container = modal.querySelector('.modal__container');
        if (container) {
            const anim = container.animate([
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.95)' },
            ], {
                duration: DURATION.overlay,
                easing: EASING.snappy,
                fill: 'forwards',
            });
            anim.onfinish = () => {
                modal.setAttribute('aria-hidden', 'true');
            };
        } else {
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    // ── Skill Ring Animation ───────────────────────────────
    function animateSkillRing(ringFill, value) {
        checkReducedMotion();
        const circumference = 2 * Math.PI * 42; // r=42
        const offset = circumference - (value / 100) * circumference;

        if (reducedMotion) {
            ringFill.style.strokeDashoffset = offset;
            return;
        }

        ringFill.style.strokeDasharray = circumference;
        ringFill.style.strokeDashoffset = circumference;

        ringFill.animate([
            { strokeDashoffset: circumference },
            { strokeDashoffset: offset },
        ], {
            duration: 800,
            easing: EASING.snappy,
            fill: 'forwards',
        });
    }

    // ── XP Bar Fill ────────────────────────────────────────
    function animateXpBar(fillEl, value) {
        checkReducedMotion();
        if (reducedMotion) {
            fillEl.style.width = value + '%';
            return;
        }
        fillEl.style.width = '0%';
        requestAnimationFrame(() => {
            fillEl.style.width = value + '%';
        });
    }

    // ── Typing Effect ──────────────────────────────────────
    function typeText(el, text, options = {}) {
        const { charDelay = 40, onComplete = null } = options;
        checkReducedMotion();

        if (reducedMotion) {
            el.textContent = text;
            if (onComplete) onComplete();
            return;
        }

        el.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
            el.textContent += text[i];
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, charDelay);

        return () => clearInterval(interval);
    }

    // ── Public API ──────────────────────────────────────────
    return {
        EASING,
        DURATION,
        STAGGER,
        checkReducedMotion,
        staggerReveal,
        sectionEntrance,
        modalOpen,
        modalClose,
        animateSkillRing,
        animateXpBar,
        typeText,
    };
})();

// Export for module use if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Motion;
}
