/* Third WJ high-light photo pair enters using the same scroll timing as 02. */
(() => {
  'use strict';
  const third = document.getElementById('wj-hero-repeat-2');
  if (!third) return;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  third.classList.add('wj-third-photo-pending');
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      third.classList.remove('wj-third-photo-pending');
      observer.disconnect();
    }
  }, { threshold: 0.10 });
  observer.observe(third);
})();
