/* ==========================================
   四叶草蓝星球 · 落地页脚本
   ========================================== */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const nav = document.getElementById('nav');
  const featureCards = document.querySelectorAll('.feature-card[data-reveal]');

  /* ====================================
     Nav: scroll backdrop toggle
     ==================================== */
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  updateNav(); // initial state

  /* ====================================
     Feature cards: IntersectionObserver reveal
     ==================================== */
  if (featureCards.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, index) {
          if (entry.isIntersecting) {
            // stagger each card by 100ms
            setTimeout(function () {
              entry.target.classList.add('revealed');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    featureCards.forEach(function (card) {
      observer.observe(card);
    });
  } else {
    // Fallback: show all cards immediately if no IntersectionObserver support
    featureCards.forEach(function (card) {
      card.classList.add('revealed');
    });
  }

  /* ====================================
     Smooth scroll for anchor links (enhanced)
     ==================================== */
  // CSS scroll-behavior: smooth handles most cases;
  // this provides offset for fixed nav and SPA-like feel
  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var navHeight = 64; // matches --nav-height
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    });
  });

  /* ====================================
     Active nav link highlight (on scroll)
     ==================================== */
  var sectionIds = ['hero', 'features', 'how', 'download'];
  var navLinks = document.querySelectorAll('.nav-link');

  function highlightNav() {
    var scrollPos = window.scrollY + 100;

    var currentSection = 'hero';
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) {
        currentSection = id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  var highlightTicking = false;
  window.addEventListener('scroll', function () {
    if (!highlightTicking) {
      requestAnimationFrame(function () {
        highlightNav();
        highlightTicking = false;
      });
      highlightTicking = true;
    }
  });

  console.log('🍀 四叶草蓝星球 · 落地页已就绪');
})();
