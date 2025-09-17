document.addEventListener("DOMContentLoaded", () => {
    const sentences = [
        "Looking for Research Assistantship Position",
        "A Researcher in Deep Learning, Medical Imaging",
    ];

    const textContainer = document.getElementById("animatedText");
    if (textContainer) {
        // lock container height to the tallest sentence for current width
        function stabilizeHeight() {
            const probe = document.createElement("span");
            probe.style.visibility = "hidden";
            probe.style.position = "absolute";
            probe.style.left = "-9999px";
            probe.style.top = "0";
            probe.style.whiteSpace = "normal"; // allow wrapping like real container
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

        // recompute on load & when screen size changes
        stabilizeHeight();
        let rzTimer = null;
        window.addEventListener("resize", () => {
            clearTimeout(rzTimer);
            rzTimer = setTimeout(stabilizeHeight, 150);
        });

        // typewriter
        let i = 0;

        function showSentence() {
            textContainer.textContent = "";
            const sentence = sentences[i];
            let j = 0;
            (function type() {
                if (j < sentence.length) {
                    textContainer.textContent += sentence[j++];
                    setTimeout(type, 100);
                } else {
                    setTimeout(() => {
                        i = (i + 1) % sentences.length;
                        showSentence();
                    }, 1000);
                }
            })();
        }
        showSentence();
    }

    const sideNav = document.getElementById("sideNav");
    if (sideNav) {
        const sectionIds = [
            "about",
            "education",
            "research",
            "publication",
            "project",
            "work",
            "activity",
            "service",
            "contact",
        ];
        const linkMap = Object.fromEntries(
            Array.from(sideNav.querySelectorAll("a[href^='#']")).map((a) => [
                a.getAttribute("href").slice(1),
                a,
            ])
        );

        let lockActive = false;
        let lockTimer = null;

        function setActiveById(id) {
            Object.values(linkMap).forEach((a) => a.classList.remove("active"));
            if (linkMap[id]) linkMap[id].classList.add("active");
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (lockActive) return;
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveById(entry.target.id);
                });
            }, { root: null, rootMargin: "0px 0px -60% 0px", threshold: 0.1 }
        );

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        sideNav.addEventListener("click", (e) => {
            const a = e.target.closest("a[href^='#']");
            if (!a) return;
            const id = a.getAttribute("href").slice(1);
            lockActive = true;
            clearTimeout(lockTimer);
            setActiveById(id);
            lockTimer = setTimeout(() => {
                lockActive = false;
            }, 1200);
        });

        if (location.hash && linkMap[location.hash.slice(1)]) {
            setActiveById(location.hash.slice(1));
        }
    }

    const mmBtn = document.getElementById("mobileMenuBtn");
    const mmNav = document.getElementById("mobileMenu");
    if (mmBtn && mmNav) {
        mmBtn.addEventListener("click", () => mmNav.classList.toggle("hidden"));
        // close menu when a link is tapped
        mmNav.addEventListener("click", (e) => {
            if (e.target.closest("a")) mmNav.classList.add("hidden");
        });
    }

    const topBtn = document.getElementById("backToTop");
    if (topBtn) {
        const toggleTopBtn = () => {
            if (window.scrollY > 300) topBtn.classList.remove("hidden");
            else topBtn.classList.add("hidden");
        };
        toggleTopBtn();
        window.addEventListener("scroll", toggleTopBtn);
        topBtn.addEventListener("click", () =>
            window.scrollTo({ top: 0, behavior: "smooth" })
        );
    }
});