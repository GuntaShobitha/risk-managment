/**
 * STACKLY RISK MANAGEMENT — MAIN JAVASCRIPT
 * Handles preloader, navigation, scroll interactions, replayable section
 * animations, split-word headlines, timeline drawing, counters, testimonial
 * carousel, and FAQ accordions. Vanilla JS. Zero dependencies.
 */

/* Preloader must start before DOMContentLoaded to lock scroll immediately */
initPreloader();

/* JS flag: hides pre-animation states only when JS is available */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileNav();
    prepareAnimationTargets();
    initSplitHeadlines();
    initSectionAnimations();
    initPathwaySequence();
    initProcessTimeline();
    initCounterAnimations();
    initTiltCards();
    initTestimonialCarousel();
    initFaqAccordion();
    initMagneticButtons();
});

/* --- 0. PRELOADER (every refresh, every page) --- */
function initPreloader() {
    /* Adopt the preloader markup already in the HTML, or inject one */
    let pre = document.querySelector('.preloader');

    if (!pre) {
        pre = document.createElement('div');
        pre.className = 'preloader';
        pre.innerHTML =
            '<div class="preloader-inner">' +
                '<img src="./images/logo-dark.webp" alt="STACKLY Logo" class="preloader-logo">' +
                '<div class="preloader-bar"><span></span></div>' +
                '<div class="preloader-text">Securing Session</div>' +
            '</div>';
        document.body.appendChild(pre);
    }

    document.body.classList.add('preloading');

    const MIN_SHOW = 900;
    const start = Date.now();

    const dismiss = () => {
        const wait = Math.max(0, MIN_SHOW - (Date.now() - start));
        setTimeout(() => {
            pre.classList.add('done');
            document.body.classList.remove('preloading');
            setTimeout(() => pre.remove(), 700);
        }, wait);
    };

    if (document.readyState === 'complete') {
        dismiss();
    } else {
        window.addEventListener('load', dismiss);
        /* Hard safety: never trap the user behind the preloader */
        setTimeout(dismiss, 4000);
    }
}

/* --- 1. STICKY HEADER & SCROLL STATE --- */
function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* --- 2. MOBILE NAVIGATION & SCROLL LOCK --- */
function initMobileNav() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const closeBtn = document.querySelector('.mobile-nav-close');

    if (!hamburgerBtn || !mobileOverlay) return;

    const toggleMenu = (open) => {
        if (open) {
            mobileOverlay.classList.add('open');
            document.body.classList.add('menu-open');
        } else {
            mobileOverlay.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
    };

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = mobileOverlay.classList.contains('open');
        toggleMenu(!isOpen);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleMenu(false));
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileOverlay.classList.contains('open')) {
            toggleMenu(false);
        }
    });
}

/* --- 3. ANIMATION PREPARATION (stagger indices + split text) --- */
const STAGGER_GROUPS = [
    '.hero-meta', '.hero-buttons', '.why-pillars', '.services-grid',
    '.pathway-container', '.industries-grid', '.cases-grid', '.trust-list',
    '.analytics-metrics-row', '.risk-matrix-preview', '.about-values-grid',
    '.blog-grid', '.contact-info-cards', '.faq-wrap', '.stats-grid'
];

