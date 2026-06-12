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

    /* 5. Active nav link highlighting on scroll */
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
