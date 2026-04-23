// Unified Programmatic Interactivity (SSR Build 7.0 - Strategic Overhaul)
document.addEventListener('DOMContentLoaded', () => {
    console.log('BUILD 7.0 (Strategic Overhaul) - Customs Highway & Revenue Engine Ready');

    const modal = document.getElementById('contact-modal');
    const heroBtn = document.getElementById('v2-hero-trigger');
    const bottomBtn = document.getElementById('v2-bottom-trigger');
    const closeBtn = document.getElementById('modal-close');
    const leadForm = document.getElementById('lead-form');

    const openModal = () => {
        if (!modal) return;
        modal.classList.add('active');
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }, 400);
    };

    // Language Dropdown Toggle (Build 12.1)
    const langTrigger = document.getElementById('lang-menu-trigger');
    const langDropdown = document.getElementById('lang-menu-dropdown');

    if (langTrigger && langDropdown) {
        langTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target) && !langTrigger.contains(e.target)) {
                langDropdown.classList.remove('active');
            }
        });
    }

    // Modal Triggers
    if (heroBtn) heroBtn.addEventListener('click', openModal);
    if (bottomBtn) bottomBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // Form Submission (Build 11.1)
    if (leadForm) {
        leadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const status = document.getElementById('form-status');
            const button = document.getElementById('contact-button');
            const consent = document.getElementById('privacy-consent');
            if (!status || !button || !consent) return;

            if (!consent.checked) {
                status.classList.remove('hidden');
                status.innerText = 'PLEASE AGREE TO THE PRIVACY POLICY.';
                status.style.color = '#ef4444';
                return;
            }

            status.classList.remove('hidden');
            status.innerText = 'Sending...';
            button.disabled = true;

            const formData = new FormData(leadForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.success) {
                    status.innerText = 'SUCCESS. WE WILL CONTACT YOU.';
                    status.style.color = '#a88c5a'; 
                    leadForm.reset();
                    setTimeout(() => {
                        closeModal();
                        status.classList.add('hidden');
                        button.disabled = false;
                    }, 3000);
                } else {
                    throw new Error();
                }
            } catch (error) {
                status.innerText = 'ERROR. PLEASE TRY AGAIN.';
                status.style.color = '#ef4444';
                button.disabled = false;
            }
        });
    }

    // Sidebar Drawer (Build 15.3)
    const burgerTrigger = document.getElementById('burger-trigger');
    const burgerClose = document.getElementById('burger-close');
    const sidebarDrawer = document.getElementById('sidebar-drawer');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const sidebarLinks = sidebarDrawer?.querySelectorAll('a');

    const openSidebar = () => {
        if (!sidebarDrawer || !sidebarBackdrop) return;
        sidebarBackdrop.style.opacity = '1';
        sidebarBackdrop.style.pointerEvents = 'auto';
        sidebarDrawer.style.transform = 'translateX(0)';
        document.body.style.overflow = 'hidden';
    };

    const closeSidebar = () => {
        if (!sidebarDrawer || !sidebarBackdrop) return;
        sidebarBackdrop.style.opacity = '0';
        sidebarBackdrop.style.pointerEvents = 'none';
        sidebarDrawer.style.transform = 'translateX(-100%)';
        document.body.style.overflow = '';
    };

    if (burgerTrigger) burgerTrigger.addEventListener('click', openSidebar);
    if (burgerClose) burgerClose.addEventListener('click', closeSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
    if (sidebarLinks) sidebarLinks.forEach(link => link.addEventListener('click', closeSidebar));

    const menuContactTrigger = document.getElementById('menu-contact-trigger');
    if (menuContactTrigger) {
        menuContactTrigger.addEventListener('click', () => {
            closeSidebar();
            setTimeout(openModal, 400);
        });
    }

    // Global Reveal-on-Scroll Observer (Build 21.0)
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // observer.unobserve(entry.target); // Optional: keep animating or once
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.05,
        rootMargin: '0px 0px -10% 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        revealObserver.observe(el);
    });

    // Flying Article Stack (Build 20.0 - Dynamic Multi-Slide)
    const articleStack = document.getElementById('article-stack');
    const stackItems = document.querySelectorAll('.article-row-stack');
    const stackProgress = document.getElementById('stack-progress-fill');

    if (articleStack && stackItems.length > 0) {
        const handleStackScroll = () => {
            // Option 2 Implementation: Animations on mobile via Reveal-on-Scroll, 
            // Desktop keeps the sticky Stack effect.
            if (window.innerWidth < 768) {
                // Ensure desktop styles don't interfere if window was resized
                stackItems.forEach(item => {
                    item.style.transform = '';
                    item.style.opacity = '';
                    item.style.zIndex = '';
                });
                return;
            }

            const rect = articleStack.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const windowHeight = window.innerHeight;

            let totalProgress = -sectionTop / (sectionHeight - windowHeight);
            totalProgress = Math.max(0, Math.min(1, totalProgress));

            if (stackProgress) stackProgress.style.width = `${totalProgress * 100}%`;

            const totalItems = stackItems.length;
            
            stackItems.forEach((item, index) => {
                const itemStep = 1 / totalItems;
                const itemStart = index * itemStep;
                
                let itemProgress = (totalProgress - itemStart) / itemStep;
                itemProgress = Math.max(0, Math.min(1, itemProgress));

                // Layering logic
                item.style.zIndex = totalItems - index;

                // SPECIAL LOGIC FOR FIRST ITEM: Always visible at start
                const isFirstItemAtStart = (index === 0 && totalProgress === 0);

                if (index < totalItems - 1) {
                    if (itemProgress > 0.5) {
                        // Exit phase (flying out)
                        const factor = (itemProgress - 0.5) * 2;
                        item.style.transform = `translateX(${-factor * 120}%) translateY(${-factor * 20}px) rotate(${-factor * 5}deg)`;
                        item.style.opacity = 1 - factor;
                        item.style.pointerEvents = 'none';
                        item.style.visibility = 'visible';
                    } else if (itemProgress > 0 || isFirstItemAtStart) {
                        // Active phase (sitting still)
                        item.style.transform = 'translateX(0) translateY(0) rotate(0)';
                        item.style.opacity = '1';
                        item.style.pointerEvents = 'auto';
                        item.style.visibility = 'visible';
                    } else {
                        // Waiting phase
                        item.style.opacity = '0';
                        item.style.visibility = 'hidden';
                        item.style.pointerEvents = 'none';
                    }
                } else {
                    // Last item settles in
                    item.style.opacity = itemProgress > 0 ? '1' : '0';
                    item.style.visibility = itemProgress > 0 ? 'visible' : 'hidden';
                    item.style.transform = `scale(${0.95 + (itemProgress * 0.05)})`;
                }
            });
        };

        window.addEventListener('scroll', () => {
            window.requestAnimationFrame(handleStackScroll);
        });
        handleStackScroll();
    }

    // FAQ Accordion Toggle (Build 3.0)
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        document.querySelectorAll('.faq-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all other items for a clean accordion effect
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
});
