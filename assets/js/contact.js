(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      try {
        const formData = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: formData
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) {
          window.location.href = 'https://dreamteamautomation.com/thank-you.html';
        } else {
          alert(data.message || 'Submission failed. Please email sales@dreamteamautomation.com');
        }
      } catch (err) {
        alert('Submission failed. Please email sales@dreamteamautomation.com');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel || 'Send Request';
        }
      }
    });
  });
})();

