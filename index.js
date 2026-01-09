document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[id]").forEach((el) => {
        const trimmed = (el.id || "").trim();
        if (trimmed && trimmed !== el.id) el.id = trimmed;
    });

    // Also normalize sideNav/mobileMenu href hashes if they have spaces
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const href = a.getAttribute("href");
        if (!href) return;
        const id = href.slice(1).trim();
        a.setAttribute("href", "#" + id);
    });

    // 1) Typewriter (animatedText)
    const sentences = [
        "research or teaching assistant opportunities",
    ];

    const textContainer = document.getElementById("animatedText");
    if (textContainer) {
        // lock container height to tallest sentence for current width
        function stabilizeHeight() {
            const probe = document.createElement("span");
            probe.style.visibility = "hidden";
            probe.style.position = "absolute";
            probe.style.left = "-9999px";
            probe.style.top = "0";
            probe.style.whiteSpace = "normal";
            probe.style.font = getComputedStyle(textContainer).font;
            probe.style.lineHeight = getComputedStyle(textContainer).lineHeight;
            probe.style.width = textContainer.clientWidth + "px";
            document.body.appendChild(probe);

            let maxH = 0;
            for (const s of sentences) {
                probe.textContent = s;
                maxH = Math.max(maxH, probe.offsetHeight);
            }
            textContainer.style.minHeight = maxH + "px";
            document.body.removeChild(probe);
        }

        stabilizeHeight();
        let rzTimer = null;
        window.addEventListener("resize", () => {
            clearTimeout(rzTimer);
            rzTimer = setTimeout(stabilizeHeight, 150);
        });

        // Typewriter loop (safe + smooth)
        let sIndex = 0;
        let tIndex = 0;
        let typingTimer = null;

        function typeNextChar() {
            const sentence = sentences[sIndex];
            textContainer.textContent = sentence.slice(0, tIndex);
            tIndex++;

            if (tIndex <= sentence.length) {
                typingTimer = setTimeout(typeNextChar, 90); // typing speed
            } else {
                // pause, then next sentence
                typingTimer = setTimeout(() => {
                    sIndex = (sIndex + 1) % sentences.length;
                    tIndex = 0;
                    textContainer.textContent = "";
                    typeNextChar();
                }, 1200); // hold time
            }
        }

        // start after layout is ready (prevents “sometimes not starting”)
        requestAnimationFrame(() => {
            clearTimeout(typingTimer);
            typeNextChar();
        });
    }

    // 4) Back to top
    const topBtn = document.getElementById("backToTop");
    if (topBtn) {
        const toggleTopBtn = () => {
            if (window.scrollY > 300) topBtn.classList.remove("hidden");
            else topBtn.classList.add("hidden");
        };
        toggleTopBtn();
        window.addEventListener("scroll", toggleTopBtn, { passive: true });
        topBtn.addEventListener("click", () =>
            window.scrollTo({ top: 0, behavior: "smooth" })
        );
    }

    // 5) Scroll reveal (REPLAYABLE + no “glitching”)
    //    - Adds class when entering
    //    - Removes class only when fully out (intersectionRatio === 0)
    function makeReplayObserver(selector, inClass, baseDelay = 0) {
        const els = Array.from(document.querySelectorAll(selector));
        if (!els.length) return;

        els.forEach((el, i) => {
            if (baseDelay) el.style.transitionDelay = `${i * baseDelay}s`;
        });

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(inClass);
                    } else if (entry.intersectionRatio === 0) {
                        // only reset when completely out (prevents flicker/glitch)
                        entry.target.classList.remove(inClass);
                    }
                });
            }, {
                threshold: [0, 0.15],
                rootMargin: "0px 0px -12% 0px",
            }
        );

        els.forEach((el) => obs.observe(el));

        // Show items already in view on load
        els.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
                el.classList.add(inClass);
            }
        });
    }

    // Your sections/cards
    makeReplayObserver(".reveal", "show", 0);
    makeReplayObserver(".edu-reveal", "in", 0.08);
    makeReplayObserver(".proj-card", "in", 0.12);
    makeReplayObserver(".ach-card", "in", 0.10);

    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        slides[0].classList.add('active');
    }
    const dots = document.querySelectorAll('.carousel-dots .dot');
    let index = 0;

    function showSlide(i) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[i].classList.add('active');
        dots[i].classList.add('active');
    }

    setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
    }, 4500);

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            index = i;
            showSlide(i);
        });
    });

    (() => {
        const header = document.getElementById("topHeader");
        if (!header) return;

        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const y = window.scrollY;

            // add shadow after a bit scroll
            if (y > 10) header.classList.add("is-scrolled");
            else header.classList.remove("is-scrolled");

            // show/hide based on direction
            if (y > lastY && y > 120) {
                // scrolling down
                header.classList.add("nav-hide");
                header.classList.remove("nav-show");
            } else {
                // scrolling up
                header.classList.add("nav-show");
                header.classList.remove("nav-hide");
            }

            lastY = y;
            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });

        // initial state
        header.classList.add("nav-show");
    })();
	
	const btn = document.getElementById("mobileMenuBtn");
	const menu = document.getElementById("mobileMenu");

	const openIcon = document.getElementById("menuOpenIcon");
	const closeIcon = document.getElementById("menuCloseIcon");

	if (btn && menu) {
	btn.addEventListener("click", () => {
		const isOpen = !menu.classList.contains("hidden");

		menu.classList.toggle("hidden");

		openIcon.classList.toggle("hidden", !isOpen);
		closeIcon.classList.toggle("hidden", isOpen);
	});

	// Auto-close when clicking a link
	menu.addEventListener("click", (e) => {
		if (e.target.closest("a")) {
		menu.classList.add("hidden");
		openIcon.classList.remove("hidden");
		closeIcon.classList.add("hidden");
		}
	});
	}
	// 7) PRO Carousel
	(() => {
	const track = document.getElementById('actTrack');
	const prev = document.getElementById('actPrev');
	const next = document.getElementById('actNext');
	if (!track || !prev || !next) return;

	const step = () => {
		const card = track.querySelector('.act__card');
		if (!card) return 320;
		const gap = parseFloat(getComputedStyle(track).gap || "0");
		return card.getBoundingClientRect().width + gap;
	};

	prev.addEventListener('click', () =>
		track.scrollBy({ left: -step(), behavior: 'smooth' })
	);

	next.addEventListener('click', () =>
		track.scrollBy({ left: step(), behavior: 'smooth' })
	);
   
   /* MOBILE: center first card on load */
	const centerFirstCard = () => {
		if (window.innerWidth > 640) return; // mobile only
		const card = track.querySelector('.act__card');
		if (!card) return;

		const trackWidth = track.clientWidth;
		const cardWidth = card.clientWidth;
		const offset = (cardWidth - trackWidth) / 2;

		track.scrollLeft = offset;
	};

	window.addEventListener('load', centerFirstCard);
	window.addEventListener('resize', centerFirstCard);
})();

});