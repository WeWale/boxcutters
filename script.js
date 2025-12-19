// script.js
// Full-page fade overlay approach with snappier timings:
// - overlay transition 120ms
// - wait 800ms (or until audio ends) before navigating
// - section fade-in shortened to 350ms

(() => {
  if (window.__BOXCUTTERS_SCRIPT_LOADED) return;
  window.__BOXCUTTERS_SCRIPT_LOADED = true;

  // Create and append the fade overlay to the body
  const overlayId = '__fade_overlay_boxcutters';
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'fade-overlay';
    document.body.appendChild(overlay);
  }

  // Intersection observer for section fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-section').forEach(section => observer.observe(section));

  // State to prevent duplicate navigation
  let isNavigating = false;

  // Play audio and resolve when audio ends or timeout reached
  function playAudioWithTimeout(src, timeoutMs = 800) {
    return new Promise((resolve) => {
      if (!src) return resolve();
      try {
        const audio = new Audio(src);
        audio.volume = 0.95;
        let finished = false;

        const cleanup = () => {
          if (finished) return;
          finished = true;
          try { audio.pause(); audio.currentTime = 0; } catch (e) {}
          resolve();
        };

        audio.addEventListener('ended', cleanup);
        audio.addEventListener('error', cleanup);

        // Try to play; if blocked, we'll still resolve after timeout
        audio.play().catch(() => {
          // autoplay blocked — still wait timeout then resolve
        });

        // Safety timeout (exact)
        setTimeout(cleanup, timeoutMs);
      } catch (e) {
        resolve();
      }
    });
  }

  // Activate overlay (fade-in) and block pointer events
  function activateOverlay() {
    overlay.classList.add('active');
    document.body.style.pointerEvents = 'none';
  }

  // Deactivate overlay and restore pointer events
  function deactivateOverlay() {
    overlay.classList.remove('active');
    document.body.style.pointerEvents = '';
  }

  // Navigate after a small buffer (overlay already active)
  function navigateTo(href) {
    setTimeout(() => {
      window.location.href = href;
    }, 80);
  }

  // Universal click handler
  document.addEventListener('click', async (e) => {
    if (isNavigating) {
      e.preventDefault();
      return;
    }

    // Priority: elements with data-audio (game buttons)
    const audioEl = e.target.closest('[data-audio]');
    if (audioEl) {
      const href = audioEl.getAttribute('href');
      const audioSrc = audioEl.getAttribute('data-audio');

      if (href) e.preventDefault();

      isNavigating = true;
      activateOverlay();

      // Play audio while overlay is active and wait up to 800ms
      await playAudioWithTimeout(audioSrc, 800);

      if (href) {
        navigateTo(href);
      } else {
        setTimeout(() => {
          deactivateOverlay();
          isNavigating = false;
        }, 80);
      }
      return;
    }

    // Otherwise handle anchors (<a>)
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    let targetUrl;
    try {
      targetUrl = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    const isInternalHtml = targetUrl.origin === window.location.origin && targetUrl.pathname.endsWith('.html');
    const isExternal = targetUrl.origin !== window.location.origin;

    // Internal HTML navigation: immediate overlay activation then navigate after 800ms
    if (isInternalHtml) {
      e.preventDefault();

      if (targetUrl.pathname === window.location.pathname) {
        activateOverlay();
        setTimeout(() => {
          deactivateOverlay();
        }, 160);
        return;
      }

      isNavigating = true;
      activateOverlay();
      setTimeout(() => { navigateTo(targetUrl.href); }, 800);
      return;
    }

    // External links
    if (isExternal) {
      const targetAttr = anchor.getAttribute('target');
      if (targetAttr === '_blank') {
        activateOverlay();
        setTimeout(() => {
          deactivateOverlay();
        }, 800);
        return; // allow default behavior
      }

      e.preventDefault();
      isNavigating = true;
      activateOverlay();
      setTimeout(() => { navigateTo(targetUrl.href); }, 800);
      return;
    }
  });

  // On DOMContentLoaded: ensure page fades in smoothly and overlay hidden
  window.addEventListener('DOMContentLoaded', () => {
    deactivateOverlay();
    document.body.classList.remove('fade-out');
    document.querySelectorAll('.fade-in-ready').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 20);
    });
  });
})();
