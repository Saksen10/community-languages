// public/js/main.js — Client-side JavaScript

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // Mobile navigation toggle
  // ============================================
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
      const isExpanded = navLinks.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close nav when clicking a link on mobile
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(event) {
      if (!navToggle.contains(event.target) && !navLinks.contains(event.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // Auto-dismiss flash messages after 5 seconds
  // ============================================
  const flashMessages = document.querySelectorAll('.flash');
  flashMessages.forEach(function (msg) {
    // Add a close button dynamically
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'flash-close';
    closeBtn.setAttribute('aria-label', 'Close message');
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'inherit';
    closeBtn.style.fontSize = '1.25rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.paddingLeft = '1rem';
    
    closeBtn.addEventListener('click', function() {
      msg.style.opacity = '0';
      msg.style.transform = 'translateY(-10px)';
      setTimeout(function () { msg.remove(); }, 300);
    });
    
    msg.appendChild(closeBtn);

    // Auto-dismiss timeout
    setTimeout(function () {
      if (document.body.contains(msg)) {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(-10px)';
        setTimeout(function () { msg.remove(); }, 300);
      }
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