function prepareAnimationTargets() {
    /* Index children of known grids so CSS can stagger via --i */
    STAGGER_GROUPS.forEach(sel => {
        document.querySelectorAll(sel).forEach(group => {
            Array.from(group.children).forEach((child, i) => {
                if (!child.hasAttribute('data-anim-index')) {
                    child.setAttribute('data-anim-index', i);
                }
            });
        });
    });

    /* Matrix cells get their own global index for the radial pop cascade */
    document.querySelectorAll('.risk-matrix-preview').forEach(grid => {
        Array.from(grid.children).forEach((cell, i) => {
            cell.setAttribute('data-anim-index', i);
        });
    });

    /* Mark grid groups themselves for stagger observation */
    document.querySelectorAll(
        '.services-grid .service-card, .industries-grid .industry-card, ' +
        '.cases-grid .case-card, .why-pillars .why-pillar, ' +
        '.trust-list .trust-item, .about-values-grid .value-card, ' +
        '.blog-grid .blog-card, .contact-info-cards .contact-card, ' +
        '.faq-wrap .faq-item, .stats-grid .stat-card, ' +
        '.analytics-metrics-row .metric-box'
    ).forEach(el => el.classList.add('anim-watch'));

    /* Auto-index any watched card not covered by a known grid container
       (e.g. inline-styled layouts) so stagger delays still work */
    document.querySelectorAll('.anim-watch').forEach(el => {
        if (el.hasAttribute('data-anim-index')) return;
        const cls = el.classList[0];
        const siblings = Array.from(el.parentElement.children)
            .filter(s => s.classList.contains(cls));
        el.setAttribute('data-anim-index', siblings.indexOf(el));
    });
}

function initSplitHeadlines() {
    const titles = document.querySelectorAll('.hero-title, .section-title');
    titles.forEach(title => {
        if (title.dataset.split) return;
        title.dataset.split = 'true';
        title.classList.add('split-words');

        const splitNode = (node) => {
            const frag = document.createDocumentFragment();
            node.childNodes.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const words = child.textContent.split(/\s+/).filter(Boolean);
                    words.forEach(word => {
                        const wrap = document.createElement('span');
                        wrap.className = 'sw';
                        const inner = document.createElement('span');
                        inner.className = 'swi';
                        inner.textContent = word;
                        wrap.appendChild(inner);
                        frag.appendChild(wrap);
                        frag.appendChild(document.createTextNode(' '));
                    });
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    /* Keep inner markup (e.g. .text-gold) and split inside it */
                    const words = child.textContent.split(/\s+/).filter(Boolean);
                    const clone = child.cloneNode(false);
                    words.forEach(word => {
                        const wrap = document.createElement('span');
                        wrap.className = 'sw';
                        const inner = document.createElement('span');
                        inner.className = 'swi';
                        inner.textContent = word;
                        wrap.appendChild(inner);
                        clone.appendChild(wrap);
                        clone.appendChild(document.createTextNode(' '));
                    });
                    frag.appendChild(clone);
                }
            });
            node.innerHTML = '';
            node.appendChild(frag);
        };

        splitNode(title);

        /* Number every .swi across the whole title for sequential delay */
        title.querySelectorAll('.swi').forEach((swi, i) => {
            swi.style.setProperty('--i', i);
        });
    });
}

/* --- 4. REPLAYABLE SCROLL ANIMATIONS (re-arm on every exit) --- */
function initSectionAnimations() {
    /* Sections whose whole choreography replays on every re-entry */
    /* Sections whose whole choreography replays on every re-entry.
       (Generic .section-white/.section-accent blocks are animated per-card
       below, so they are intentionally NOT section-level targets.) */
    const sections = document.querySelectorAll(
        '.hero-section, .pathway-section, .services-section, .why-section, ' +
        '.process-section, .analytics-section, .industries-section, ' +
        '.cases-section, .trust-section, .testimonials-section, ' +
        '.cta-banner-section, .about-hero, .service-detail-section, ' +
        '.auth-page-wrap, .error-page-wrap'
    );

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-active');
            } else {
                /* Re-arm: remove so the animation replays next time */
                entry.target.classList.remove('anim-active');
            }
        });
    }, { threshold: 0.18 });

    sections.forEach(sec => sectionObserver.observe(sec));

    /* Individual cards + legacy fade-up blocks also re-arm for replay */
    const cards = document.querySelectorAll(
        '.anim-watch, .fade-up, .about-img-frame, .featured-blog-card, ' +
        '.analytics-dashboard-frame, .testimonials-carousel-wrap'
    );

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-active');
            } else {
                entry.target.classList.remove('anim-active');
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => cardObserver.observe(card));
}

