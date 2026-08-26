// 1. Connect the button after HTML loads
document.addEventListener("DOMContentLoaded", function () {
const themeButtons = document.querySelectorAll(
    "#themeToggle, #mobileThemeToggle"
);

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

if (themeButtons.length) {
    updateThemeButtons(
        root.dataset.theme === "dark" ? "dark" : "light"
    );

    themeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const nextTheme =
                root.dataset.theme === "dark" ? "light" : "dark";

            root.classList.add("is-theme-switching");

            root.dataset.theme = nextTheme;
            root.style.colorScheme = nextTheme;

            localStorage.setItem("site-theme", nextTheme);
            updateThemeButtons(nextTheme);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    root.classList.remove("is-theme-switching");
                });
            });
        });
    });
}

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

    // News button
    const newsToggle = document.getElementById("newsToggle");
    const newsExtras = document.querySelectorAll(".news-extra");

    if (newsToggle) {
        newsToggle.addEventListener("click", () => {
            const isExpanded = newsToggle.classList.toggle("is-expanded");

            newsExtras.forEach((item) => {
                item.classList.toggle("is-visible", isExpanded);
            });

            newsToggle.setAttribute("aria-expanded", isExpanded);

            newsToggle.querySelector(".news-toggle__text").textContent =
                isExpanded ? "Show less" : "Show more";
        });
    }

    // 2. Publication year + research type toggle filter
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

    let activeResearchType = null;

    // ---- TYPE FILTER (Journal / Book Chapter / All) ----
    function updatePublicationFilters() {
        const visibleCountByYear = {};

        publicationCards.forEach((card) => {
            const cardYear = card.dataset.year;
            const cardType = card.getAttribute("research-type");

            const typeMatches = !activeResearchType || activeResearchType === cardType;

            if (typeMatches) {
                card.classList.remove("hidden");
                visibleCountByYear[cardYear] = (visibleCountByYear[cardYear] || 0) + 1;
            } else {
                card.classList.add("hidden");
            }
        });

        publicationYearHeadings.forEach((heading) => {
            const headingYear = heading.dataset.headingYear;
            const count = visibleCountByYear[headingYear] || 0;

            heading.classList.toggle("hidden", count === 0);

            const countText = heading.querySelector(".year-count");
            if (countText) {
                countText.textContent = count === 1 ? "1 publication" : `${count} publications`;
            }
        });

        publicationYearGroups.forEach((group) => {
            const groupYear = group.dataset.groupYear;
            const count = visibleCountByYear[groupYear] || 0;
            group.classList.toggle("hidden", count === 0);
        });
    }

    function updateActiveTypeStyles() {
        researchFilterButtons.forEach((btn) => {
            const type = btn.getAttribute("research-type");
            btn.classList.toggle("is-active", activeResearchType === type && activeResearchType !== "");
        });
    }

    if (publicationCards.length) {
        // ---- YEAR BUTTONS: scroll to that year's section, no filtering ----
        yearFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedYear = button.dataset.year;

                // "All" button (empty data-year) scrolls back to the top of the list
                const target = selectedYear
                    ? document.querySelector(`.publication-year-group[data-group-year="${selectedYear}"]`)
                    : document.querySelector(".publication-scroll");

                target?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        });

        // ---- TYPE BUTTONS: actual filter ----
        researchFilterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selectedType = button.getAttribute("research-type");
                activeResearchType = activeResearchType === selectedType ? null : selectedType;

                updateActiveTypeStyles();
                updatePublicationFilters();
            });
        });

        updateActiveTypeStyles();
        updatePublicationFilters();

        // ---- SCROLL-SPY: auto-highlight the year currently in view ----
        const yearObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const year = entry.target.dataset.groupYear;
                        yearFilterButtons.forEach((btn) => {
                            btn.classList.toggle("is-current", btn.dataset.year === year);
                        });
                    }
                });
            },
            { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
        );

        publicationYearGroups.forEach((group) => yearObserver.observe(group));
    }

    // 3. Achievement type filter
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

                // Toggle .is-active on all matching-type buttons
                // (mobile filter row + desktop sidebar both use .ach-filter)
                achievementFilterButtons.forEach((filterButton) => {
                    filterButton.classList.toggle(
                        "is-active",
                        filterButton.dataset.type === selectedType
                    );
                });

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

    // 4. Academic Highlights Carousel
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
                        horizontalDistance < -minimumSwipeDistance
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
	
