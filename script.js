// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
});
document.querySelectorAll('.fade-section').forEach(section => observer.observe(section));

// Page transition animation
document.querySelectorAll('a.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const targetUrl = new URL(href, window.location.href);
    const isInternal = targetUrl.origin === window.location.origin && targetUrl.pathname.endsWith('.html');

    if (isInternal) {
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = targetUrl.href; }, 300);
    }
  });
});

// Fade-in on page load
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('fade-out');
});
