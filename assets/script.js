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

  // --- Interactive Store & Cart Simulation State ---
  const selectedVariants = {
    'velocity-pro': 'Cyber Cyan',
    'apex-keyset': 'Linear Speed Red',
    'capture-hub': 'USB-C 3.2 Gen 2',
    'desk-mat': 'XL (900x400mm)'
  };

  const cartState = {
    items: [
      { id: 'velocity-pro', name: 'Klutch Velocity Pro Kit', price: 89, qty: 1, variant: 'Cyber Cyan' }
    ],
    discountPercent: 0,
    appliedCoupon: null,
    payMethod: 'card'
  };

  function showDemoToast(msg) {
    const toast = document.getElementById('demoStoreToast');
    const toastMsg = document.getElementById('demoStoreToastMsg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.style.display = 'flex';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
      toast.style.display = 'none';
    }, 3200);
  }

  function updateCartUI() {
    const listEl = document.getElementById('cartItemList');
    const countEl = document.getElementById('cartCount');
    const subtotalEl = document.getElementById('cartSubtotalDisplay');
    const discountEl = document.getElementById('cartDiscountDisplay');
    const discountRow = document.getElementById('discountRow');
    const totalEl = document.getElementById('cartTotalDisplay');
    const simPayAmount = document.getElementById('simPayAmount');
    const shippingProgressFill = document.getElementById('shippingProgressBarFill');
    const shippingProgressPercent = document.getElementById('shippingProgressPercent');
    const shippingProgressMsg = document.getElementById('shippingProgressMsg');

    if (!listEl) return;

    listEl.innerHTML = '';
    let subtotal = 0;
    let count = 0;

    if (cartState.items.length === 0) {
      listEl.innerHTML = '<li class="cart-empty-message"><i class="fa-solid fa-cart-arrow-down"></i> Your cart is empty. Click "+ Add" on any gear above!</li>';
    } else {
      cartState.items.forEach((item, index) => {
        subtotal += item.price * item.qty;
        count += item.qty;

        const li = document.createElement('li');
        li.className = 'cart-item-row';
        li.innerHTML = `
          <div class="cart-item-details">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-variant">${item.variant || 'Standard'}</span>
          </div>
          <div class="cart-item-controls">
            <button type="button" class="btn-qty" onclick="window.KlutchDemo.updateQuantity(${index}, -1)" aria-label="Decrease">&minus;</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button type="button" class="btn-qty" onclick="window.KlutchDemo.updateQuantity(${index}, 1)" aria-label="Increase">&plus;</button>
          </div>
          <span class="cart-item-subtotal">$${(item.price * item.qty).toFixed(2)}</span>
          <button type="button" class="btn-item-remove" onclick="window.KlutchDemo.removeItem(${index})" title="Remove item">&times;</button>
        `;
        listEl.appendChild(li);
      });
    }

    let discountAmount = 0;
    if (cartState.discountPercent > 0 && subtotal > 0) {
      discountAmount = (subtotal * cartState.discountPercent) / 100;
      if (discountRow) discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    const shippingThreshold = 150;
    const progressPercent = Math.min(100, Math.round((subtotal / shippingThreshold) * 100));
    if (shippingProgressFill) shippingProgressFill.style.width = `${progressPercent}%`;
    if (shippingProgressPercent) shippingProgressPercent.textContent = `${progressPercent}%`;

    if (shippingProgressMsg) {
      if (subtotal >= shippingThreshold) {
        shippingProgressMsg.innerHTML = '<i class="fa-solid fa-circle-check text-emerald"></i> <strong>FREE Express Shipping unlocked!</strong> (Cloudflare Edge routed)';
      } else {
        const remaining = (shippingThreshold - subtotal).toFixed(2);
        shippingProgressMsg.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Add <strong>$${remaining}</strong> more for <strong>FREE Express Shipping</strong>!`;
      }
    }

    if (countEl) countEl.textContent = count;
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${finalTotal.toFixed(2)}`;
    if (simPayAmount) simPayAmount.textContent = `$${finalTotal.toFixed(2)}`;
  }

  window.KlutchDemo = {
    launchProductDemo: function (productId) {
      const demoSection = document.getElementById('interactive-demo');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: 'smooth' });
      }

      const existing = cartState.items.find((i) => i.id === productId);
      if (!existing) {
        const variant = selectedVariants[productId] || 'Cyber Cyan';
        cartState.items.push({ id: productId, name: 'Klutch Velocity Pro Kit', price: 89, qty: 1, variant });
        updateCartUI();
      }

      const targetCard = document.getElementById(`productCard-${productId}`);
      if (targetCard) {
        targetCard.classList.add('highlight-glow');
        setTimeout(() => targetCard.classList.remove('highlight-glow'), 2200);
      }

      showDemoToast('Klutch Velocity Pro Kit active in your demo store cart! Try coupon KLUTCH20 or test card checkout below.');
    },

    addToCart: function (name, price, id) {
      const variant = selectedVariants[id] || 'Standard';
      const existing = cartState.items.find((i) => i.name === name && i.variant === variant);
      if (existing) {
        existing.qty += 1;
      } else {
        cartState.items.push({ id, name, price, qty: 1, variant });
      }
      updateCartUI();

      const cardGraphic = document.getElementById('cardGraphic');
      if (cardGraphic) {
        cardGraphic.classList.add('glow');
        setTimeout(() => cardGraphic.classList.remove('glow'), 500);
      }

      showDemoToast(`Added ${name} (${variant}) to your cart!`);
    },

    updateQuantity: function (index, delta) {
      if (!cartState.items[index]) return;
      cartState.items[index].qty += delta;
      if (cartState.items[index].qty <= 0) {
        cartState.items.splice(index, 1);
      }
      updateCartUI();
    },

    removeItem: function (index) {
      if (!cartState.items[index]) return;
      const removed = cartState.items.splice(index, 1);
      updateCartUI();
      if (removed[0]) showDemoToast(`Removed ${removed[0].name} from cart`);
    },

    clearCart: function () {
      cartState.items = [];
      updateCartUI();
      showDemoToast('Demo shopping cart cleared.');
    },

    updateVariant: function (id, val) {
      selectedVariants[id] = val;
    },

    filterCategory: function (cat, btnEl) {
      const items = document.querySelectorAll('.demo-product-item');
      items.forEach((item) => {
        if (cat === 'all' || item.getAttribute('data-category') === cat) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });

      document.querySelectorAll('.cat-tab-btn').forEach((b) => b.classList.remove('active'));
      if (btnEl) btnEl.classList.add('active');
    },

    applyCoupon: function () {
      const input = document.getElementById('couponCodeInput');
      const code = (input?.value || '').trim().toUpperCase();
      if (code === 'KLUTCH20') {
        cartState.discountPercent = 20;
        cartState.appliedCoupon = 'KLUTCH20';
        updateCartUI();
        showDemoToast('Promo KLUTCH20 applied: 20% discount added!');
      } else if (code) {
        showDemoToast(`Code "${code}" is invalid. Try "KLUTCH20"!`);
      }
    },

    autoApplyCoupon: function (code) {
      const input = document.getElementById('couponCodeInput');
      if (input) input.value = code;
      cartState.discountPercent = 20;
      cartState.appliedCoupon = code;
      updateCartUI();
      showDemoToast(`Promo ${code} applied: 20% off total!`);
    },

    switchPayMethod: function (method) {
      cartState.payMethod = method;
      document.querySelectorAll('.pay-tab-btn').forEach((btn) => btn.classList.remove('active'));
      const activeBtn = document.getElementById(method === 'card' ? 'payTabCC' : method === 'apple' ? 'payTabApple' : 'payTabGoogle');
      if (activeBtn) activeBtn.classList.add('active');

      const cardGraphic = document.getElementById('cardGraphic');
      const payBtn = document.getElementById('simPayBtn');
      const totalText = document.getElementById('cartTotalDisplay')?.textContent || '$89.00';

      if (method === 'card') {
        if (cardGraphic) cardGraphic.style.display = 'block';
        if (payBtn) payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Authorize Test Payment (${totalText})`;
      } else if (method === 'apple') {
        if (cardGraphic) cardGraphic.style.display = 'none';
        if (payBtn) payBtn.innerHTML = `<i class="fa-brands fa-apple"></i> 1-Click Pay with Apple Pay (${totalText})`;
      } else if (method === 'google') {
        if (cardGraphic) cardGraphic.style.display = 'none';
        if (payBtn) payBtn.innerHTML = `<i class="fa-brands fa-google-pay"></i> 1-Click Pay with Google Pay (${totalText})`;
      }
    },

    autofillTestCard: function () {
      const cardNum = document.getElementById('simCardNum');
      const cardExp = document.getElementById('simCardExp');
      const cardCvc = document.getElementById('simCardCvc');
      const cardName = document.getElementById('simCardName');

      if (cardNum) {
        cardNum.value = '4242 4242 4242 4242';
        cardNum.dispatchEvent(new Event('input'));
      }
      if (cardExp) {
        cardExp.value = '12/28';
        cardExp.dispatchEvent(new Event('input'));
      }
      if (cardCvc) {
        cardCvc.value = '888';
      }
      if (cardName) {
        cardName.value = 'Alex Morgan';
        cardName.dispatchEvent(new Event('input'));
      }

      showDemoToast('Autofilled Test Visa (4242) credentials!');
    },

    handleSimulatePay: function (event) {
      event.preventDefault();
      const feedback = document.getElementById('simFeedback');
      const cardNumInput = document.getElementById('simCardNum');
      const payBtn = document.getElementById('simPayBtn');

      if (!feedback) return;

      const total = cartState.items.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (total <= 0) {
        feedback.className = 'sim-feedback-msg error';
        feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please add at least one item to your cart before testing checkout!';
        feedback.style.display = 'block';
        return;
      }

      if (cartState.payMethod === 'card') {
        const numVal = (cardNumInput?.value || '').replace(/\s+/g, '');
        if (numVal.length < 13) {
          feedback.className = 'sim-feedback-msg error';
          feedback.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please click "1-Click Autofill Test Visa" or enter a 16-digit card.';
          feedback.style.display = 'block';
          return;
        }
      }

      const originalText = payBtn.innerHTML;
      payBtn.disabled = true;
      payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Encrypting with 256-bit SSL...';
      feedback.style.display = 'none';

      setTimeout(() => {
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Tokenizing PCI-DSS Handshake...';
        setTimeout(() => {
          payBtn.disabled = false;
          payBtn.innerHTML = originalText;

          const authCode = Math.floor(100000 + Math.random() * 900000);
          const orderNum = Math.floor(10000 + Math.random() * 90000);
          const methodLabel = cartState.payMethod === 'card' ? 'Visa •••• 4242' : cartState.payMethod === 'apple' ? 'Apple Pay Token' : 'Google Pay Token';
          const finalPaid = document.getElementById('cartTotalDisplay')?.textContent || `$${total.toFixed(2)}`;

          feedback.className = 'sim-feedback-msg success';
          feedback.innerHTML = `
            <div class="receipt-header">
              <i class="fa-solid fa-circle-check text-emerald"></i>
              <h4>Order Confirmed &bull; #KP-${orderNum}</h4>
            </div>
            <div class="receipt-meta">
              <span>Payment Method: <strong>${methodLabel}</strong></span>
              <span>Gateway Auth ID: <code>KP-AUTH-${authCode}</code></span>
              <span>Total Paid: <strong>${finalPaid}</strong></span>
              <span>Routing: <strong>Cloudflare Global Edge</strong></span>
            </div>
            <p class="receipt-note">Demonstrating frictionless 1-click tokenized checkout built by Klutchplay.com.</p>
            <button type="button" class="btn-sm btn-secondary" onclick="window.KlutchDemo.resetDemo()">Reset Demo Store</button>
          `;
          feedback.style.display = 'block';
          feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 700);
      }, 600);
    },

    resetDemo: function () {
      cartState.items = [
        { id: 'velocity-pro', name: 'Klutch Velocity Pro Kit', price: 89, qty: 1, variant: 'Cyber Cyan' }
      ];
      cartState.discountPercent = 0;
      cartState.appliedCoupon = null;
      const feedback = document.getElementById('simFeedback');
      if (feedback) feedback.style.display = 'none';
      const couponInput = document.getElementById('couponCodeInput');
      if (couponInput) couponInput.value = '';
      this.switchPayMethod('card');
      this.autofillTestCard();
      updateCartUI();
      showDemoToast('Demo store & checkout reset to default.');
    },

    handleStoreChatPrompt: function (type) {
      const chatBody = document.querySelector('.embedded-chat-body');
      if (!chatBody) return;

      let userMsg = '';
      let botMsg = '';

      if (type === 'coupon') {
        userMsg = 'Do you have a coupon?';
        botMsg = 'Yes! Use promo code <strong>KLUTCH20</strong> for 20% off your entire order today! <button type="button" class="btn-chat-apply-code" onclick="window.KlutchDemo.autoApplyCoupon(\'KLUTCH20\')">Click to Apply KLUTCH20</button>';
      } else if (type === 'velocity') {
        userMsg = 'Tell me about the Velocity Pro Kit';
        botMsg = 'The <strong>Klutch Velocity Pro Kit ($89.00)</strong> is our top-rated tournament rig engineered with sub-1ms response and aircraft-grade aluminum casing.';
      } else if (type === 'shipping') {
        userMsg = 'How fast is Cloudflare shipping?';
        botMsg = 'Orders route through our global edge fulfillment network for instant dispatch within 24 hours!';
      }

      const userRow = document.createElement('div');
      userRow.className = 'embedded-chat-msg user';
      userRow.innerHTML = `<span>${userMsg}</span>`;
      chatBody.appendChild(userRow);

      setTimeout(() => {
        const botRow = document.createElement('div');
        botRow.className = 'embedded-chat-msg bot';
        botRow.innerHTML = `<i class="fa-solid fa-sparkles text-cyan"></i> <span>${botMsg}</span>`;
        chatBody.appendChild(botRow);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 350);
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
      const errorBox = document.getElementById('contactFormError');
      const errorMsgEl = document.getElementById('contactFormErrorMsg');

      if (!form || !submitBtn) return;
      if (successBox) successBox.style.display = 'none';
      if (errorBox) errorBox.style.display = 'none';

      const clientName = (document.getElementById('clientName')?.value || '').trim();
      const clientEmail = (document.getElementById('clientEmail')?.value || '').trim();
      const projectType = document.getElementById('projectType')?.value || '';
      const hostingPreference = document.getElementById('hostingPreference')?.value || '';
      const projectDetails = (document.getElementById('projectDetails')?.value || '').trim();

      // Gather current estimator context if available
      const selectedFeatures = optionCheckboxes
        .filter((o) => document.getElementById(o.id)?.checked)
        .map((o) => o.name);
      const estimatedTotal = (document.getElementById('estimatorTotal')?.textContent || '').trim();

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting Inquiry...';

      const payload = {
        clientName,
        clientEmail,
        projectType,
        hostingPreference,
        projectDetails,
        selectedFeatures,
        estimatedTotal,
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        let data = null;
        try {
          data = await response.json();
        } catch (_) {}

        if (!response.ok || !data?.success) {
          const errMsg = data?.error || `Server returned HTTP ${response.status}`;
          throw new Error(errMsg);
        }

        form.reset();
        if (successBox) {
          successBox.style.display = 'block';
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } catch (err) {
        console.error('Unable to send contact inquiry:', err);
        if (errorBox) {
          if (errorMsgEl) {
            errorMsgEl.textContent = err.message || 'There was a problem sending your inquiry. Please try again shortly.';
          }
          errorBox.style.display = 'block';
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    },
  };

  // Initial runs
  updateCartUI();
  updateEstimator();
})();
