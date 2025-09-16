document.addEventListener("DOMContentLoaded", () => {
    const sentences = [
        "Looking for Research Assistantship Position",
        "A Researcher in Deep Learning"
    ];

    const textContainer = document.getElementById("animatedText");
    if (textContainer) {
        let i = 0;

        function showSentence() {
            textContainer.textContent = "";
            const sentence = sentences[i];
            let j = 0;

            function type() {
                if (j < sentence.length) {
                    textContainer.textContent += sentence[j++];
                    setTimeout(type, 100);
                } else {
                    setTimeout(nextSentence, 1000);
                }
            }

            function nextSentence() {
                i = (i + 1) % sentences.length;
                showSentence();
            }
            type();
        }
        showSentence();
    }

    const sideNav = document.getElementById("sideNav");
    if (sideNav) {
        const sectionIds = ["about", "education", "research", "publication", "project", "work", "activity", "service", "contact"];
        const linkMap = Object.fromEntries(
            Array.from(sideNav.querySelectorAll("a[href^='#']")).map(a => [a.getAttribute("href").slice(1), a])
        );

        let lockActive = false;
        let lockTimer = null;

        function setActiveById(id) {
            Object.values(linkMap).forEach(a => a.classList.remove("active"));
            if (linkMap[id]) linkMap[id].classList.add("active");
        }

        const observer = new IntersectionObserver((entries) => {
            if (lockActive) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) setActiveById(entry.target.id);
            });
        }, { root: null, rootMargin: "0px 0px -60% 0px", threshold: 0.1 });

        sectionIds.forEach(id => {
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
            lockTimer = setTimeout(() => { lockActive = false; }, 1200);
        });

        if (location.hash && linkMap[location.hash.slice(1)]) {
            setActiveById(location.hash.slice(1));
        }
    }
});