/* --- 5. SECTION 02: SEQUENTIAL PATHWAY (replays) --- */
function initPathwaySequence() {
    const pathwaySection = document.querySelector('.pathway-section');
    if (!pathwaySection) return;

    const steps = pathwaySection.querySelectorAll('.pathway-step');
    if (!steps.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                steps.forEach((step, idx) => {
                    setTimeout(() => {
                        step.classList.add('active');
                    }, idx * 220);
                });
            } else {
                steps.forEach(step => step.classList.remove('active'));
            }
        });
    }, { threshold: 0.25 });

    observer.observe(pathwaySection);
}

/* --- 6. SECTION 05: PROCESS TIMELINE (progress resets when leaving) --- */
function initProcessTimeline() {
    const timelineSection = document.querySelector('.process-section');
    if (!timelineSection) return;

    const progressBar = timelineSection.querySelector('.process-progress-line');
    const steps = timelineSection.querySelectorAll('.process-step');

    const updateTimeline = () => {
        const rect = timelineSection.getBoundingClientRect();
        const winHeight = window.innerHeight;

        if (rect.top < winHeight && rect.bottom > 0) {
            const totalH = rect.height;
            const scrolledH = winHeight - rect.top;
            const percent = Math.min(Math.max(scrolledH / (totalH * 0.9), 0), 1);

            if (progressBar) {
                progressBar.style.height = `${percent * 100}%`;
            }

            steps.forEach((step) => {
                const stepRect = step.getBoundingClientRect();
                if (stepRect.top < winHeight * 0.75) {
                    step.classList.add('active');
                }
            });
        } else if (rect.top >= winHeight) {
            /* Fully below viewport: reset so it replays on return */
            if (progressBar) progressBar.style.height = '0%';
            steps.forEach(step => step.classList.remove('active'));
        }
    };

    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
}

/* --- 7. SECTION 06: DATA COUNTERS & CHARTS (reset + replay) --- */
function runCounters(analyticsSection) {
    const counters = analyticsSection.querySelectorAll('.counter-val');
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const duration = 1600;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * target);
            counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            }
        };
        requestAnimationFrame(step);
    });
}

function initCounterAnimations() {
    const analyticsSection = document.querySelector('.analytics-section');
    if (!analyticsSection) return;

    const counters = analyticsSection.querySelectorAll('.counter-val');
    const bars = analyticsSection.querySelectorAll('.bar-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounters(analyticsSection);
                bars.forEach(bar => {
                    const pct = bar.getAttribute('data-pct') || '0%';
                    bar.style.width = pct;
                });
            } else {
                /* Reset so counters and bars replay on re-entry */
                counters.forEach(counter => {
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const prefix = counter.getAttribute('data-prefix') || '';
                    counter.textContent = `${prefix}0${suffix}`;
                });
                bars.forEach(bar => { bar.style.width = '0'; });
            }
        });
    }, { threshold: 0.2 });

    observer.observe(analyticsSection);
}

/* --- 8. 3D TILT EFFECT FOR SERVICES --- */
function initTiltCards() {
    const tiltCards = document.querySelectorAll('[data-interaction="tilt"]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotX = -(y / (rect.height / 2)) * 8;
            const rotY = (x / (rect.width / 2)) * 8;
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
}

/* --- 9. SECTION 10: TESTIMONIAL CAROUSEL --- */
function initTestimonialCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const wrap = document.querySelector('.testimonials-carousel-wrap');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoPlayTimer = null;

    const showSlide = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;

        slides.forEach((slide, i) => {
            /* Force reflow so the slide3D animation restarts every change */
            if (slide.classList.contains('active')) {
                slide.classList.remove('active');
                void slide.offsetWidth;
            }
            slide.classList.toggle('active', i === currentIndex);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 5500);
    };

    const stopAutoPlay = () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentIndex - 1);
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentIndex + 1);
            startAutoPlay();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            startAutoPlay();
        });
    });

    if (wrap) {
        wrap.addEventListener('mouseenter', stopAutoPlay);
        wrap.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
}

/* --- 10. FAQ ACCORDION --- */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(other => other.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* --- 11. MAGNETIC BUTTON MICRO-INTERACTIONS --- */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}
