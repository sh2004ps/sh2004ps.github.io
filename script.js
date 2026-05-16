const backgroundBanner = document.querySelector(".banner-background-layer");
const foregroundLayer = document.querySelector(".content-foreground-layer");
const navbar = document.querySelector("[data-navbar]");
const NAV_SHOW_OFFSET = 120;
let lastScrollY = window.scrollY;
let isScrollingDown = true;
let ticking = false;

function updateChrome() {
  const currentScrollY = window.scrollY;
  isScrollingDown = currentScrollY > lastScrollY;
  lastScrollY = Math.max(currentScrollY, 0);

  if (backgroundBanner) {
    const progress = Math.min(currentScrollY / 320, 1);
    backgroundBanner.style.opacity = String(1 - progress * 0.35);
    backgroundBanner.style.transform = `scale(${1 - progress * 0.015})`;
    backgroundBanner.style.filter = `blur(${progress * 1.1}px)`;
  }

  if (navbar && foregroundLayer) {
    const trigger = Math.max(NAV_SHOW_OFFSET, foregroundLayer.offsetTop - 220);
    navbar.classList.toggle("visible", currentScrollY >= trigger);
  }
}

function handleScroll() {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    updateChrome();
    ticking = false;
  });
}

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", updateChrome);
updateChrome();

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scroll);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const mobileMenuButton = document.querySelector(".mobile-menu-button");
const mobileMenuClose = document.querySelector(".mobile-menu-close");
const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
const mobileCareerToggle = document.querySelector(".mobile-career-toggle");
const mobileSubmenu = document.querySelector(".mobile-submenu");

function openMobileMenu() {
  document.body.classList.add("mobile-menu-open");
}

function closeMobileMenu() {
  document.body.classList.remove("mobile-menu-open");
}

mobileMenuButton?.addEventListener("click", openMobileMenu);
mobileMenuClose?.addEventListener("click", closeMobileMenu);
mobileMenuOverlay?.addEventListener("click", closeMobileMenu);

mobileCareerToggle?.addEventListener("click", () => {
  mobileSubmenu?.classList.toggle("open");
});

document.querySelectorAll(".mobile-side-menu a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

const revealSections = document.querySelectorAll(".reveal-section");
const revealItems = document.querySelectorAll(".reveal-card, .profile-photo, .profile-info");

function resetSectionItems(section) {
  section.querySelectorAll(".reveal-card, .profile-photo, .profile-info").forEach((item) => {
    item.classList.remove("is-visible", "animate-in");
    item.dataset.animated = "false";
  });
}

function revealItem(item, shouldAnimate) {
  item.classList.add("is-visible");

  if (!shouldAnimate || item.dataset.animated === "true") {
    item.classList.remove("animate-in");
    return;
  }

  item.classList.remove("animate-in");
  void item.offsetWidth;
  item.classList.add("animate-in");
  item.dataset.animated = "true";
}

function isItemInViewport(item) {
  const rect = item.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target;

        if (entry.isIntersecting) {
          section.dataset.sectionVisible = "true";
          section.classList.add("section-visible");

          if (isScrollingDown && section.dataset.revealReady === "true") {
            section.dataset.allowReveal = "true";
            section.dataset.revealReady = "false";
          }

          section.querySelectorAll(".reveal-card, .profile-photo, .profile-info").forEach((item) => {
            if (isItemInViewport(item)) {
              revealItem(item, section.dataset.allowReveal === "true");
            }
          });

          return;
        }

        section.dataset.sectionVisible = "false";
        section.dataset.allowReveal = "false";
        section.classList.remove("section-visible");

        if (entry.boundingClientRect.top > window.innerHeight) {
          section.dataset.revealReady = "true";
          resetSectionItems(section);
        }
      });
    },
    { threshold: 0.01 }
  );

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const item = entry.target;
        const section = item.closest(".reveal-section");
        const canAnimate =
          isScrollingDown &&
          section?.dataset.sectionVisible === "true" &&
          section?.dataset.allowReveal === "true" &&
          item.dataset.animated !== "true";

        revealItem(item, canAnimate);
      });
    },
    { threshold: 0.24 }
  );

  revealSections.forEach((section) => {
    section.dataset.revealReady = "true";
    section.dataset.sectionVisible = "false";
    section.dataset.allowReveal = "false";
    sectionObserver.observe(section);
  });

  revealItems.forEach((item) => {
    item.dataset.animated = "false";
    cardObserver.observe(item);
  });
} else {
  revealSections.forEach((section) => section.classList.add("section-visible"));
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".image-asset").forEach((image) => {
  const holder = image.closest(".media-slot");

  image.addEventListener("load", () => {
    holder?.classList.add("has-image");
  });

  image.addEventListener("error", () => {
    holder?.classList.remove("has-image");
    image.removeAttribute("src");
  });

  if (image.complete && image.naturalWidth > 0) {
    holder?.classList.add("has-image");
  }
});

document.querySelectorAll(".interest-icon, .contact-icon").forEach((image) => {
  image.addEventListener("error", () => {
    image.style.display = "none";
  });

  if (image.complete && image.naturalWidth === 0) {
    image.style.display = "none";
  }
});

