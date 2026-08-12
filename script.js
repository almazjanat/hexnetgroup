const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const menuLinks = mobileMenu?.querySelectorAll("a") ?? [];
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons({
    attrs: {
      "stroke-width": 1.65,
    },
  });
}

const setMenuState = (isOpen) => {
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  mobileMenu?.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
};

menuToggle?.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

menuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("is-scrolled", window.scrollY > 8),
  { passive: true },
);

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector("button[type='submit']");
  const formData = new FormData(contactForm);

  if (formData.get("_honey")) return;

  submitButton.disabled = true;
  formStatus.textContent = "Отправляем сообщение…";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false || result.success === "false") {
      throw new Error(result.message || "Form submission failed");
    }

    contactForm.reset();
    formStatus.textContent = "Сообщение отправлено. Мы свяжемся с вами в ближайшее время.";
  } catch (error) {
    formStatus.textContent = "Не удалось отправить форму. Напишите на hexnetgroup@outlook.com.";
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();

if (!prefersReducedMotion && window.gsap && window.ScrollTrigger) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const heroTimeline = gsap.timeline({
    defaults: { duration: 0.9, ease: "power3.out" },
  });

  heroTimeline
    .from(".site-header > *:not(.mobile-menu)", {
      y: -16,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.08,
    })
    .from(".hero-copy > *", { y: 38, autoAlpha: 0, stagger: 0.1 }, 0.12)
    .from(".hero-visual", { autoAlpha: 0, duration: 1.15 }, 0.22)
    .from(".hero-photo", { scale: 1.08, duration: 1.35, ease: "power2.out" }, 0.22)
    .from(".visual-index", { y: 14, autoAlpha: 0, duration: 0.65 }, 0.55)
    .from(".hero-meta > *", { y: 18, autoAlpha: 0, stagger: 0.09, duration: 0.65 }, 0.72);

  const revealGroup = (trigger, targets, options = {}) => {
    gsap.from(targets, {
      scrollTrigger: {
        trigger,
        start: "top 84%",
        once: true,
      },
      y: options.y ?? 42,
      autoAlpha: 0,
      duration: options.duration ?? 0.9,
      stagger: options.stagger ?? 0.12,
      ease: options.ease ?? "power3.out",
      clearProps: "transform,opacity,visibility",
    });
  };

  revealGroup(".intro", [".intro .section-label", ".intro h2", ".intro-columns > p"], {
    stagger: 0.11,
  });
  revealGroup(".directions", [".directions .section-heading", ...document.querySelectorAll(".direction-item")], {
    stagger: 0.1,
  });
  revealGroup(".projects", [".projects .section-heading", ...document.querySelectorAll(".project-card")], {
    y: 54,
    stagger: 0.12,
  });
  revealGroup(".team", [
    ".team .section-heading",
    ".team-statement",
    ...document.querySelectorAll(".role-row"),
  ]);
  revealGroup(".principles", [
    ".principles > .section-label",
    ".principles h2",
    ".principles-aside",
  ]);
  revealGroup(".contact", [
    ...document.querySelectorAll(".contact-copy > *"),
    ...document.querySelectorAll(".contact-form > *"),
  ], { stagger: 0.08 });
  revealGroup(".site-footer", [
    ...document.querySelectorAll(".footer-top > *"),
    ...document.querySelectorAll(".footer-bottom > *"),
  ], {
    y: 22,
    duration: 0.7,
    stagger: 0.07,
  });

  gsap.utils.toArray(".project-visual").forEach((symbol) => {
    gsap.fromTo(
      symbol,
      { yPercent: 5 },
      {
        yPercent: -5,
        ease: "none",
        scrollTrigger: {
          trigger: symbol.closest(".project-card"),
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  });

  const motionMedia = gsap.matchMedia();
  motionMedia.add("(min-width: 821px)", () => {
    gsap.fromTo(
      ".hero-photo",
      { yPercent: -2 },
      {
        yPercent: 2,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      },
    );
  });
}
