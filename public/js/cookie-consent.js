const STORAGE_KEY = 'V-Ledger_consent_session_v21';
const EXPIRY_TIME = 15 * 60 * 1000; // 15 Minutes in milliseconds

function initCookieGatekeeper() {
    const barrier = document.getElementById('cookie-barrier');
    const pbar = document.getElementById('cookie-scan-progress');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    const settingsBtn = document.getElementById('cookie-settings');

    // Check session storage first
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    let shouldShow = true;

    if (sessionData) {
        try {
            const data = JSON.parse(sessionData);
            const now = new Date().getTime();
            const savedTime = new Date(data.timestamp).getTime();
            
            // If less than 15 mins passed, don't show
            if (now - savedTime < EXPIRY_TIME) {
                shouldShow = false;
            }
        } catch (e) {
            console.error('Consent parse error', e);
        }
    }

    if (shouldShow) {
        showGatekeeper();
    } else {
        // Ensure page is unlocked if consent is still valid
        document.body.classList.remove('cookie-lock');
        barrier.classList.remove('show');
    }

    function showGatekeeper() {
        document.body.classList.add('cookie-lock');
        setTimeout(() => {
            barrier.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            if (pbar) pbar.classList.add('active');
        }, 500);
    }

    function hideGatekeeper(type) {
        const data = {
            timestamp: new Date().toISOString(),
            choice: type
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        barrier.style.transition = 'opacity 500ms ease-out';
        barrier.classList.remove('show');
        
        setTimeout(() => {
            document.body.classList.remove('cookie-lock');
        }, 500);

        window.dispatchEvent(new CustomEvent('V-Ledger-consent-updated', { detail: data }));
    }

    // Event Listeners
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => hideGatekeeper('all'));
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => hideGatekeeper('minimal'));
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Placeholder: Show advanced settings modal if needed
            alert('Infrastructure Preferences: Under Development for ESPR 2027.');
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCookieGatekeeper);
