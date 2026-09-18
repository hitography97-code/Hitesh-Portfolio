document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const nav = document.getElementById("nav");
    const topButton = document.getElementById("top");
    const navbar = document.querySelector(".navbar");
    const year = document.getElementById("year");
    const heroYear = document.getElementById("heroYear");
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    if (menu && nav) {
        menu.addEventListener("click", () => {
            nav.classList.toggle("open");
            const isOpen = nav.classList.contains("open");
            menu.setAttribute("aria-expanded", String(isOpen));
        });

        nav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("open");
                menu.setAttribute("aria-expanded", "false");
            });
        });
    }

    const currentYear = new Date().getFullYear();
    if (year) year.textContent = currentYear;
    if (heroYear) heroYear.textContent = currentYear;

    const handleScroll = () => {
        const scrolled = window.scrollY > 30;

        if (navbar) {
            navbar.classList.toggle("scrolled", scrolled);
        }

        if (topButton) {
            topButton.classList.toggle("show", window.scrollY > 600);
        }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    if (topButton) {
        topButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        });

        revealElements.forEach((element) => observer.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("visible"));
    }

    const skillBars = document.querySelectorAll(".skill-bar i");

    if ("IntersectionObserver" in window) {
        const skillObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const value = bar.dataset.width || "80%";
                    bar.style.width = value;
                    obs.unobserve(bar);
                }
            });
        }, {
            threshold: 0.5
        });

        skillBars.forEach((bar) => skillObserver.observe(bar));
    } else {
        skillBars.forEach((bar) => {
            bar.style.width = bar.dataset.width || "80%";
        });
    }

    const counters = document.querySelectorAll("[data-count]");

    const animateCounter = (element) => {
        const target = Number(element.dataset.count);
        const suffix = element.dataset.suffix || "";
        const duration = 1300;
        const startTime = performance.now();

        const update = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.floor(target * eased);

            element.textContent = value.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.65
        });

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => {
            counter.textContent = Number(counter.dataset.count).toLocaleString() + (counter.dataset.suffix || "");
        });
    }

    const glow = document.createElement("div");
    glow.setAttribute("aria-hidden", "true");

    Object.assign(glow.style, {
        position: "fixed",
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: "-1",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(101,232,255,.075), rgba(155,124,255,.035) 35%, transparent 70%)",
        filter: "blur(8px)",
        left: "50%",
        top: "50%",
        transition: "left .12s ease-out, top .12s ease-out"
    });

    document.body.appendChild(glow);

    window.addEventListener("pointermove", (event) => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
    }, { passive: true });

    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("name")?.value.trim() || "";
            const email = document.getElementById("email")?.value.trim() || "";
            const subject = document.getElementById("subject")?.value.trim() || "Portfolio enquiry";
            const message = document.getElementById("message")?.value.trim() || "";
            const submitButton = contactForm.querySelector("button[type=submit]");

            if (formStatus) formStatus.textContent = "Saving your message...";
            if (submitButton) submitButton.disabled = true;

            try {
                const response = await fetch("/api/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, subject, message })
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || "Unable to save your message.");

                contactForm.reset();
                if (formStatus) formStatus.textContent = "Message saved. Thank you for reaching out.";
            } catch (error) {
                if (formStatus) formStatus.textContent = error.message;
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    const heroVisual = document.querySelector(".hero-visual");
    const orbit = document.querySelector(".orbit");

    if (heroVisual && orbit && window.matchMedia("(pointer:fine)").matches) {
        heroVisual.addEventListener("pointermove", (event) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            orbit.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${y * -5}deg)`;
        });

        heroVisual.addEventListener("pointerleave", () => {
            orbit.style.transform = "";
        });
    }
});
