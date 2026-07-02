/* ==========================================================
   SIGANO MUSIC — Site behavior
   - Sticky header tint on scroll
   - Mobile nav toggle
   - "Check My Date" modal (open/close, focus trap, ESC)
   - Exit-intent lead-magnet popup (desktop: mouseout-top;
     mobile: scroll-up after 8s)
   - Form submit handler (no backend wired — drop endpoint in)
   ========================================================== */

(function () {
  'use strict';

  /* ---------- Sticky header on scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ----------
     The toggle is the close button too — clicking it again or any nav link
     dismisses the drawer. Also closes on outside tap / escape / link click. */
  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');
  function setNavOpen(open) {
    if (!menuToggle || !nav) return;
    nav.classList.toggle('is-open', open);
    menuToggle.classList.toggle('is-open', open);    // drives the X animation
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuToggle && nav) {
    menuToggle.setAttribute('aria-label', 'Open menu');
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setNavOpen(!nav.classList.contains('is-open'));
    });
    // Close drawer when a nav link is tapped
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNavOpen(false); });
    });
    // Close drawer when a nav button (Check My Date) is tapped
    nav.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { setNavOpen(false); });
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setNavOpen(false);
    });
    // Close if user resizes back to desktop while drawer was open
    window.addEventListener('resize', function () {
      if (window.innerWidth > 920 && nav.classList.contains('is-open')) setNavOpen(false);
    });
  }

  /* ---------- "Check My Date" modal ---------- */
  var modal = document.getElementById('check-date-modal');
  var modalCloseEls = document.querySelectorAll('[data-modal-close]');
  var modalOpenEls = document.querySelectorAll('[data-open-modal="check-date"]');
  var lastFocus = null;

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstInput = modal.querySelector('input, select, textarea, button');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  modalOpenEls.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });
  modalCloseEls.forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('is-open')) closeModal();
      if (exitPopup && exitPopup.classList.contains('is-open')) closeExitPopup();
    }
  });

  /* ---------- "Check My Date" form (5-field, no scroll) ---------- */
  var checkDateForm = document.getElementById('check-date-form');
  if (checkDateForm) {
    checkDateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // TODO: wire to Formspree, Netlify Forms, or backend endpoint.
      // For now, log + show a confirmation.
      var data = Object.fromEntries(new FormData(checkDateForm).entries());
      console.log('[check-date]', data);
      var panel = checkDateForm.closest('.modal__panel');
      if (panel) {
        panel.innerHTML =
          '<button class="modal__close" data-modal-close aria-label="Close">&times;</button>' +
          '<div class="modal__eyebrow">Got it</div>' +
          '<h2>Thank you — we’ll check Sergio’s calendar.</h2>' +
          '<p>You’ll hear back from <strong>sergio@siganomusic.com</strong> within 24 hours with availability and a custom proposal for your date.</p>' +
          '<button class="btn btn--primary" data-modal-close>Close</button>';
        // Re-attach close handler since we replaced contents
        panel.querySelectorAll('[data-modal-close]').forEach(function (el) {
          el.addEventListener('click', closeModal);
        });
      }
    });
  }

  /* ---------- Lead-magnet inline form ---------- */
  var leadForm = document.getElementById('lead-magnet-form');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(leadForm).entries());
      console.log('[lead-magnet]', data);
      // TODO: post to ESP (ConvertKit / Mailchimp / Klaviyo) endpoint.
      leadForm.innerHTML =
        '<div style="padding:14px 0;color:var(--bordeaux);font-family:var(--font-display);font-size:1.4rem;font-style:italic;">Check your inbox — the guide is on its way.</div>';
    });
  }

  /* ---------- Exit-intent popup ---------- */
  var exitPopup = document.getElementById('exit-popup');
  var exitForm = document.getElementById('exit-popup-form');
  var SHOWN_KEY = 'sigano:exit-shown';
  var hasShown = false;

  function shouldShow() {
    if (hasShown) return false;
    try { if (sessionStorage.getItem(SHOWN_KEY)) return false; } catch (_) {}
    return true;
  }
  function openExitPopup() {
    if (!exitPopup || !shouldShow()) return;
    exitPopup.classList.add('is-open');
    exitPopup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    hasShown = true;
    try { sessionStorage.setItem(SHOWN_KEY, '1'); } catch (_) {}
  }
  function closeExitPopup() {
    if (!exitPopup) return;
    exitPopup.classList.remove('is-open');
    exitPopup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (exitPopup) {
    exitPopup.querySelectorAll('[data-exit-close]').forEach(function (el) {
      el.addEventListener('click', closeExitPopup);
    });
    exitPopup.addEventListener('click', function (e) {
      if (e.target === exitPopup) closeExitPopup();
    });
  }
  if (exitForm) {
    exitForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(exitForm).entries());
      console.log('[exit-popup]', data);
      exitForm.innerHTML =
        '<div style="padding:12px 0;color:var(--bordeaux);font-family:var(--font-display);font-size:1.2rem;font-style:italic;">Thanks — the guide is on its way to your inbox.</div>';
      setTimeout(closeExitPopup, 2400);
    });
  }

  // Desktop: mouse-out from top of viewport
  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && e.clientY <= 0) {
      // Only trigger after user has been on page a few seconds
      if (performance.now() > 5000) openExitPopup();
    }
  });

  // Mobile: scroll-up after dwell time
  var lastY = window.scrollY;
  var dwellOk = false;
  setTimeout(function () { dwellOk = true; }, 8000);
  window.addEventListener('scroll', function () {
    if (!dwellOk) { lastY = window.scrollY; return; }
    var y = window.scrollY;
    if (y < lastY - 80 && window.matchMedia('(max-width: 920px)').matches) {
      openExitPopup();
    }
    lastY = y;
  }, { passive: true });

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Hero video: click to unmute ----------
     Browsers universally block autoplay-with-sound; the user must click once
     to enable audio. This handler also pauses any OTHER hero video that might
     be playing (rare on single-page nav, but safe). */
  var heroVideo = document.querySelector('.hero__media video');
  var unmuteBtn = document.querySelector('.hero__play-cue');
  function setUnmuteLabel(muted) {
    if (!unmuteBtn) return;
    var label = unmuteBtn.querySelector('.label');
    if (label) label.textContent = muted ? 'Tap to play sound' : 'Sound on — tap to mute';
    unmuteBtn.classList.toggle('is-playing', !muted);
  }
  if (heroVideo && unmuteBtn) {
    setUnmuteLabel(true);
    unmuteBtn.addEventListener('click', function () {
      var willUnmute = heroVideo.muted;
      heroVideo.muted = !willUnmute;
      if (willUnmute) {
        heroVideo.volume = 1.0;
        // Re-trigger play in case the browser paused the muted-track audio context
        var p = heroVideo.play();
        if (p && typeof p.catch === 'function') p.catch(function () { /* ignored */ });
      }
      setUnmuteLabel(!willUnmute);
    });
  }

  /* ---------- Highlight active nav link by current path ---------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('is-active');
  });
})();