document.querySelectorAll(".banner-slide-image").forEach((image) => {
  const slide = image.closest(".banner-slide");

  image.addEventListener("load", () => {
    slide?.classList.add("has-image");
  });

  image.addEventListener("error", () => {
    slide?.classList.remove("has-image");
    image.removeAttribute("src");
  });

  if (image.complete && image.naturalWidth > 0) {
    slide?.classList.add("has-image");
  }
});

const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const viewport = carousel.querySelector(".banner-viewport");
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsWrap = carousel.querySelector("[data-carousel-dots]");
  let currentSlide = 0;
  let slideTimer;

  function markSlideImage(slide) {
    const image = slide.querySelector(".banner-slide-image");

    if (!image) return;

    if (image.complete && image.naturalWidth > 0) {
      slide.classList.add("has-image");
      return;
    }

    image.addEventListener("load", () => slide.classList.add("has-image"), { once: true });
    image.addEventListener("error", () => slide.classList.remove("has-image"), { once: true });
  }

  slides.forEach((slide, index) => {
    slide.dataset.slideIndex = String(index);
  });

  if (track && slides.length > 1) {
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.dataset.clone = "true";
    firstClone.dataset.slideIndex = "0";
    lastClone.dataset.clone = "true";
    lastClone.dataset.slideIndex = String(slides.length - 1);

    track.prepend(lastClone);
    track.append(firstClone);
    markSlideImage(firstClone);
    markSlideImage(lastClone);
  }

  const visualSlides = track ? Array.from(track.querySelectorAll("[data-slide]")) : slides;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `${index + 1}번째 배너 보기`);
    dot.addEventListener("click", () => {
      goToSlide(index, true);
      startAutoSlide();
    });
    dotsWrap?.append(dot);
    return dot;
  });

  function updateSlider() {
    const visualIndex = slides.length > 1 ? currentSlide + 1 : currentSlide;
    const activeSlide = visualSlides[visualIndex];

    if (viewport && activeSlide && track) {
      const slideWidth = activeSlide.offsetWidth;
      const viewportWidth = viewport.offsetWidth;
      const offset = visualIndex * slideWidth - (viewportWidth - slideWidth) / 2;

      track.style.transform = `translateX(${-offset}px)`;
    }

    visualSlides.forEach((slide) => {
      slide.classList.toggle("is-active", Number(slide.dataset.slideIndex) === currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
    });
  }

  function goToSlide(index, userAction = false) {
    currentSlide = (index + slides.length) % slides.length;
    updateSlider();

    if (userAction) {
      const pressedSlide =
        visualSlides.find((slide) => Number(slide.dataset.slideIndex) === currentSlide && slide.dataset.clone !== "true") ||
        visualSlides[currentSlide + 1];

      pressedSlide?.classList.add("is-pressed");
      window.setTimeout(() => pressedSlide?.classList.remove("is-pressed"), 220);
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    slideTimer = window.setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (slideTimer) {
      window.clearInterval(slideTimer);
      slideTimer = undefined;
    }
  }

  prevButton?.addEventListener("click", () => {
    goToSlide(currentSlide - 1, true);
    startAutoSlide();
  });

  nextButton?.addEventListener("click", () => {
    goToSlide(currentSlide + 1, true);
    startAutoSlide();
  });

  carousel.addEventListener("click", (event) => {
    if (event.target.closest(".nextwave-banner-button, .award-banner-button")) {
      event.stopPropagation();
      return;
    }

    const linkSlide = event.target.closest(".banner-slide[data-link]");

    if (linkSlide && carousel.contains(linkSlide) && linkSlide.dataset.link) {
      window.open(linkSlide.dataset.link, "_blank", "noopener,noreferrer");
    }
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    if (event.target.closest(".nextwave-banner-button, .award-banner-button")) {
      event.stopPropagation();
      return;
    }

    const linkSlide = event.target.closest(".banner-slide[data-link]");

    if (linkSlide && carousel.contains(linkSlide) && linkSlide.dataset.link) {
      event.preventDefault();
      window.open(linkSlide.dataset.link, "_blank", "noopener,noreferrer");
    }
  });

  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", startAutoSlide);
  carousel.addEventListener("focusin", stopAutoSlide);
  carousel.addEventListener("focusout", startAutoSlide);
  window.addEventListener("resize", updateSlider);

  carousel.querySelectorAll(".nextwave-banner-button, .award-banner-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  updateSlider();
  startAutoSlide();
}

const journeyList = document.querySelector("[data-journey-list]");
const journeyCards = document.querySelectorAll("[data-journey-card]");
const journeySection = document.querySelector(".journey-section");

function closeJourneyCards() {
  journeyCards.forEach((card) => {
    card.classList.remove("is-active");
    card.setAttribute("aria-expanded", "false");
  });

  journeyList?.classList.remove("has-active");
}

journeyCards.forEach((card) => {
  card.addEventListener("click", () => {
    const wasActive = card.classList.contains("is-active");

    closeJourneyCards();

    if (wasActive) {
      return;
    }

    card.classList.add("is-active");
    card.setAttribute("aria-expanded", "true");
    journeyList?.classList.add("has-active");
  });
});

if (journeySection && "IntersectionObserver" in window) {
  const journeySectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) return;

        const rect = entry.boundingClientRect;

        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          closeJourneyCards();
        }
      });
    },
    { threshold: 0 }
  );

  journeySectionObserver.observe(journeySection);
}
