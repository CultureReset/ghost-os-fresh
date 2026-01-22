/**
 * Ghost OS - JavaScript
 */

// ============================================
// LEAD COLLECTION CONFIGURATION
// ============================================
// Choose your lead collection method:
// Option 1: 'google-sheets' - Send to Google Sheets (recommended)
// Option 2: 'webhook' - Send to your own API endpoint
// Option 3: 'email' - Send via FormSubmit.co email service
// Option 4: 'local' - Just save to localStorage (for testing)
// ============================================

const LEAD_CONFIG = {
    method: 'email', // Change this to your preferred method

    // For Google Sheets: Set up Web App URL (see SETUP-LEADS.md)
    googleSheetsUrl: 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE',

    // For Webhook: Your backend API endpoint
    webhookUrl: 'https://your-api.com/leads',

    // For Email: Your email address for FormSubmit.co
    formSubmitEmail: 'cybercheckinc@gmail.com'
};

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === FORM HANDLING ===
const form = document.getElementById('access-form');
const thankYouMessage = document.getElementById('thank-you-message');
const devForm = document.getElementById('dev-form');
const devThankYouMessage = document.getElementById('dev-thank-you-message');

// Handle Early Access Form
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const smsConsent = formData.get('sms_consent') === 'yes';

        // Validate
        if (!name) {
            alert('Please enter your name');
            return;
        }

        if (!email && !phone) {
            alert('Please provide at least one contact method (email or phone number)');
            return;
        }

        // Prepare data
        const requestData = {
            name: name,
            email: email || 'Not provided',
            phone: phone || 'Not provided',
            sms_consent: smsConsent ? 'Yes' : 'No',
            timestamp: new Date().toISOString(),
            source: 'Early Access Form',
            url: window.location.href
        };

        console.log('Form submitted:', requestData);

        // Track event in Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Lead',
                event_label: 'Early Access Request',
                value: 1
            });
        }

        try {
            // Send lead based on configured method
            await sendLead(requestData);

            // Hide form, show thank you
            form.style.display = 'none';
            thankYouMessage.style.display = 'block';

            // Scroll to top of modal
            const modalBody = document.querySelector('#access-modal .modal-body');
            if (modalBody) {
                modalBody.scrollTop = 0;
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your request. Please try again or contact us directly.');
        }
    });
}

// Handle Developer Waitlist Form
if (devForm) {
    devForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(devForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const smsConsent = formData.get('dev_sms_consent') === 'yes';

        // Validate
        if (!name) {
            alert('Please enter your name');
            return;
        }

        if (!email && !phone) {
            alert('Please provide at least one contact method (email or phone number)');
            return;
        }

        // Prepare data
        const requestData = {
            name: name,
            email: email || 'Not provided',
            phone: phone || 'Not provided',
            sms_consent: smsConsent ? 'Yes' : 'No',
            timestamp: new Date().toISOString(),
            source: 'Developer Waitlist',
            url: window.location.href
        };

        console.log('Developer form submitted:', requestData);

        // Track event in Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Lead',
                event_label: 'Developer Waitlist',
                value: 1
            });
        }

        try {
            // Send lead based on configured method
            await sendLead(requestData);

            // Hide form, show thank you
            devForm.style.display = 'none';
            devThankYouMessage.style.display = 'block';

            // Scroll to top of modal
            const modalBody = document.querySelector('#dev-modal .modal-body');
            if (modalBody) {
                modalBody.scrollTop = 0;
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your request. Please try again or contact us directly.');
        }
    });
}

// Function to send lead based on configuration
async function sendLead(data) {
    switch (LEAD_CONFIG.method) {
        case 'google-sheets':
            return sendToGoogleSheets(data);

        case 'webhook':
            return sendToWebhook(data);

        case 'email':
            return sendViaFormSubmit(data);

        case 'local':
        default:
            // Store in localStorage (for testing)
            localStorage.setItem('ghost-os-request', JSON.stringify(data));
            console.log('Lead saved to localStorage:', data);
            return Promise.resolve();
    }
}

