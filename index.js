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

    // 1) Back to top
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

    // 2) Scroll reveal
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
                        entry.target.classList.remove(inClass);
                    }
                });
            },
            {
                threshold: [0, 0.15],
                rootMargin: "0px 0px -12% 0px",
            }
        );

        els.forEach((el) => obs.observe(el));

        els.forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
                el.classList.add(inClass);
            }
        });
    }

    makeReplayObserver(".reveal", "show", 0);
    makeReplayObserver(".edu-reveal", "in", 0.08);
    makeReplayObserver(".proj-card", "in", 0.12);
    makeReplayObserver(".ach-card", "in", 0.10);

    const slides = document.querySelectorAll(".carousel-slide");
    if (slides.length > 0) {
        slides[0].classList.add("active");
    }

    const dots = document.querySelectorAll(".carousel-dots .dot");
    let index = 0;

    function showSlide(i) {
        slides.forEach((s) => s.classList.remove("active"));
        dots.forEach((d) => d.classList.remove("active"));
        slides[i].classList.add("active");
        dots[i].classList.add("active");
    }

    if (slides.length && dots.length) {
        setInterval(() => {
            index = (index + 1) % slides.length;
            showSlide(index);
        }, 4500);

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                index = i;
                showSlide(i);
            });
        });
    }

    (() => {
        const header = document.getElementById("topHeader");
        if (!header) return;

        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const y = window.scrollY;

            if (y > 10) header.classList.add("is-scrolled");
            else header.classList.remove("is-scrolled");

            if (y > lastY && y > 120) {
                header.classList.add("nav-hide");
                header.classList.remove("nav-show");
            } else {
                header.classList.add("nav-show");
                header.classList.remove("nav-hide");
            }

            lastY = y;
            ticking = false;
        };

        window.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(onScroll);
                    ticking = true;
                }
            },
            { passive: true }
        );

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

        menu.addEventListener("click", (e) => {
            if (e.target.closest("a")) {
                menu.classList.add("hidden");
                openIcon.classList.remove("hidden");
                closeIcon.classList.add("hidden");
            }
        });
    }

    // 3) Publication year + research type toggle filter
    // Dynamic behavior:
    // - Year buttons/counts update based on selected type.
    // - Type buttons/counts stay fixed and always visible.
    // - Clicking selected filter again unselects it.
    const yearFilterButtons = document.querySelectorAll(".year-filter");
    const researchFilterButtons = document.querySelectorAll(".research-filter");
    const publicationCards = document.querySelectorAll(".publication-card");
    const publicationYearHeadings = document.querySelectorAll(".publication-year-heading");
	const publicationYearGroups = document.querySelectorAll(".publication-year-group");

    let activeYear = null;
    let activeResearchType = null;

    function updateButtonCount(button, count) {
        const spans = button.querySelectorAll("span");
        const countSpan = spans[spans.length - 1];

        if (countSpan) {
            countSpan.textContent = count;
        }
    }

    function updatePublicationFilters() {
        const visibleCountByYear = {};

        publicationCards.forEach((card) => {
            const cardYear = card.dataset.year;
            const cardResearchType = card.getAttribute("research-type");

            const yearMatches = !activeYear || activeYear === cardYear;
            const typeMatches = !activeResearchType || activeResearchType === cardResearchType;

            if (yearMatches && typeMatches) {
                card.classList.remove("hidden");
                visibleCountByYear[cardYear] = (visibleCountByYear[cardYear] || 0) + 1;
            } else {
                card.classList.add("hidden");
            }
        });

        publicationYearHeadings.forEach((heading) => {
            const headingYear = heading.dataset.headingYear;
            const count = visibleCountByYear[headingYear] || 0;
            const countText = heading.querySelector(".year-count");

            if (count > 0) {
                heading.classList.remove("hidden");

                if (countText) {
                    countText.textContent =
                        count === 1 ? "1 publication" : `${count} publications`;
                }
            } else {
                heading.classList.add("hidden");
            }
        });
		
		publicationYearGroups.forEach((group) => {
    const groupYear = group.dataset.groupYear;
    const count = visibleCountByYear[groupYear] || 0;

    if (count > 0) {
        group.classList.remove("hidden");
    } else {
        group.classList.add("hidden");
    }
});

        updateAvailableFilterButtons();
    }

    function updateAvailableFilterButtons() {
        // Dynamic Jump to Year buttons/counts based on selected research type
        yearFilterButtons.forEach((btn) => {
            const year = btn.dataset.year;

            const matchingCards = Array.from(publicationCards).filter((card) => {
                const cardYear = card.dataset.year;
                const cardResearchType = card.getAttribute("research-type");

                const yearMatches = cardYear === year;
                const typeMatches =
                    !activeResearchType || activeResearchType === cardResearchType;

                return yearMatches && typeMatches;
            });

            const count = matchingCards.length;

            if (count > 0 || activeYear === year) {
                btn.classList.remove("hidden");
                updateButtonCount(btn, count);
            } else {
                btn.classList.add("hidden");
            }
        });

        // By Type buttons stay visible and counts stay fixed in HTML
        researchFilterButtons.forEach((btn) => {
            btn.classList.remove("hidden");
        });
    }

    function updateActiveButtonStyles() {
        yearFilterButtons.forEach((btn) => {
            const year = btn.dataset.year;

            if (activeYear === year) {
                btn.classList.remove("text-slate-500", "font-normal");
                btn.classList.add("text-slate-900", "font-semibold");
            } else {
                btn.classList.remove("text-slate-900", "font-semibold");
                btn.classList.add("text-slate-500", "font-normal");
            }
        });

        researchFilterButtons.forEach((btn) => {
    const type = btn.getAttribute("research-type");

    if (activeResearchType === type) {
        btn.classList.remove(
            "text-slate-500",
            "font-normal",
            "hover:bg-slate-100",
            "hover:text-slate-900"
        );

        btn.classList.add(
            "bg-black",
            "text-white",
            "font-semibold"
        );
    } else {
        btn.classList.remove(
            "bg-black",
            "text-white",
            "font-semibold"
        );

        btn.classList.add(
            "text-slate-500",
            "font-normal",
            "hover:bg-slate-100",
            "hover:text-slate-900"
        );
    }
});
    }

    if (publicationCards.length) {
yearFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedYear = button.dataset.year;

        // Mobile "All" button: go back to top of publications
        if (!selectedYear) {
            document.querySelector(".research-page-heading")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            return;
        }

        const target = document.querySelector(
            `.publication-year-group[data-group-year="${selectedYear}"]`
        );

        target?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

        researchFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedType = button.getAttribute("research-type");

                activeResearchType =
                    activeResearchType === selectedType ? null : selectedType;

                if (activeYear) {
                    const selectedYearStillExists = Array.from(publicationCards).some((card) => {
                        return (
                            card.dataset.year === activeYear &&
                            (!activeResearchType ||
                                card.getAttribute("research-type") === activeResearchType)
                        );
                    });

                    if (!selectedYearStillExists) {
                        activeYear = null;
                    }
                }

                updateActiveButtonStyles();
                updatePublicationFilters();
            });
        });

        updateActiveButtonStyles();
        updatePublicationFilters();
    }

