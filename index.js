document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[id]").forEach((el) => {
        const trimmed = (el.id || "").trim();

        if (trimmed && trimmed !== el.id) {
            el.id = trimmed;
        }
    });

    // Normalize internal href hashes if they contain spaces.
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const href = a.getAttribute("href");

        if (!href) {
            return;
        }

        const id = href.slice(1).trim();
        a.setAttribute("href", "#" + id);
    });

    // 1) Back to top
    const topBtn = document.getElementById("backToTop");

    if (topBtn) {
        const toggleTopBtn = () => {
            if (window.scrollY > 300) {
                topBtn.classList.remove("hidden");
            } else {
                topBtn.classList.add("hidden");
            }
        };

        toggleTopBtn();

        window.addEventListener("scroll", toggleTopBtn, {
            passive: true,
        });

        topBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    }

    // 2) Scroll reveal
    function makeReplayObserver(selector, inClass, baseDelay = 0) {
        const els = Array.from(document.querySelectorAll(selector));

        if (!els.length) {
            return;
        }

        els.forEach((el, i) => {
            if (baseDelay) {
                el.style.transitionDelay = `${i * baseDelay}s`;
            }
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

        els.forEach((el) => {
            obs.observe(el);
        });

        els.forEach((el) => {
            const rect = el.getBoundingClientRect();

            if (
                rect.top < window.innerHeight * 0.9 &&
                rect.bottom > 0
            ) {
                el.classList.add(inClass);
            }
        });
    }

    makeReplayObserver(".reveal", "show", 0);
    makeReplayObserver(".edu-reveal", "in", 0.08);
    makeReplayObserver(".proj-card", "in", 0.12);
    makeReplayObserver(".ach-card", "in", 0.10);

    // Existing generic carousel
    const slides = document.querySelectorAll(".carousel-slide");

    if (slides.length > 0) {
        slides[0].classList.add("active");
    }

    const dots = document.querySelectorAll(".carousel-dots .dot");
    let index = 0;

    function showSlide(i) {
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        dots.forEach((dot) => {
            dot.classList.remove("active");
        });

        if (slides[i]) {
            slides[i].classList.add("active");
        }

        if (dots[i]) {
            dots[i].classList.add("active");
        }
    }

    if (slides.length && dots.length) {
        setInterval(() => {
            index = (index + 1) % slides.length;
            showSlide(index);
        }, 4500);

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                index = dotIndex;
                showSlide(dotIndex);
            });
        });
    }

    // Desktop header scroll behavior
    (() => {
        const header = document.getElementById("topHeader");

        if (!header) {
            return;
        }

        let lastY = window.scrollY;
        let ticking = false;

        const onScroll = () => {
            const y = window.scrollY;

            if (y > 10) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }

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
            {
                passive: true,
            }
        );

        header.classList.add("nav-show");
    })();

    // Mobile menu
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    const openIcon = document.getElementById("menuOpenIcon");
    const closeIcon = document.getElementById("menuCloseIcon");

    if (btn && menu) {
        btn.addEventListener("click", () => {
            const isOpen = !menu.classList.contains("hidden");

            menu.classList.toggle("hidden");

            if (openIcon) {
                openIcon.classList.toggle("hidden", !isOpen);
            }

            if (closeIcon) {
                closeIcon.classList.toggle("hidden", isOpen);
            }
        });

        menu.addEventListener("click", (event) => {
            if (event.target.closest("a")) {
                menu.classList.add("hidden");

                if (openIcon) {
                    openIcon.classList.remove("hidden");
                }

                if (closeIcon) {
                    closeIcon.classList.add("hidden");
                }
            }
        });
    }

    // 3) Publication year + research type toggle filter
    const yearFilterButtons =
        document.querySelectorAll(".year-filter");

    const researchFilterButtons =
        document.querySelectorAll(".research-filter");

    const publicationCards =
        document.querySelectorAll(".publication-card");

    const publicationYearHeadings =
        document.querySelectorAll(".publication-year-heading");

    const publicationYearGroups =
        document.querySelectorAll(".publication-year-group");

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

            const cardResearchType =
                card.getAttribute("research-type");

            const yearMatches =
                !activeYear || activeYear === cardYear;

            const typeMatches =
                !activeResearchType ||
                activeResearchType === cardResearchType;

            if (yearMatches && typeMatches) {
                card.classList.remove("hidden");

                visibleCountByYear[cardYear] =
                    (visibleCountByYear[cardYear] || 0) + 1;
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
                        count === 1
                            ? "1 publication"
                            : `${count} publications`;
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
        yearFilterButtons.forEach((filterButton) => {
            const year = filterButton.dataset.year;

            const matchingCards = Array.from(
                publicationCards
            ).filter((card) => {
                const cardYear = card.dataset.year;

                const cardResearchType =
                    card.getAttribute("research-type");

                const yearMatches = cardYear === year;

                const typeMatches =
                    !activeResearchType ||
                    activeResearchType === cardResearchType;

                return yearMatches && typeMatches;
            });

            const count = matchingCards.length;

            if (count > 0 || activeYear === year) {
                filterButton.classList.remove("hidden");
                updateButtonCount(filterButton, count);
            } else {
                filterButton.classList.add("hidden");
            }
        });

        researchFilterButtons.forEach((filterButton) => {
            filterButton.classList.remove("hidden");
        });
    }

    function updateActiveButtonStyles() {
        yearFilterButtons.forEach((filterButton) => {
            const year = filterButton.dataset.year;

            if (activeYear === year) {
                filterButton.classList.remove(
                    "text-slate-500",
                    "font-normal"
                );

                filterButton.classList.add(
                    "text-slate-900",
                    "font-semibold"
                );
            } else {
                filterButton.classList.remove(
                    "text-slate-900",
                    "font-semibold"
                );

                filterButton.classList.add(
                    "text-slate-500",
                    "font-normal"
                );
            }
        });

        researchFilterButtons.forEach((filterButton) => {
            const type =
                filterButton.getAttribute("research-type");

            if (activeResearchType === type) {
                filterButton.classList.remove(
                    "text-slate-500",
                    "font-normal",
                    "hover:bg-slate-100",
                    "hover:text-slate-900"
                );

                filterButton.classList.add(
                    "bg-black",
                    "text-white",
                    "font-semibold"
                );
            } else {
                filterButton.classList.remove(
                    "bg-black",
                    "text-white",
                    "font-semibold"
                );

                filterButton.classList.add(
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

                // Mobile "All" button
                if (!selectedYear) {
                    document
                        .querySelector(".research-page-heading")
                        ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });

                    return;
                }

                const target = document.querySelector(
                    `.publication-year-group[data-group-year="${selectedYear}"]`
                );

                target?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        });

        researchFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedType =
                    button.getAttribute("research-type");

                activeResearchType =
                    activeResearchType === selectedType
                        ? null
                        : selectedType;

                if (activeYear) {
                    const selectedYearStillExists = Array.from(
                        publicationCards
                    ).some((card) => {
                        return (
                            card.dataset.year === activeYear &&
                            (
                                !activeResearchType ||
                                card.getAttribute("research-type") ===
                                    activeResearchType
                            )
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
    const achievementFilterButtons =
        document.querySelectorAll(".ach-filter");

    const achievementCards =
        document.querySelectorAll(".ach-card");

    if (
        achievementFilterButtons.length &&
        achievementCards.length
    ) {
        achievementFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedType = button.dataset.type;

                achievementCards.forEach((card) => {
                    const cardType = card.dataset.type;

                    if (
                        selectedType === "all" ||
                        selectedType === cardType
                    ) {
                        card.classList.remove("hidden");
                    } else {
                        card.classList.add("hidden");
                    }
                });

                achievementFilterButtons.forEach(
                    (filterButton) => {
                        filterButton.classList.remove(
                            "bg-black",
                            "text-white",
                            "font-semibold"
                        );

                        filterButton.classList.add(
                            "text-slate-500",
                            "font-normal",
                            "hover:text-slate-900"
                        );
                    }
                );

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

                const achievementScrollArea =
                    document.querySelector(".research-scroll");

                if (achievementScrollArea) {
                    achievementScrollArea.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                }
            });
        });
    }

// 7) Academic Highlights Carousel
(() => {
    const track = document.getElementById("actTrack");
    const prevButton = document.getElementById("actPrev");
    const nextButton = document.getElementById("actNext");
    const indicatorsContainer =
        document.getElementById("actIndicators");
    const currentCounter = document.getElementById("actCurrent");
    const totalCounter = document.getElementById("actTotal");
    const carousel = track?.closest(".act");

    if (
        !track ||
        !prevButton ||
        !nextButton ||
        !indicatorsContainer ||
        !currentCounter ||
        !totalCounter
    ) {
        return;
    }

    const originalSlides = Array.from(
        track.querySelectorAll(".act__slide")
    );

    const slideCount = originalSlides.length;

    if (!slideCount) {
        return;
    }

    /*
     * Clone the last and first slides.
     *
     * Track order becomes:
     * clone of slide 5, slide 1, slide 2, slide 3,
     * slide 4, slide 5, clone of slide 1.
     */
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone =
        originalSlides[slideCount - 1].cloneNode(true);

    firstClone.classList.add("act__slide--clone");
    lastClone.classList.add("act__slide--clone");

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    /*
     * Index 0 is the cloned final slide.
     * Index 1 is the real first slide.
     */
    let currentIndex = 1;
    let isAnimating = false;
    let autoplayTimer = null;

    let touchStartX = 0;
    let touchStartY = 0;

    const autoplayDelay = 4500;
    const transitionDuration = 700;

    totalCounter.textContent =
        String(slideCount).padStart(2, "0");

    indicatorsContainer.innerHTML = "";

    const indicators = originalSlides.map((_, slideIndex) => {
        const indicatorButton =
            document.createElement("button");

        indicatorButton.type = "button";
        indicatorButton.className = "act__indicator";

        indicatorButton.setAttribute(
            "aria-label",
            `Go to academic highlight ${slideIndex + 1}`
        );

        indicatorButton.addEventListener("click", () => {
            goToRealSlide(slideIndex);
            restartAutoplay();
        });

        indicatorsContainer.appendChild(indicatorButton);

        return indicatorButton;
    });

    /*
     * Converts the physical track index, including clones,
     * into the visible real-slide index from 0 to slideCount - 1.
     */
    function getRealIndex() {
        return (
            (currentIndex - 1 + slideCount) %
            slideCount
        );
    }

    function updateInterface() {
        const realIndex = getRealIndex();

        currentCounter.textContent =
            String(realIndex + 1).padStart(2, "0");

        indicators.forEach((indicator, indicatorIndex) => {
            const isActive = indicatorIndex === realIndex;

            indicator.classList.toggle(
                "is-active",
                isActive
            );

            if (isActive) {
                indicator.setAttribute(
                    "aria-current",
                    "true"
                );
            } else {
                indicator.removeAttribute("aria-current");
            }
        });

        originalSlides.forEach((slide, slideIndex) => {
            slide.setAttribute(
                "aria-hidden",
                slideIndex === realIndex
                    ? "false"
                    : "true"
            );
        });
    }

    function moveTrack(animate = true) {
        if (animate) {
            track.style.transition =
                `transform ${transitionDuration}ms ` +
                "cubic-bezier(0.22, 1, 0.36, 1)";
        } else {
            track.style.transition = "none";
        }

        track.style.transform =
            `translate3d(-${currentIndex * 100}%, 0, 0)`;

        updateInterface();
    }

    function nextSlide() {
        if (isAnimating) {
            return;
        }

        isAnimating = true;
        currentIndex += 1;
        moveTrack(true);
    }

    function previousSlide() {
        if (isAnimating) {
            return;
        }

        isAnimating = true;
        currentIndex -= 1;
        moveTrack(true);
    }

    function goToRealSlide(realIndex) {
        if (isAnimating) {
            return;
        }

        const normalizedIndex =
            (realIndex + slideCount) % slideCount;

        isAnimating = true;
        currentIndex = normalizedIndex + 1;

        moveTrack(true);
    }

    /*
     * After reaching a cloned slide, instantly move to
     * the matching real slide without a visible animation.
     */
    track.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "transform") {
            return;
        }

        if (currentIndex === slideCount + 1) {
            currentIndex = 1;
            moveTrack(false);
        } else if (currentIndex === 0) {
            currentIndex = slideCount;
            moveTrack(false);
        }

        /*
         * Force the instant reset to render before restoring
         * the transition for the next movement.
         */
        void track.offsetWidth;

        track.style.transition =
            `transform ${transitionDuration}ms ` +
            "cubic-bezier(0.22, 1, 0.36, 1)";

        isAnimating = false;
    });

    function startAutoplay() {
        stopAutoplay();

        if (
            slideCount <= 1 ||
            document.hidden ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }

        autoplayTimer = window.setInterval(
            nextSlide,
            autoplayDelay
        );
    }

    function stopAutoplay() {
        if (autoplayTimer !== null) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    prevButton.addEventListener("click", () => {
        previousSlide();
        restartAutoplay();
    });

    nextButton.addEventListener("click", () => {
        nextSlide();
        restartAutoplay();
    });

    track.setAttribute("tabindex", "0");

    track.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousSlide();
            restartAutoplay();
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            nextSlide();
            restartAutoplay();
        }
    });

    track.addEventListener(
        "touchstart",
        (event) => {
            touchStartX =
                event.changedTouches[0].clientX;

            touchStartY =
                event.changedTouches[0].clientY;

            stopAutoplay();
        },
        {
            passive: true,
        }
    );

    track.addEventListener(
        "touchend",
        (event) => {
            const touchEndX =
                event.changedTouches[0].clientX;

            const touchEndY =
                event.changedTouches[0].clientY;

            const horizontalDistance =
                touchStartX - touchEndX;

            const verticalDistance =
                touchStartY - touchEndY;

            const minimumSwipeDistance = 50;

            if (
                Math.abs(horizontalDistance) >
                Math.abs(verticalDistance)
            ) {
                if (
                    horizontalDistance >
                    minimumSwipeDistance
                ) {
                    nextSlide();
                } else if (
                    horizontalDistance <
                    -minimumSwipeDistance
                ) {
                    previousSlide();
                }
            }

            restartAutoplay();
        },
        {
            passive: true,
        }
    );

    if (carousel) {
        carousel.addEventListener(
            "mouseenter",
            stopAutoplay
        );

        carousel.addEventListener(
            "mouseleave",
            startAutoplay
        );

        carousel.addEventListener(
            "focusin",
            stopAutoplay
        );

        carousel.addEventListener(
            "focusout",
            startAutoplay
        );
    }

    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        }
    );

    /*
     * Start on the real first slide without displaying
     * the cloned final slide.
     */
    moveTrack(false);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            track.style.transition =
                `transform ${transitionDuration}ms ` +
                "cubic-bezier(0.22, 1, 0.36, 1)";
        });
    });

    startAutoplay();
})();
});