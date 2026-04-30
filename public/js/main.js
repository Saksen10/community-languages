// public/js/main.js — Client-side JavaScript

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // Mobile navigation toggle
  // ============================================
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
    // Close nav when clicking a link on mobile
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
      });
    });
  }

  // ============================================
  // Auto-dismiss flash messages after 5 seconds
  // ============================================
  const flashMessages = document.querySelectorAll('.flash');
  flashMessages.forEach(function (msg) {
    setTimeout(function () {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-10px)';
      setTimeout(function () { msg.remove(); }, 300);
    }, 5000);
  });

  // ============================================
  // Confirm delete actions
  // ============================================
  document.querySelectorAll('.confirm-delete').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

});