// Send to Google Sheets
async function sendToGoogleSheets(data) {
    const response = await fetch(LEAD_CONFIG.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    return response;
}

// Send to your own webhook/API
async function sendToWebhook(data) {
    const response = await fetch(LEAD_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Failed to send to webhook');
    }

    return response.json();
}

// Send via FormSubmit.co (email service)
async function sendViaFormSubmit(data) {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('source', data.source);
    formData.append('timestamp', data.timestamp);

    // Add SMS consent if present
    if (data.sms_consent) {
        formData.append('sms_consent', data.sms_consent);
    }

    const response = await fetch(`https://formsubmit.co/${LEAD_CONFIG.formSubmitEmail}`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to send via FormSubmit');
    }

    return response;
}

// === WAVEFORM ANIMATION TRIGGER ===
function activateWaveform() {
    const waves = document.querySelectorAll('.wave');
    waves.forEach((wave, index) => {
        setTimeout(() => {
            wave.style.animation = 'wave 1.2s ease-in-out infinite';
            wave.style.animationDelay = `${index * 0.1}s`;
        }, index * 100);
    });
}

// Start waveform when page loads
window.addEventListener('load', activateWaveform);

// === SCROLL ANIMATIONS ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// === MODAL FUNCTIONALITY ===
const modal = document.getElementById('access-modal');
const devModal = document.getElementById('dev-modal');
const closeModalBtn = document.getElementById('close-modal');
const closeDevModalBtn = document.getElementById('close-dev-modal');
const openModalBtns = document.querySelectorAll('.open-modal');
const openDevModalBtns = document.querySelectorAll('.open-dev-modal');

// Open early access modal
openModalBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

// Open developer modal
openDevModalBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        devModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
});

// Close early access modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close developer modal
function closeDevModal() {
    devModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (closeDevModalBtn) {
    closeDevModalBtn.addEventListener('click', closeDevModal);
}

// Close modals when clicking overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (modal.classList.contains('active')) {
            closeModal();
        }
        if (devModal.classList.contains('active')) {
            closeDevModal();
        }
    });
});

// Close modals on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (modal.classList.contains('active')) {
            closeModal();
        }
        if (devModal.classList.contains('active')) {
            closeDevModal();
        }
    }
});

// === NAV SCROLL EFFECT (Removed - no nav) ===

// === PARTICLE EFFECT (STARS) ===
function createStars() {
    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    starsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        background: #000000;
    `;

    // Create more stars and make them more visible
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.7 + 0.3};
            box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.8);
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
        `;
        starsContainer.appendChild(star);
    }

    document.body.prepend(starsContainer);
}

// Add CSS for twinkling
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }

    .fade-in {
        animation: fadeIn 0.8s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Create stars on load
window.addEventListener('load', createStars);

// === MOBILE MENU TOGGLE ===
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const headerNav = document.querySelector('.header-nav');
const navLinks = document.querySelectorAll('.nav-link');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        headerNav.classList.toggle('active');
    });

    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            headerNav.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!headerNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            headerNav.classList.remove('active');
        }
    });
}

// === CONSOLE MESSAGE ===
console.log('%c👻 Ghost OS', 'font-size: 48px; font-weight: bold; color: #8b5cf6;');
console.log('%cThe Internet Now Has a Voice', 'font-size: 16px; color: #a78bfa;');
console.log('%cInterested in the API? Email: dev@ghost-os.com', 'font-size: 12px; color: #71717a;');

// === AUTOMATION CAROUSEL ===
let currentAutomationSlide = 0;

function showAutomationSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (index >= slides.length) {
        currentAutomationSlide = 0;
    } else if (index < 0) {
        currentAutomationSlide = slides.length - 1;
    } else {
        currentAutomationSlide = index;
    }

    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Remove active from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Show current slide
    slides[currentAutomationSlide].classList.add('active');
    dots[currentAutomationSlide].classList.add('active');
}

function changeAutomationSlide(direction) {
    showAutomationSlide(currentAutomationSlide + direction);
}

function goToAutomationSlide(index) {
    showAutomationSlide(index);
}

// Auto-advance carousel every 5 seconds
setInterval(() => {
    changeAutomationSlide(1);
}, 5000);
