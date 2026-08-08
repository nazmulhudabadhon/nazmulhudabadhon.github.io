    // 1. Read saved theme immediately
(function () {
    try {
        const savedTheme = localStorage.getItem("site-theme");
        const systemDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        const theme = savedTheme || (systemDark ? "dark" : "light");

        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
    } catch (error) {
        document.documentElement.dataset.theme = "light";
        document.documentElement.style.colorScheme = "light";
    }
})();

// 2. Connect the button after HTML loads
document.addEventListener("DOMContentLoaded", function () {
    const themeButtons = document.querySelectorAll(
        "#themeToggle, #mobileThemeToggle"
    );

    if (!themeButtons.length) return;

    const root = document.documentElement;

    function updateThemeButtons(theme) {
        const isDark = theme === "dark";

        themeButtons.forEach(function (button) {
            const icon = button.querySelector("i");

            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

            if (icon) {
                icon.className = isDark
                    ? "fa-regular fa-sun"
                    : "fa-regular fa-moon";
            }
        });
    }

    updateThemeButtons(
        root.dataset.theme === "dark" ? "dark" : "light"
    );

    themeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const nextTheme =
                root.dataset.theme === "dark" ? "light" : "dark";

            root.dataset.theme = nextTheme;
            root.style.colorScheme = nextTheme;

            localStorage.setItem("site-theme", nextTheme);
            updateThemeButtons(nextTheme);
        });
    });
});

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
	
	//News button
	  const newsToggle = document.getElementById("newsToggle");
  const newsExtras = document.querySelectorAll(".news-extra");

  newsToggle.addEventListener("click", () => {
    const isExpanded = newsToggle.classList.toggle("is-expanded");

    newsExtras.forEach((item) => {
      item.classList.toggle("is-visible", isExpanded);
    });

    newsToggle.setAttribute("aria-expanded", isExpanded);

    newsToggle.querySelector(".news-toggle__text").textContent =
      isExpanded ? "Show less" : "Show more";
  });


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

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopAutoplay();
        return;
    }

    requestAnimationFrame(() => {
        startAutoplay();
    });
});
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