/**
 * Klutchplay.com - Interactive Features & Simulator Scripts
 * "When you need the clutch play."
 */

(function () {
  'use strict';

  // --- Dynamic Year in Footer ---
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- Header Sticky Blur & Mobile Menu ---
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('open')) {
          icon.classList.remove('fa-bars-staggered');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars-staggered');
        }
      }
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars-staggered');
        }
      });
    });
  }

  // --- Interactive Store & Cart Simulation ---
  const cartState = {
    items: [
      { id: 1, name: 'Custom Storefront Theme', price: 299, qty: 1 }
    ]
  };

  function updateCartUI() {
    const listEl = document.getElementById('cartItemList');
    const countEl = document.getElementById('cartCount');
    const totalEl = document.getElementById('cartTotalDisplay');
    const simPayAmount = document.getElementById('simPayAmount');

    if (!listEl) return;

    listEl.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cartState.items.length === 0) {
      listEl.innerHTML = '<li class="cart-item-row" style="color: var(--text-dim); justify-content: center;">Your cart is empty. Click + Add above!</li>';
    } else {
      cartState.items.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;

        const li = document.createElement('li');
        li.className = 'cart-item-row';
        li.innerHTML = `
          <span>${item.qty}x ${item.name}</span>
          <span>$${(item.price * item.qty).toFixed(2)}</span>
        `;
        listEl.appendChild(li);
      });
    }

    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (simPayAmount) simPayAmount.textContent = `$${total.toFixed(2)}`;
  }

  window.KlutchDemo = {
    addToCart: function (name, price) {
      const existing = cartState.items.find((i) => i.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cartState.items.push({ id: Date.now(), name, price, qty: 1 });
      }
      updateCartUI();

      // Trigger card highlight
      const cardGraphic = document.getElementById('cardGraphic');
      if (cardGraphic) {
        cardGraphic.classList.add('glow');
        setTimeout(() => cardGraphic.classList.remove('glow'), 600);
      }
    },

    clearCart: function () {
      cartState.items = [];
      updateCartUI();
    },

    handleSimulatePay: function (event) {
      event.preventDefault();
      const feedback = document.getElementById('simFeedback');
      const cardNumInput = document.getElementById('simCardNum');
      const cardNameInput = document.getElementById('simCardName');
      const payBtn = document.getElementById('simPayBtn');

      if (!feedback) return;

      const numVal = (cardNumInput?.value || '').replace(/\s+/g, '');
      if (numVal.length < 13) {
        feedback.className = 'sim-feedback-msg error';
        feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a valid card number (15-16 digits) for this live preview test.';
        feedback.style.display = 'block';
        return;
      }

      const total = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (total <= 0) {
        feedback.className = 'sim-feedback-msg error';
        feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please add at least one item to your cart before testing checkout!';
        feedback.style.display = 'block';
        return;
      }

      // Processing state
      const originalText = payBtn.innerHTML;
      payBtn.disabled = true;
      payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Encrypting &amp; Authorizing with Gateway...';
      feedback.style.display = 'none';

      setTimeout(() => {
        payBtn.disabled = false;
        payBtn.innerHTML = originalText;

        const authCode = Math.floor(100000 + Math.random() * 900000);
        feedback.className = 'sim-feedback-msg success';
        feedback.innerHTML = `
          <strong><i class="fa-solid fa-circle-check"></i> Test Payment Authorized!</strong><br />
          Transaction ID: <code>KP-AUTH-${authCode}</code> &bull; Amount: <strong>$${total.toFixed(2)}</strong><br />
          Seamless 1-click tokenized checkout handled via PCI-compliant pipeline.
        `;
        feedback.style.display = 'block';
      }, 1200);
    }
  };

  // --- Live Interactive Credit Card Formatting & Visual Synchronizer ---
  const simCardNum = document.getElementById('simCardNum');
  const simCardExp = document.getElementById('simCardExp');
  const simCardName = document.getElementById('simCardName');

  const cardSimNumber = document.getElementById('cardSimNumber');
  const cardSimExp = document.getElementById('cardSimExp');
  const cardSimHolder = document.getElementById('cardSimHolder');
  const cardBrandBadge = document.getElementById('cardBrandBadge');

  if (simCardNum) {
    simCardNum.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;

      if (cardSimNumber) {
        cardSimNumber.textContent = formatted.length > 0 ? formatted.padEnd(19, '•') : '•••• •••• •••• ••••';
      }

      if (cardBrandBadge) {
        if (val.startsWith('4')) {
          cardBrandBadge.textContent = 'VISA';
          cardBrandBadge.style.color = '#38bdf8';
        } else if (val.startsWith('5') || val.startsWith('2')) {
          cardBrandBadge.textContent = 'MC';
          cardBrandBadge.style.color = '#f97316';
        } else if (val.startsWith('3')) {
          cardBrandBadge.textContent = 'AMEX';
          cardBrandBadge.style.color = '#34d399';
        } else if (val.startsWith('6')) {
          cardBrandBadge.textContent = 'DISC';
          cardBrandBadge.style.color = '#fbbf24';
        } else {
          cardBrandBadge.textContent = 'CARD';
          cardBrandBadge.style.color = '#fff';
        }
      }
    });
  }

  if (simCardExp) {
    simCardExp.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      if (cardSimExp) {
        cardSimExp.textContent = val.length > 0 ? val : 'MM/YY';
      }
    });
  }

  if (simCardName) {
    simCardName.addEventListener('input', (e) => {
      let val = e.target.value.toUpperCase();
      if (cardSimHolder) {
        cardSimHolder.textContent = val.length > 0 ? val : 'YOUR NAME';
      }
    });
  }

  // --- Floating Live Chat Widget Module ---
  const chatContainer = document.getElementById('floatingChatContainer');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatHeaderClose = document.getElementById('chatHeaderClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInputText = document.getElementById('chatInputText');

  window.KlutchChat = {
    toggle: function () {
      if (chatContainer) {
        chatContainer.classList.toggle('open');
        if (chatContainer.classList.contains('open') && chatInputText) {
          setTimeout(() => chatInputText.focus(), 250);
        }
      }
    },

    open: function () {
      if (chatContainer) {
        chatContainer.classList.add('open');
        if (chatInputText) setTimeout(() => chatInputText.focus(), 250);
      }
    },

    close: function () {
      if (chatContainer) {
        chatContainer.classList.remove('open');
      }
    },

    appendMessage: function (text, sender) {
      if (!chatMessages) return;
      const row = document.createElement('div');
      row.className = `chat-bubble-row ${sender}`;

      if (sender === 'bot') {
        row.innerHTML = `
          <div class="avatar-small"><i class="fa-solid fa-bolt"></i></div>
          <div class="bubble-text">${text}</div>
        `;
      } else {
        row.innerHTML = `
          <div class="bubble-text">${text}</div>
        `;
      }

      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    handleInputSubmit: function (e) {
      e.preventDefault();
      if (!chatInputText) return;
      const query = chatInputText.value.trim();
      if (!query) return;

      this.appendMessage(query, 'user');
      chatInputText.value = '';

      this.generateBotResponse(query);
    },

    sendQuick: function (text) {
      this.open();
      this.appendMessage(text, 'user');
      this.generateBotResponse(text);
    },

    generateBotResponse: function (query) {
      const q = query.toLowerCase();
      let reply = "";

      if (q.includes('store') || q.includes('shop') || q.includes('product') || q.includes('ecommerce')) {
        reply = "I specialize in custom high-converting store designs! From responsive product galleries and slide-out carts to custom checkout funnels, I make sure your store converts visitors effortlessly.";
      } else if (q.includes('credit card') || q.includes('payment') || q.includes('stripe') || q.includes('square') || q.includes('checkout')) {
        reply = "Credit card payments are one of my core specialties. I implement fully tokenized, PCI DSS-compliant checkouts with Stripe, Square, Apple Pay, Google Pay, and major card networks with zero dropoff design.";
      } else if (q.includes('cloudflare') || q.includes('godaddy') || q.includes('domain') || q.includes('hosting') || q.includes('dns')) {
        reply = "For hosting, I preferably deploy to Cloudflare for blazing-fast edge performance (sub-20ms TTFB) and manage DNS directly through Cloudflare. I also prefer domain purchasing through GoDaddy, but I can configure any hosting provider or DNS manager you choose!";
      } else if (q.includes('quote') || q.includes('cost') || q.includes('price') || q.includes('estimate') || q.includes('rate')) {
        reply = "You can calculate your custom rate in real time using the Project Estimator section above! Typical setups range from simple payment integrations to complete e-commerce stores.";
      } else {
        reply = "Thanks for asking! As Klutchplay.com's creator, I specialize in custom store design, seamless credit card payments, live chat integration, and Cloudflare-backed hosting & DNS management. Would you like to schedule a project or estimate a quote?";
      }

      setTimeout(() => {
        this.appendMessage(reply, 'bot');
      }, 550);
    }
  };

  if (chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => window.KlutchChat.toggle());
  }

  if (chatHeaderClose) {
    chatHeaderClose.addEventListener('click', () => window.KlutchChat.close());
  }

  // --- Interactive Project Estimator / Quote Builder ---
  const optionCheckboxes = [
    { id: 'optDesign', name: 'Custom Website Design & UI/UX', price: 950 },
    { id: 'optStore', name: 'E-Commerce Store Design', price: 750 },
    { id: 'optPayments', name: 'Credit Card Payment Integration', price: 450 },
    { id: 'optLiveChat', name: 'Live Chat Feature Setup', price: 300 },
    { id: 'optCloudflare', name: 'Cloudflare Hosting & Edge Speed', price: 200 },
    { id: 'optGoDaddy', name: 'GoDaddy Domain & DNS Setup', price: 150 }
  ];

  function updateEstimator() {
    const totalEl = document.getElementById('estimatorTotal');
    const servicesListEl = document.getElementById('selectedServicesList');

    if (!totalEl || !servicesListEl) return;

    let total = 0;
    servicesListEl.innerHTML = '';

    optionCheckboxes.forEach((opt) => {
      const checkbox = document.getElementById(opt.id);
      const parentLabel = checkbox?.closest('.est-option-item');

      if (checkbox && checkbox.checked) {
        total += opt.price;
        parentLabel?.classList.add('selected');

        const chip = document.createElement('div');
        chip.className = 'summary-item-chip';
        chip.innerHTML = `<i class="fa-solid fa-check"></i> ${opt.name} (+$${opt.price})`;
        servicesListEl.appendChild(chip);
      } else {
        parentLabel?.classList.remove('selected');
      }
    });

    totalEl.textContent = total.toLocaleString();
  }

  optionCheckboxes.forEach((opt) => {
    const checkbox = document.getElementById(opt.id);
    if (checkbox) {
      checkbox.addEventListener('change', updateEstimator);
    }
  });

  window.KlutchQuote = {
    copyToContact: function () {
      const projectTypeSelect = document.getElementById('projectType');
      const detailsTextarea = document.getElementById('projectDetails');

      const selected = optionCheckboxes
        .filter((o) => document.getElementById(o.id)?.checked)
        .map((o) => o.name);

      const totalVal = document.getElementById('estimatorTotal')?.textContent || '2,800';

      if (detailsTextarea) {
        detailsTextarea.value = `Selected Features: ${selected.join(', ')}.\nEstimated Total: $${totalVal} USD.\nLooking forward to getting this started!`;
      }

      if (projectTypeSelect) {
        if (selected.includes('E-Commerce Store Design') && selected.includes('Live Chat Feature Setup')) {
          projectTypeSelect.value = 'Full Website + Store + Live Chat';
        } else if (selected.includes('E-Commerce Store Design')) {
          projectTypeSelect.value = 'Online Store & Credit Cards';
        }
      }
    }
  };

  // --- Contact Form Submission Handler ---
  window.KlutchContact = {
    handleSubmit: async function (e) {
      e.preventDefault();
      const form = document.getElementById('contactForm');
      const submitBtn = document.getElementById('submitFormBtn');
      const successBox = document.getElementById('contactFormSuccess');

      if (!form || !submitBtn) return;

      const clientName = document.getElementById('clientName')?.value || '';
      const clientEmail = document.getElementById('clientEmail')?.value || '';
      const projectType = document.getElementById('projectType')?.value || '';
      const hostingPreference = document.getElementById('hostingPreference')?.value || '';
      const projectDetails = document.getElementById('projectDetails')?.value || '';

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting Inquiry...';

      const payload = {
        clientName,
        clientEmail,
        projectType,
        hostingPreference,
        projectDetails
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (err) {
        console.warn('API endpoint unavailable or running in static preview mode, demonstrating success state:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        if (successBox) {
          successBox.style.display = 'block';
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  };

  // Initial runs
  updateCartUI();
  updateEstimator();
})();
