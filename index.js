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
        "A Researcher in Deep Learning",
        "Looking for Research Assistantship Position",
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

    // 3) Mobile menu
    const mmBtn = document.getElementById("mobileMenuBtn");
    const mmNav = document.getElementById("mobileMenu");
    if (mmBtn && mmNav) {
        mmBtn.addEventListener("click", () => mmNav.classList.toggle("hidden"));
        mmNav.addEventListener("click", (e) => {
            if (e.target.closest("a")) mmNav.classList.add("hidden");
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
});