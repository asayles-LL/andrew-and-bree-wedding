// Ha Long Bay Wedding Website — interactions

document.addEventListener('DOMContentLoaded', () => {
    /* 1. Mobile navigation toggle */
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* 2. Navbar background on scroll */
    const navbar = document.querySelector('.navbar');
    const checkScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', checkScroll);
    checkScroll();

    /* 3. Countdown timer — ceremony: March 31, 2027 at 3:00 PM Vietnam time (GMT+7) */
    const targetDate = new Date('2027-03-31T15:00:00+07:00').getTime();

    const updateCountdown = () => {
        const difference = targetDate - Date.now();
        if (difference < 0) {
            const c = document.querySelector('.countdown-container');
            if (c) c.innerHTML =
                "<h3 style='font-family: var(--font-heading); font-size: 2rem; font-style: italic; color: var(--color-primary-light);'>The celebration has begun!</h3>";
            return;
        }
        const days = Math.floor(difference / 86400000);
        const hours = Math.floor((difference % 86400000) / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.innerText = String(val).padStart(2, '0');
        };
        set('days', days);
        set('hours', hours);
        set('minutes', minutes);
        set('seconds', seconds);
    };
    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* 4. Scroll-reveal animation for cards & itinerary days */
    const revealTargets = document.querySelectorAll(
        '.details-card, .itin-day, .quickfact, .essential-item, .info-block'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    revealTargets.forEach(el => observer.observe(el));

    /* 5. Per-section photo carousels */
    const initCarousel = carousel => {
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const dotsWrap = carousel.querySelector('.carousel-dots');
        if (dotsWrap) dotsWrap.innerHTML = '';

        if (slides.length <= 1) {
            carousel.classList.add('single');
            slides.forEach(s => s.classList.add('active'));
            return;
        }
        carousel.classList.remove('single');

        let index = 0;
        const show = i => {
            index = (i + slides.length) % slides.length;
            slides.forEach((s, n) => s.classList.toggle('active', n === index));
            if (dotsWrap) {
                dotsWrap.querySelectorAll('.dot').forEach((d, n) =>
                    d.classList.toggle('active', n === index));
            }
        };

        if (dotsWrap) {
            slides.forEach((_, n) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'dot';
                dot.setAttribute('aria-label', `Go to photo ${n + 1}`);
                dot.addEventListener('click', () => show(n));
                dotsWrap.appendChild(dot);
            });
        }

        const nextBtn = carousel.querySelector('.carousel-btn.next');
        const prevBtn = carousel.querySelector('.carousel-btn.prev');
        if (!carousel.dataset.bound) {
            nextBtn?.addEventListener('click', () => show(index + 1));
            prevBtn?.addEventListener('click', () => show(index - 1));
            carousel.dataset.bound = '1';
        }
        show(0);
    };

    document.querySelectorAll('[data-carousel]').forEach(initCarousel);

    /* 5b. Auto-loading galleries: drop images/<prefix>-01.jpg, -02.jpg, … in the
       images folder (numbered in order) and they appear automatically. */
    document.querySelectorAll('[data-autoload]').forEach(carousel => {
        const prefix = carousel.getAttribute('data-autoload');
        const track = carousel.querySelector('.carousel-track');
        const firstBtn = track.querySelector('.carousel-btn');
        let i = 1, added = 0;

        const finish = () => {
            if (added > 0) track.querySelectorAll('[data-fallback]').forEach(el => el.remove());
            initCarousel(carousel);
        };

        const tryIndex = () => {
            const n = String(i).padStart(2, '0');
            const candidates = [
                `images/${prefix}-${n}.jpg`, `images/${prefix}-${i}.jpg`,
                `images/${prefix}-${n}.jpeg`, `images/${prefix}-${n}.png`,
                `images/${prefix}-${n}.webp`, `images/${prefix}-${i}.webp`,
            ];
            let c = 0;
            const attempt = () => {
                const src = candidates[c];
                const probe = new Image();
                probe.onload = () => {
                    const slide = document.createElement('div');
                    slide.className = 'carousel-slide';
                    const img = document.createElement('img');
                    img.src = src;
                    img.loading = 'lazy';
                    img.alt = `Ambassador Cruise — photo ${i}`;
                    slide.appendChild(img);
                    track.insertBefore(slide, firstBtn);
                    added++; i++;
                    tryIndex();
                };
                probe.onerror = () => { c++; (c < candidates.length) ? attempt() : finish(); };
                probe.src = src;
            };
            attempt();
        };
        tryIndex();
    });

    /* 5c. Lightbox — click any gallery photo to view it full-screen */
    const lb = document.getElementById('lightbox');
    if (lb) {
        const lbImg = lb.querySelector('.lb-img');
        const lbCounter = lb.querySelector('.lb-counter');
        let lbList = [], lbIndex = 0;

        const lbShow = i => {
            if (!lbList.length) return;
            lbIndex = (i + lbList.length) % lbList.length;
            lbImg.src = lbList[lbIndex].src;
            lbImg.alt = lbList[lbIndex].alt || '';
            lbCounter.textContent = lbList.length > 1 ? `${lbIndex + 1} / ${lbList.length}` : '';
        };
        const lbClose = () => {
            lb.classList.remove('open');
            lb.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lbImg.src = '';
        };

        // Open when a carousel photo is clicked (delegated — works for auto-loaded images too)
        document.addEventListener('click', e => {
            const img = e.target.closest('.carousel-slide img');
            if (!img) return;
            const track = img.closest('.carousel-track');
            lbList = Array.from(track.querySelectorAll('.carousel-slide img'));
            lb.classList.add('open');
            lb.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            lbShow(lbList.indexOf(img));
        });

        lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); lbShow(lbIndex + 1); });
        lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); lbShow(lbIndex - 1); });
        lb.querySelector('.lb-close').addEventListener('click', lbClose);
        lb.addEventListener('click', e => { if (e.target === lb) lbClose(); }); // click backdrop to close

        document.addEventListener('keydown', e => {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') lbClose();
            else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
            else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
        });
    }

    /* 6. Active nav link highlighting on scroll */
    const sections = document.querySelectorAll('section');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinksList.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href').slice(1) === current);
        });
    });
});
