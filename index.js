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
        "a young researcher in deep learning",
        "seeking graduate research assistantship position",
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

    // 2) Side nav active highlight (IntersectionObserver)
    const sideNav = document.getElementById("sideNav");
    if (sideNav) {
        const linkEls = Array.from(sideNav.querySelectorAll("a[href^='#']"));
        const linkMap = {};
        linkEls.forEach((a) => {
            const id = a.getAttribute("href").slice(1).trim();
            linkMap[id] = a;
        });

        let lockActive = false;
        let lockTimer = null;

        function setActiveById(id) {
            Object.values(linkMap).forEach((a) => a.classList.remove("active"));
            if (linkMap[id]) linkMap[id].classList.add("active");
        }

        const navObserver = new IntersectionObserver(
            (entries) => {
                if (lockActive) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveById(entry.target.id);
                });
            }, { root: null, rootMargin: "0px 0px -60% 0px", threshold: 0.12 }
        );

        Object.keys(linkMap).forEach((id) => {
            const el = document.getElementById(id);
            if (el) navObserver.observe(el);
        });

        sideNav.addEventListener("click", (e) => {
            const a = e.target.closest("a[href^='#']");
            if (!a) return;
            const id = a.getAttribute("href").slice(1).trim();

            lockActive = true;
            clearTimeout(lockTimer);
            setActiveById(id);

            lockTimer = setTimeout(() => {
                lockActive = false;
            }, 1200);
        });

        if (location.hash) {
            const id = location.hash.slice(1).trim();
            if (linkMap[id]) setActiveById(id);
        }
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

    if (btn && menu) {
        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });

        menu.addEventListener("click", (e) => {
            if (e.target.closest("a")) menu.classList.add("hidden");
        });
    }

    // 7) PRO Carousel
    (() => {
        const viewport = document.getElementById("bioCarousel");
        if (!viewport) return;

        const slides = Array.from(viewport.querySelectorAll(".pro-slide"));
        if (!slides.length) return;

        const root = viewport.closest(".pro-carousel") || viewport.parentElement;

        const dotsWrap = root?.querySelector(".pro-dots");
        const bar = root?.querySelector(".pro-progress__bar");
        const prevBtn = root?.querySelector(".pro-btn--prev");
        const nextBtn = root?.querySelector(".pro-btn--next");

        let index = 0;

        // Build dots
        if (dotsWrap) {
            dotsWrap.innerHTML = slides
                .map(
                    () =>
                    `<button class="pro-dot" type="button" aria-label="Go to slide"></button>`
                )
                .join("");
        }

        const dots = dotsWrap ?
            Array.from(dotsWrap.querySelectorAll(".pro-dot")) : [];

        const clamp = (i) => (i + slides.length) % slides.length;

        function updateUI() {
            dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
            if (bar) {
                bar.style.width = "0%";
                requestAnimationFrame(() => (bar.style.width = "100%"));
            }
        }

        function goTo(i, smooth = true) {
            index = clamp(i);
            viewport.scrollTo({
                left: slides[index].offsetLeft,
                behavior: smooth ? "smooth" : "auto",
            });
            updateUI();
        }

        prevBtn?.addEventListener("click", () => goTo(index - 1));
        nextBtn?.addEventListener("click", () => goTo(index + 1));

        dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

        let raf = null;
        viewport.addEventListener(
            "scroll",
            () => {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    const x = viewport.scrollLeft;

                    let best = 0;
                    let bestDist = Infinity;

                    slides.forEach((s, i) => {
                        const d = Math.abs(s.offsetLeft - x);
                        if (d < bestDist) {
                            bestDist = d;
                            best = i;
                        }
                    });

                    if (best !== index) {
                        index = best;
                        updateUI();
                    }
                });
            }, { passive: true }
        );

        goTo(0, false);
    })();
});