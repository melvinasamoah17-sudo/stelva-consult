/* =============================================
   STELVA LUTHNAEL CONSULT — Main JavaScript
   ============================================= */

/* ---- EmailJS / WhatsApp notification config ---- */
const EMAILJS_PUBLIC_KEY        = 'FMukJtAnG25EsZby_';
const EMAILJS_SERVICE_ID        = 'service_nzxv0eo';
const EMAILJS_TEMPLATE_OWNER    = 'template_mj52evf'; // notifies the business owner
const EMAILJS_TEMPLATE_CLIENT   = 'template_5d53p6j'; // auto-confirmation to the client

const CALLMEBOT_PHONE  = '233247583586'; // owner's WhatsApp number
const CALLMEBOT_APIKEY = '';             // TODO: paste CallMeBot API key here once available

if (window.emailjs) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

/* ---- News slideshow (hero) ---- */
let newsSlideIndex = 0;
let newsSlideTimer = null;

function showNewsSlide(index) {
  const slides = document.querySelectorAll('#news-slideshow .slideshow-slide');
  const dots   = document.querySelectorAll('#news-slide-dots .dot');
  if (!slides.length) return;

  if (index >= slides.length) newsSlideIndex = 0;
  else if (index < 0) newsSlideIndex = slides.length - 1;
  else newsSlideIndex = index;

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  slides[newsSlideIndex].classList.add('active');
  if (dots[newsSlideIndex]) dots[newsSlideIndex].classList.add('active');
}

function changeNewsSlide(step) {
  showNewsSlide(newsSlideIndex + step);
  restartNewsAutoplay();
}

function goToNewsSlide(index) {
  showNewsSlide(index);
  restartNewsAutoplay();
}

function restartNewsAutoplay() {
  clearInterval(newsSlideTimer);
  newsSlideTimer = setInterval(() => showNewsSlide(newsSlideIndex + 1), 6000);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar scroll behaviour ---- */
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scroll-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar shrink
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll-to-top button
    if (scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    // Active nav link highlight
    updateActiveNavLink();
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---- Mobile hamburger ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  /* ---- Active nav link on scroll ---- */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
    let current = '';

    sections.forEach(section => {
      const top    = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* ---- Intersection Observer: fade-in ---- */
  const fadeEls = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ---- Staggered card animations ---- */
  const staggerGroups = document.querySelectorAll('.services-grid, .why-grid, .testimonials-track');

  staggerGroups.forEach(group => {
    const cards = group.querySelectorAll(':scope > *');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
      card.classList.add('fade-in');
      fadeObserver.observe(card);
    });
  });

  /* ---- Counter animation ---- */
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const step     = 16;
    const steps    = Math.ceil(duration / step);
    let current    = 0;

    const timer = setInterval(() => {
      current++;
      const value = Math.round(easeOut(current / steps) * target);
      el.textContent = value + suffix;
      if (current >= steps) {
        el.textContent = target + suffix;
        clearInterval(timer);
      }
    }, step);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.querySelector('.form-success');
  const formError    = document.querySelector('.form-error');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn      = contactForm.querySelector('.form-submit');
      const original = btn.textContent;

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      const firstName = contactForm.querySelector('#first-name').value;
      const lastName  = contactForm.querySelector('#last-name').value;
      const fullName  = `${firstName} ${lastName}`.trim();
      const now       = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Accra' });

      const params = {
        // Names — templates use both {{name}} and {{from_name}}
        name:       fullName,
        from_name:  fullName,
        first_name: firstName,
        last_name:  lastName,

        // Email — "To Email" on the confirmation template uses {{from_email}},
        // "Reply To" on both templates uses {{email}} — send both
        email:      contactForm.querySelector('#email').value,
        from_email: contactForm.querySelector('#email').value,

        phone:      contactForm.querySelector('#phone').value || 'Not provided',
        country:    'Ghana',
        service:    contactForm.querySelector('#service').value || 'Not specified',
        message:    contactForm.querySelector('#message').value,

        // Timestamps — template uses both {{time}} and {{timestamp}}
        time:       now,
        timestamp:  now,
      };

      // Send both emails: one notifying the owner, one confirming to the client
      Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_OWNER, params),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_CLIENT, params),
      ])
        .then(() => {
          // Best-effort WhatsApp ping to the owner (only fires once an API key is set)
          if (CALLMEBOT_APIKEY) {
            const text = `New enquiry from ${params.first_name} ${params.last_name} (${params.phone}) — ${params.service}. Message: ${params.message}`;
            const url = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodeURIComponent(text)}&apikey=${CALLMEBOT_APIKEY}`;
            fetch(url, { mode: 'no-cors' }).catch(() => {});
          }

          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.style.display = 'block';
        })
        .catch((err) => {
          console.error('EmailJS error:', err);
          btn.textContent = original;
          btn.disabled    = false;
          if (formError) {
            formError.style.display = 'block';
          } else {
            alert("Sorry, something went wrong sending your message. Please try again or contact us directly.");
          }
        });
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Year in footer ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Init news slideshow ---- */
  if (document.getElementById('news-slideshow')) {
    showNewsSlide(0);
    restartNewsAutoplay();

    // Pause autoplay while the user is hovering the slideshow
    const newsEl = document.getElementById('news-slideshow');
    newsEl.addEventListener('mouseenter', () => clearInterval(newsSlideTimer));
    newsEl.addEventListener('mouseleave', restartNewsAutoplay);
  }

});
