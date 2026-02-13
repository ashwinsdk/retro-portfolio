/**
 * ASHWIN SDK — Main Application
 * Handles: loader, nav, HUD, scroll progress, section reveals,
 * role-card flips, skill animations, contact form, and case study modal.
 */

(function () {
    'use strict';

    // ── Background Music ────────────────────────────────────
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.3; // Set lower volume for background music

        let _autoplayRetryInterval = null;
        const tryAutoPlay = async () => {
            if (document.documentElement.dataset.sound !== 'on') return;
            try {
                await bgMusic.play();
                // If play succeeds immediately, clear any leftovers
                clearAutoplayRetry();
            } catch (err) {
                // Autoplay blocked — attach light-weight listeners to resume on any gesture/motion
                const events = ['pointermove', 'mousemove', 'wheel', 'scroll', 'keydown', 'touchstart', 'click', 'visibilitychange'];

                const resumeHandler = async (ev) => {
                    // If visibilitychanged to hidden, skip
                    if (ev && ev.type === 'visibilitychange' && document.visibilityState !== 'visible') return;
                    try {
                        await bgMusic.play();
                        clearAutoplayRetry();
                    } catch (_) {
                        // still blocked, ignore and wait for next event
                    }
                };

                const addListeners = () => events.forEach(e => window.addEventListener(e, resumeHandler, { passive: true }));
                const removeListeners = () => events.forEach(e => window.removeEventListener(e, resumeHandler));

                const clearAutoplayRetry = () => {
                    removeListeners();
                    if (_autoplayRetryInterval) {
                        clearInterval(_autoplayRetryInterval);
                        _autoplayRetryInterval = null;
                    }
                };

                // Add listeners to catch even slight mouse movements / scrolling
                addListeners();

                // Also periodically retry to handle flaky autoplay policies
                _autoplayRetryInterval = setInterval(() => {
                    bgMusic.play().then(() => clearAutoplayRetry()).catch(() => { });
                }, 2000);
            }
        };

        // Attempt to play immediately on load.
        tryAutoPlay();
    }

    // ── Loader ──────────────────────────────────────────────
    const loader = document.getElementById('loader');
    const loaderFill = loader?.querySelector('.loader__bar-fill');
    const loaderPercent = loader?.querySelector('.loader__percent');
    let loaderComplete = false;

    function runLoader() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if (loaderFill) loaderFill.style.width = '100%';
                if (loaderPercent) loaderPercent.textContent = '100';
                setTimeout(() => {
                    loader?.classList.add('hidden');
                    setTimeout(() => {
                        if (loader) loader.style.display = 'none';
                        // Add extra delay before starting content animations
                        setTimeout(() => {
                            loaderComplete = true;
                        }, 800);
                    }, 400);
                }, 300);
            } else {
                if (loaderFill) loaderFill.style.width = progress + '%';
                if (loaderPercent) loaderPercent.textContent = Math.floor(progress);
            }
        }, 120);
    }

    // ── Navigation ──────────────────────────────────────────
    const hamburger = document.querySelector('.nav__hamburger');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    hamburger?.addEventListener('click', () => {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
        navMenu?.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.setAttribute('aria-expanded', 'false');
            navMenu?.classList.remove('open');
        });
    });

    // Update active nav link on scroll
    function updateActiveNav() {
        const sections = document.querySelectorAll('.section');
        const scrollY = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.id;

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === '#' + id) {
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }

    // ── HUD (Settings Panel) ───────────────────────────────
    const hudToggle = document.querySelector('.hud__toggle');
    const hudPanel = document.querySelector('.hud__panel');
    const hudBtns = document.querySelectorAll('.hud__btn');

    hudToggle?.addEventListener('click', () => {
        const expanded = hudToggle.getAttribute('aria-expanded') === 'true';
        hudToggle.setAttribute('aria-expanded', !expanded);
        hudPanel?.classList.toggle('open');
    });

    // Close HUD when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hud')) {
            hudToggle?.setAttribute('aria-expanded', 'false');
            hudPanel?.classList.remove('open');
        }
    });

    hudBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            switch (action) {
                case 'toggle-mode': {
                    const mode = document.documentElement.dataset.mode;
                    const newMode = mode === 'retro' ? 'modern' : 'retro';
                    document.documentElement.dataset.mode = newMode;
                    btn.textContent = newMode.toUpperCase();
                    btn.setAttribute('aria-pressed', newMode === 'retro');
                    break;
                }
                case 'toggle-motion': {
                    const current = document.documentElement.dataset.reduceMotion === 'true';
                    document.documentElement.dataset.reduceMotion = !current;
                    btn.textContent = current ? 'ON' : 'OFF';
                    btn.setAttribute('aria-pressed', !current);
                    break;
                }
                case 'toggle-sound': {
                    const soundOn = document.documentElement.dataset.sound === 'on';
                    document.documentElement.dataset.sound = soundOn ? 'off' : 'on';
                    btn.textContent = soundOn ? 'OFF' : 'ON';
                    btn.setAttribute('aria-pressed', !soundOn);

                    // Control background music
                    if (bgMusic) {
                        if (soundOn) {
                            bgMusic.pause();
                        } else {
                            bgMusic.play().catch(() => { }); // Autoplay may be blocked
                        }
                    }
                    break;
                }
                case 'toggle-cursor': {
                    const cursorOn = document.documentElement.dataset.cursor === 'on';
                    document.documentElement.dataset.cursor = cursorOn ? 'off' : 'on';
                    btn.textContent = cursorOn ? 'OFF' : 'ON';
                    btn.setAttribute('aria-pressed', !cursorOn);
                    break;
                }
                case 'toggle-contrast': {
                    const hc = document.documentElement.dataset.theme === 'high-contrast';
                    document.documentElement.dataset.theme = hc ? '' : 'high-contrast';
                    btn.textContent = hc ? 'NORMAL' : 'HIGH';
                    btn.setAttribute('aria-pressed', !hc);
                    break;
                }
            }
        });
    });

    // ── Custom Cursor ──────────────────────────────────────
    const cursor = document.querySelector('.custom-cursor');
    document.addEventListener('mousemove', (e) => {
        if (cursor && document.documentElement.dataset.cursor === 'on') {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        }
    });

    // Magnetic effect on interactive elements
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, [tabindex="0"]');
        if (cursor && target) {
            cursor.classList.add('custom-cursor--magnetic');
        }
    });
    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('a, button, [tabindex="0"]');
        if (cursor && target) {
            cursor.classList.remove('custom-cursor--magnetic');
        }
    });

    // ── Scroll Progress Bar ────────────────────────────────
    const progressFill = document.querySelector('.scroll-progress__fill');
    const progressSegments = document.querySelectorAll('.scroll-progress__segment');

    function updateScrollProgress() {
        const scrollH = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = Math.min(window.scrollY / scrollH, 1);
        if (progressFill) {
            progressFill.style.height = (scrolled * 100) + '%';
        }

        // Update progress bar ARIA
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', Math.round(scrolled * 100));
        }

        // Highlight active segment
        const sections = document.querySelectorAll('.section');
        const scrollY = window.scrollY + window.innerHeight / 2;

        progressSegments.forEach(seg => seg.classList.remove('active'));
        sections.forEach((section, i) => {
            if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
                if (progressSegments[i]) {
                    progressSegments[i].classList.add('active');
                }
            }
        });
    }

    // Progress segment click → jump to section
    progressSegments.forEach(seg => {
        seg.addEventListener('click', () => {
            const target = document.getElementById(seg.dataset.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ── Intersection Observer: Section Reveals ─────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Wait for loader to complete before animating content
                const checkLoader = () => {
                    if (loaderComplete) {
                        if (typeof Motion !== 'undefined') {
                            Motion.sectionEntrance(entry.target);
                        } else {
                            entry.target.classList.add('visible');
                        }
                        revealObserver.unobserve(entry.target);
                    } else {
                        setTimeout(checkLoader, 150);
                    }
                };
                checkLoader();
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section-reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ── Intersection Observer: Skill Cards ─────────────────
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Wait for loader to complete before animating content
                const checkLoader = () => {
                    if (loaderComplete) {
                        const cards = entry.target.querySelectorAll('.skill-card');
                        if (typeof Motion !== 'undefined') {
                            Motion.staggerReveal(Array.from(cards), { delay: 60, translateY: 8 });
                        } else {
                            cards.forEach(c => c.classList.add('visible'));
                        }

                        // Animate rings
                        cards.forEach(card => {
                            const meter = card.querySelector('.skill-card__meter');
                            const ringFill = card.querySelector('.skill-card__ring-fill');
                            if (meter && ringFill && typeof Motion !== 'undefined') {
                                const value = parseInt(meter.dataset.value, 10);
                                Motion.animateSkillRing(ringFill, value);
                            }
                        });

                        skillObserver.unobserve(entry.target);
                    } else {
                        setTimeout(checkLoader, 150);
                    }
                };
                checkLoader();
            }
        });
    }, { threshold: 0.1 });

    const skillsGrid = document.querySelector('.skills__grid');
    if (skillsGrid) skillObserver.observe(skillsGrid);

    // ── Intersection Observer: XP Bars (Role Cards) ────────
    const xpObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.role-card__xp-bar');
                bars.forEach(bar => {
                    const fill = bar.querySelector('.role-card__xp-fill');
                    const value = bar.dataset.value;
                    if (fill && typeof Motion !== 'undefined') {
                        Motion.animateXpBar(fill, value);
                    } else if (fill) {
                        fill.style.width = value + '%';
                    }
                });
                xpObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const aboutRoles = document.querySelector('.about__roles');
    if (aboutRoles) xpObserver.observe(aboutRoles);

    // ── Role Card Flips ────────────────────────────────────
    document.querySelectorAll('.role-card').forEach(card => {
        function toggleCard() {
            const expanded = card.getAttribute('aria-expanded') === 'true';
            card.setAttribute('aria-expanded', !expanded);
            const back = card.querySelector('.role-card__back');
            if (back) back.setAttribute('aria-hidden', expanded);
        }

        card.addEventListener('click', toggleCard);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard();
            }
        });
    });

    // ── Hero CTA → Scroll to About ─────────────────────────
    const heroCta = document.querySelector('.hero__cta');
    const scrollToAbout = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    heroCta?.addEventListener('click', scrollToAbout);

    // Listen for "X" key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'x' || e.key === 'X') {
            const heroSection = document.getElementById('hero');
            const scrollY = window.scrollY;
            // Only trigger if we're at the hero section (top of page)
            if (scrollY < window.innerHeight) {
                e.preventDefault();
                scrollToAbout();
            }
        }
    });

    // ── Contact Form ───────────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    const terminalStatus = document.querySelector('.terminal__status');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = contactForm.elements.name?.value?.trim();
        const email = contactForm.elements.email?.value?.trim();
        const message = contactForm.elements.message?.value?.trim();

        if (!name || !email || !message) {
            if (terminalStatus) terminalStatus.textContent = 'ERROR: All fields required.';
            return;
        }

        // Terminal typing animation
        if (terminalStatus && typeof Motion !== 'undefined') {
            Motion.typeText(terminalStatus, 'SENDING...', {
                charDelay: 40,
                onComplete: () => {
                    setTimeout(() => {
                        terminalStatus.textContent = '✓ MESSAGE SENT. STANDING BY.';
                        // In production, hook into actual API here
                        contactForm.reset();
                    }, 800);
                },
            });
        } else if (terminalStatus) {
            terminalStatus.textContent = '✓ MESSAGE SENT. STANDING BY.';
            contactForm.reset();
        }
    });

    // ── Case Study Modal ──────────────────────────────────
    const modal = document.getElementById('case-study-modal');
    const modalClose = modal?.querySelector('.modal__close');
    const modalBackdrop = modal?.querySelector('.modal__backdrop');
    let lastFocusedEl = null;

    // Case study data (could be loaded from JSON)
    const caseStudies = {
        urbandao: {
            title: 'UrbanDAO',
            role: 'FRONTEND · BLOCKCHAIN DEV',
            time: '2024 — 2025',
            metrics: [
                { label: 'Workflows', value: '12+' },
                { label: 'Governance Roles', value: '4' },
                { label: 'Gas Cost', value: '$0' },
            ],
            problem: 'City governance processes are opaque, slow, and exclude citizens from meaningful participation in local decisions.',
            problemQuote: 'Most civic tech platforms fail because they treat citizens as passive consumers, not active governors.',
            techBadges: ['Angular', 'PWA', 'Solidity', 'Ethereum', 'IPFS'],
            code: '// Gasless meta-transaction relay\nasync function relay(tx) {\n  const signed = await signer.signTypedData(tx);\n  return forwarder.execute(signed);\n}',
            challenges: [
                { problem: 'Gas costs excluded low-income participants', solution: 'Implemented EIP-2771 meta-transactions with a gasless relay' },
                { problem: 'Complex role-based access on-chain', solution: 'Used OpenZeppelin AccessControl with custom role hierarchy' },
            ],
            results: [
                { label: 'Proposals Created', value: '50+' },
                { label: 'Avg Response Time', value: '<2s' },
                { label: 'Cost Per Vote', value: '$0' },
            ],
            repo: 'https://github.com/ashwinsdk/urbanDAO',
        },
        nexvote: {
            title: 'Nexvote',
            role: 'FULLSTACK · WEB3',
            time: '2024',
            metrics: [
                { label: 'Votes Recorded', value: '200+' },
                { label: 'Proposals', value: '30+' },
                { label: 'Transparency', value: '100%' },
            ],
            problem: 'Community decisions lack transparency and verifiability, eroding trust in collective governance.',
            problemQuote: 'If you can\'t verify a vote, you can\'t trust the outcome.',
            techBadges: ['React', 'Solidity', 'Ethereum', 'Node.js'],
            code: '// Cast vote with on-chain recording\nfunction castVote(uint proposalId, bool support) public {\n  require(!hasVoted[msg.sender][proposalId]);\n  hasVoted[msg.sender][proposalId] = true;\n  proposals[proposalId].votes += 1;\n}',
            challenges: [
                { problem: 'Vote privacy vs. transparency balance', solution: 'Commit-reveal scheme: hash vote first, reveal after deadline' },
                { problem: 'Sybil resistance without KYC', solution: 'Token-gated voting with quadratic weight' },
            ],
            results: [
                { label: 'Verifiable Votes', value: '100%' },
                { label: 'Dispute Rate', value: '0%' },
                { label: 'Avg Participation', value: '78%' },
            ],
            repo: 'https://github.com/ashwinsdk/nexvote',
        },
        rigledger: {
            title: 'RigLedger',
            role: 'MOBILE DEV',
            time: '2024 — 2025',
            metrics: [
                { label: 'Vehicles', value: 'Multi' },
                { label: 'Export Formats', value: 'PDF/CSV' },
                { label: 'Network', value: 'Offline' },
            ],
            problem: 'Borewell drilling operations managed entirely on paper leads to lost records, calculation errors, and delayed invoicing.',
            problemQuote: 'My father had 20 years of drilling records in paper notebooks that were deteriorating.',
            techBadges: ['Flutter', 'Dart', 'SQLite', 'PDF'],
            code: '// SQLite query for drilling stats\nfinal stats = await db.rawQuery(\n  "SELECT SUM(depth) as total, AVG(cost) as avg "\n  "FROM drills WHERE vehicle_id = ?", [vehicleId]\n);',
            challenges: [
                { problem: 'Fully offline with complex relational data', solution: 'SQLite with careful schema design and local-first sync' },
                { problem: 'PDF generation with custom invoices', solution: 'Built custom PDF renderer with Dart pdf package' },
            ],
            results: [
                { label: 'Data Entry Time', value: '-60%' },
                { label: 'Invoice Errors', value: '-95%' },
                { label: 'Records Digitized', value: '500+' },
            ],
            repo: 'https://github.com/ashwinsdk/rig-ledger',
        },
        kairo: {
            title: 'Kairo',
            role: 'FULLSTACK DEV',
            time: '2025',
            metrics: [
                { label: 'Businesses', value: 'Local' },
                { label: 'Bookings', value: 'Real-time' },
                { label: 'Payments', value: 'Integrated' },
            ],
            problem: 'Solo and small local businesses lack affordable tools to list services and manage real-time bookings online.',
            problemQuote: 'The local barber shouldn\'t need a $50/month SaaS to accept online bookings.',
            techBadges: ['Angular', 'Node.js', 'PostgreSQL', 'PWA'],
            code: '// Real-time booking slot check\nasync function checkSlot(serviceId, time) {\n  const conflicts = await db.query(\n    `SELECT id FROM bookings \n     WHERE service_id = $1 AND slot = $2`,\n    [serviceId, time]\n  );\n  return conflicts.rows.length === 0;\n}',
            challenges: [
                { problem: 'Real-time availability without over-booking', solution: 'Optimistic locking with PostgreSQL advisory locks' },
                { problem: 'Payment integration for micro-businesses', solution: 'Lightweight UPI + Stripe fallback' },
            ],
            results: [
                { label: 'Booking Time', value: '<30s' },
                { label: 'No-shows', value: '-40%' },
                { label: 'Monthly Cost', value: '$0' },
            ],
            repo: 'https://github.com/ashwinsdk/kairo',
        },
    };

    function openCaseStudy(slug) {
        if (!modal || !caseStudies[slug]) return;
        const data = caseStudies[slug];
        lastFocusedEl = document.activeElement;

        // Populate modal
        const title = modal.querySelector('.cs-header__title');
        if (title) title.textContent = data.title;

        const role = modal.querySelector('.cs-header__role');
        if (role) role.textContent = data.role;

        const time = modal.querySelector('.cs-header__time');
        if (time) time.textContent = data.time;

        const metrics = modal.querySelector('.cs-header__metrics');
        if (metrics) {
            metrics.innerHTML = data.metrics.map(m =>
                `<div style="border:2px solid var(--neon);padding:8px 16px;text-align:center">
          <div style="font-size:var(--fs-h3);font-weight:700;color:var(--neon)">${m.value}</div>
          <div style="font-size:var(--fs-micro);color:rgba(255,255,255,0.6)">${m.label}</div>
        </div>`
            ).join('');
        }

        const quote = modal.querySelector('.cs-problem__quote');
        if (quote) quote.textContent = data.problemQuote;

        const text = modal.querySelector('.cs-problem__text');
        if (text) text.textContent = data.problem;

        const badges = modal.querySelector('.cs-tech__badges');
        if (badges) {
            badges.innerHTML = data.techBadges.map(b =>
                `<span style="border:1px solid var(--neon);color:var(--neon);padding:2px 8px;font-size:var(--fs-micro)">${b}</span>`
            ).join('');
        }

        const codeBlock = modal.querySelector('.cs-tech__code code');
        if (codeBlock) codeBlock.textContent = data.code;

        const challenges = modal.querySelector('.cs-challenges__list');
        if (challenges) {
            challenges.innerHTML = data.challenges.map(c =>
                `<div style="border:2px solid var(--dimmed);padding:16px">
          <div style="color:var(--danger);font-size:var(--fs-small);margin-bottom:8px">▸ ${c.problem}</div>
          <div style="color:var(--neon);font-size:var(--fs-small)">→ ${c.solution}</div>
        </div>`
            ).join('');
        }

        const scoreboard = modal.querySelector('.cs-results__scoreboard');
        if (scoreboard) {
            scoreboard.innerHTML = data.results.map(r =>
                `<div style="border:2px solid var(--neon);padding:12px;text-align:center">
          <div style="font-size:var(--fs-h3);font-weight:700;color:var(--neon)">${r.value}</div>
          <div style="font-size:var(--fs-micro);color:rgba(255,255,255,0.6)">${r.label}</div>
        </div>`
            ).join('');
        }

        const links = modal.querySelector('.cs-links__actions');
        if (links) {
            links.innerHTML = `<a href="${data.repo}" target="_blank" rel="noopener" class="cta-btn cta-btn--sm">VIEW REPO</a>`;
        }

        if (typeof Motion !== 'undefined') {
            Motion.modalOpen(modal);
        } else {
            modal.setAttribute('aria-hidden', 'false');
        }

        // Focus trap
        const closeBtn = modal.querySelector('.modal__close');
        closeBtn?.focus();
    }

    function closeCaseStudy() {
        if (!modal) return;
        if (typeof Motion !== 'undefined') {
            Motion.modalClose(modal);
        } else {
            modal.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
        lastFocusedEl?.focus();
    }

    // Bind case study CTAs
    document.querySelectorAll('[data-casestudy]').forEach(btn => {
        btn.addEventListener('click', () => openCaseStudy(btn.dataset.casestudy));
    });

    modalClose?.addEventListener('click', closeCaseStudy);
    modalBackdrop?.addEventListener('click', closeCaseStudy);

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.getAttribute('aria-hidden') === 'false') {
            closeCaseStudy();
        }
    });

    // Focus trap inside modal
    modal?.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusable = modal.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    // ── Scroll Listeners ──────────────────────────────────
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // ── Initialize ──────────────────────────────────────────
    window.addEventListener('DOMContentLoaded', () => {
        runLoader();
        updateScrollProgress();
        updateActiveNav();

        // Check system prefers-reduced-motion
        if (typeof Motion !== 'undefined') {
            Motion.checkReducedMotion();
        }
    });

    // Analytics hook (lightweight)
    window.SDK_ANALYTICS = {
        track(event, data) {
            // Implement your analytics here (e.g., Plausible, Fathom, custom endpoint)
            if (window.location.hostname !== 'localhost') {
                console.debug('[SDK Analytics]', event, data);
            }
        },
    };

})();