// 5. Shared Image + YouTube Lightbox
(() => {
    const lightboxItems = Array.from(
        document.querySelectorAll("[data-lightbox]")
    );

    // No lightbox items on this page
    if (!lightboxItems.length) {
        return;
    }

    /*
     * ---------------------------------------------------------
     * CREATE LIGHTBOX
     * ---------------------------------------------------------
     */

    const lightbox = document.createElement("div");

    lightbox.id = "publicationLightbox";
    lightbox.className = "publication-lightbox";
    lightbox.setAttribute("aria-hidden", "true");

    lightbox.innerHTML = `
        <button
            type="button"
            class="publication-lightbox__close"
            aria-label="Close image viewer">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <button
            type="button"
            class="act__arrow act__arrow--prev"
            aria-label="Previous item">
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        <div class="publication-lightbox__stage">

            <img
                id="publicationLightboxImage"
                src=""
                alt=""
                style="display: none;">

            <iframe
                id="publicationLightboxVideo"
                src=""
                title=""
                frameborder="0"
                allow="
                    accelerometer;
                    autoplay;
                    clipboard-write;
                    encrypted-media;
                    gyroscope;
                    picture-in-picture;
                    web-share
                "
                allowfullscreen
                style="display: none;">
            </iframe>

            <p
                id="publicationLightboxCaption"
                class="publication-lightbox__caption">
            </p>

        </div>

        <button
            type="button"
            class="act__arrow act__arrow--next"
            aria-label="Next item">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    document.body.appendChild(lightbox);


    /*
     * ---------------------------------------------------------
     * ELEMENTS
     * ---------------------------------------------------------
     */

    const lightboxImage =
        lightbox.querySelector("#publicationLightboxImage");

    const lightboxVideo =
        lightbox.querySelector("#publicationLightboxVideo");

    const caption =
        lightbox.querySelector("#publicationLightboxCaption");

    const closeButton =
        lightbox.querySelector(".publication-lightbox__close");

    const prevButton =
        lightbox.querySelector(".act__arrow--prev");

    const nextButton =
        lightbox.querySelector(".act__arrow--next");


    /*
     * ---------------------------------------------------------
     * STATE
     * ---------------------------------------------------------
     */

    let currentIndex = 0;


    /*
     * ---------------------------------------------------------
     * GET ITEM TYPE
     * ---------------------------------------------------------
     */

    function getItemType(item) {
        const type = item.dataset.lightbox;

        if (type === "youtube" || type === "video") {
            return "youtube";
        }

        return "image";
    }


    /*
     * ---------------------------------------------------------
     * GET YOUTUBE URL
     * ---------------------------------------------------------
     */

    function getYouTubeUrl(item) {
        let videoUrl =
            item.dataset.video ||
            item.dataset.youtube ||
            item.getAttribute("src") ||
            "";

        if (!videoUrl) {
            return "";
        }

        /*
         * If it's already an embed URL,
         * add autoplay.
         */
        if (videoUrl.includes("youtube.com/embed/")) {
            const separator =
                videoUrl.includes("?") ? "&" : "?";

            return `${videoUrl}${separator}autoplay=1&rel=0`;
        }

        /*
         * Convert normal YouTube URLs
         *
         * https://www.youtube.com/watch?v=VIDEO_ID
         *
         * into:
         *
         * https://www.youtube.com/embed/VIDEO_ID
         */

        let videoId = "";

        try {
            const url = new URL(videoUrl);

            if (url.hostname.includes("youtu.be")) {
                videoId = url.pathname.replace("/", "");
            } else if (url.searchParams.get("v")) {
                videoId = url.searchParams.get("v");
            }
        } catch (error) {
            // Ignore invalid URL
        }

        if (!videoId) {
            return "";
        }

        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }


    /*
     * ---------------------------------------------------------
     * UPDATE PREV / NEXT BUTTONS
     * ---------------------------------------------------------
     */

    function updateNavigation() {
        /*
         * FIRST ITEM
         * No previous button
         */
        if (currentIndex === 0) {
            prevButton.style.visibility = "hidden";
            prevButton.setAttribute("aria-hidden", "true");
        } else {
            prevButton.style.visibility = "visible";
            prevButton.setAttribute("aria-hidden", "false");
        }

        /*
         * LAST ITEM
         * No next button
         */
        if (currentIndex === lightboxItems.length - 1) {
            nextButton.style.visibility = "hidden";
            nextButton.setAttribute("aria-hidden", "true");
        } else {
            nextButton.style.visibility = "visible";
            nextButton.setAttribute("aria-hidden", "false");
        }
    }


    /*
     * ---------------------------------------------------------
     * SHOW ITEM
     * ---------------------------------------------------------
     */

    function showItem(index) {
        if (
            index < 0 ||
            index >= lightboxItems.length
        ) {
            return;
        }

        currentIndex = index;

        const item = lightboxItems[currentIndex];
        const type = getItemType(item);

        /*
         * Stop/remove previous YouTube video
         * before showing another item.
         */
        lightboxVideo.src = "";
        lightboxVideo.style.display = "none";

        lightboxImage.src = "";
        lightboxImage.style.display = "none";


        /*
         * -----------------------------------------------------
         * IMAGE
         * -----------------------------------------------------
         */

        if (type === "image") {
            lightboxImage.src =
                item.currentSrc ||
                item.getAttribute("src") ||
                "";

            lightboxImage.alt =
                item.getAttribute("alt") ||
                "Image";

            lightboxImage.style.display = "block";
        }


        /*
         * -----------------------------------------------------
         * YOUTUBE
         * -----------------------------------------------------
         */

        if (type === "youtube") {
            const youtubeUrl =
                getYouTubeUrl(item);

            if (youtubeUrl) {
                lightboxVideo.src = youtubeUrl;

                lightboxVideo.title =
                    item.dataset.title ||
                    item.getAttribute("title") ||
                    "YouTube video";

                lightboxVideo.style.display = "block";
            }
        }


        /*
         * -----------------------------------------------------
         * CAPTION
         * -----------------------------------------------------
         */

        caption.textContent =
            item.dataset.caption ||
            "";


        /*
         * -----------------------------------------------------
         * NAVIGATION
         * -----------------------------------------------------
         */

        updateNavigation();
    }


    /*
     * ---------------------------------------------------------
     * OPEN LIGHTBOX
     * ---------------------------------------------------------
     */

    function openLightbox(index) {
        showItem(index);

        lightbox.classList.add("is-open");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "lightbox-open"
        );

        closeButton.focus();
    }


    /*
     * ---------------------------------------------------------
     * CLOSE LIGHTBOX
     * ---------------------------------------------------------
     */

    function closeLightbox() {
        lightbox.classList.remove("is-open");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "lightbox-open"
        );

        /*
         * Removing iframe src stops YouTube playback.
         */
        lightboxVideo.src = "";

        lightboxImage.src = "";

        caption.textContent = "";
    }


    /*
     * ---------------------------------------------------------
     * PREVIOUS
     * ---------------------------------------------------------
     */

    function previousItem() {
        if (currentIndex <= 0) {
            return;
        }

        showItem(currentIndex - 1);
    }


    /*
     * ---------------------------------------------------------
     * NEXT
     * ---------------------------------------------------------
     */

    function nextItem() {
        if (
            currentIndex >=
            lightboxItems.length - 1
        ) {
            return;
        }

        showItem(currentIndex + 1);
    }


    /*
     * ---------------------------------------------------------
     * CLICK ITEMS TO OPEN
     * ---------------------------------------------------------
     */

    lightboxItems.forEach((item, index) => {
        item.style.cursor = "pointer";

        item.addEventListener("click", (event) => {

            /*
             * If the item itself is a YouTube iframe,
             * clicking inside the iframe normally belongs
             * to YouTube. We therefore don't try to intercept
             * that click.
             */
            if (
                item.tagName.toLowerCase() === "iframe"
            ) {
                return;
            }

            event.preventDefault();

            openLightbox(index);
        });
    });


    /*
     * ---------------------------------------------------------
     * CLOSE BUTTON
     * ---------------------------------------------------------
     */

    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    /*
     * ---------------------------------------------------------
     * PREVIOUS BUTTON
     * ---------------------------------------------------------
     */

    prevButton.addEventListener(
        "click",
        previousItem
    );


    /*
     * ---------------------------------------------------------
     * NEXT BUTTON
     * ---------------------------------------------------------
     */

    nextButton.addEventListener(
        "click",
        nextItem
    );

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
        event.stopPropagation();
        return;
    }
});

    /*
     * ---------------------------------------------------------
     * KEYBOARD CONTROLS
     * ---------------------------------------------------------
     */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !lightbox.classList.contains(
                    "is-open"
                )
            ) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeLightbox();
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                previousItem();
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                nextItem();
                return;
            }
        }
    );

})();
});