// Achievement type filter
const achievementFilterButtons = document.querySelectorAll(".ach-filter");
const achievementCards = document.querySelectorAll(".ach-card");

if (achievementFilterButtons.length && achievementCards.length) {
    achievementFilterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedType = button.dataset.type;

            achievementCards.forEach((card) => {
                const cardType = card.dataset.type;

                if (selectedType === "all" || selectedType === cardType) {
                    card.classList.remove("hidden");
                } else {
                    card.classList.add("hidden");
                }
            });

            achievementFilterButtons.forEach((btn) => {
                btn.classList.remove(
                    "bg-black",
                    "text-white",
                    "font-semibold"
                );

                btn.classList.add(
                    "text-slate-500",
                    "font-normal",
                    "hover:text-slate-900"
                );
            });

            button.classList.remove(
                "text-slate-500",
                "font-normal",
                "hover:text-slate-900"
            );

            button.classList.add(
                "bg-black",
                "text-white",
                "font-semibold"
            );

            const achievementScrollArea = document.querySelector(".research-scroll");
            if (achievementScrollArea) {
                achievementScrollArea.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        });
    });
}

    // 7) PRO Carousel
    (() => {
        const track = document.getElementById("actTrack");
        const prev = document.getElementById("actPrev");
        const next = document.getElementById("actNext");
        if (!track || !prev || !next) return;

        const step = () => {
            const card = track.querySelector(".act__card");
            if (!card) return 320;
            const gap = parseFloat(getComputedStyle(track).gap || "0");
            return card.getBoundingClientRect().width + gap;
        };

        prev.addEventListener("click", () =>
            track.scrollBy({ left: -step(), behavior: "smooth" })
        );

        next.addEventListener("click", () =>
            track.scrollBy({ left: step(), behavior: "smooth" })
        );

        const centerFirstCard = () => {
            if (window.innerWidth > 640) return;
            const card = track.querySelector(".act__card");
            if (!card) return;

            const trackWidth = track.clientWidth;
            const cardWidth = card.clientWidth;
            const offset = (cardWidth - trackWidth) / 2;

            track.scrollLeft = offset;
        };

        window.addEventListener("load", centerFirstCard);
        window.addEventListener("resize", centerFirstCard);
    })();
});