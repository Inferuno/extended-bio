// NAV INDICATOR:
const sections = [...document.querySelectorAll("section")];
const links = [...document.querySelectorAll(".nav a")];

// THEME:
const modeBtn = document.querySelector("#mode");

// PROJECT CARD:
const cardPreviewOverlay = document.querySelector("#card-preview-overlay");
const cardPreview = document.querySelector("#card-preview");
const closeBtn = document.querySelector("#card-preview-close");

const credit = document.querySelector("#credit");

// Fixes credit wording if not host project. Removing this line is not allowed.
if (location.hostname !== "inferuno.github.io") {
    credit.textContent = "Original project made by Inferuno"
}

// -------------- Nav Indicator -------------- //
const navIndicator = document.querySelector(".nav-indicator");

// The click handler places the pill, so track must leave it alone until the scroll finishes.
let jumping = false;
let timerId;


/* Moves the pill behind a link.
   offsetWidth is how wide that link is on screen, offsetLeft how far it sits from .nav's left edge.
 */
function syncNav(link) {
    navIndicator.style.width = (link.offsetWidth + 12) + "px"; // `+12`, offset adjustment
    navIndicator.style.transform = `translateX(${link.offsetLeft - 6}px)`; // `-6` offset adjustment
    // Cancels .islands 6px padding so the pill reaches the island's edges.
}
// -------------- Color Shift Tracking -------------- //

let currentSection = "";

// Runs immediately
// So a refresh lands on the right hue instead of the `--h: 20;` (css).
// Note: small flash from css painting before js runs.
const refreshedLink = location.hash;
if (refreshedLink) {
    sections.forEach((s) => {
        if (refreshedLink === "#" + s.id) document.documentElement.style.setProperty("--h", s.dataset.hue);
    })
}

function track() {
    // Color shift happens when the new section's top passes 34% down the screen. 
    // This is based off of the `0.34`, feel free to change it.
    const line = scrollY + innerHeight * 0.34;
    let current = sections[0];

    // Every section above the `line` overwrites `current`, so the last overwrite is the one you're on.
    sections.forEach((s) => {
        if (s.offsetTop <= line) current = s;
    });

    if (currentSection === current.id) return;

    currentSection = current.id;

    // Changes the url to follow the current section
    history.replaceState(null, "", "#" + current.id);

    if (!jumping) {
        // current.id is "projects", the links are href="#projects."
        // The # is added so the two can be compared.
        // The matching link is the one the pill moves to.
        links.forEach((link) => {
            if (link.getAttribute("href") === "#" + current.id) syncNav(link);
        });
    }

    document.documentElement.style.setProperty("--h", current.dataset.hue);
}


addEventListener("scroll", track);
addEventListener("load", track);

setTimeout(() => document.documentElement.classList.add("ready"), 100);


// -------------- Theme -------------- //
const lastMode = localStorage.getItem("mode");
// Restores the saved (dark / light mode) from the last refresh.
if (lastMode) {
    document.documentElement.dataset.mode = lastMode;
    modeBtn.querySelector("span").textContent = lastMode === "light" ? "dark_mode" : "light_mode";
    modeBtn.setAttribute("aria-label", lastMode === "dark" ? "Switch to light mode" : "Switch to dark mode");
}


modeBtn.addEventListener("click", () => {
    // The theme transition sits at 0ms normally so the hover states aren't sluggish. This turns it on for the flip only.
    document.documentElement.classList.add("theming");

    let mode = document.documentElement.dataset.mode;
    if (mode === "dark") {
        mode = "light";
    } else {
        mode = "dark";
    }

    document.documentElement.dataset.mode = mode;
    localStorage.setItem("mode", mode);
    modeBtn.querySelector("span").textContent = mode === "light" ? "dark_mode" : "light_mode";
    modeBtn.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");

    setTimeout(() => document.documentElement.classList.remove("theming"), 520); // This turns the above comment off to make the hover state is 0ms again.
})

// -------------- Nav Click -------------- //

links.forEach((link) => {
    link.addEventListener("click", () => {
        jumping = true;
        syncNav(link);
        clearTimeout(timerId); // Fast clicking would start multiple timers (at uneven timings, creates visual jumping), so this line prevents that.
        timerId = setTimeout(() => jumping = false, 700);
    });
});



// -------------- Project Card (Preview) -------------- //
export function openCardPreview(card) {
    const openBtn = document.querySelector("#card-preview-open");
    if (card.dataset.url) {
        openBtn.href = card.dataset.url;
        openBtn.textContent = card.dataset.label;
        openBtn.hidden = false;
    } else {
        openBtn.hidden = true;
    }

    cardPreview.querySelector(".card-thumbnail").style.backgroundImage = card.querySelector(".card-thumbnail").style.backgroundImage;
    document.querySelector("#card-preview-title").textContent = card.querySelector("h3").textContent;
    document.querySelector("#card-preview-stack").textContent = card.querySelector(".stack").textContent;
    document.querySelector("#card-preview-blurb").textContent = card.querySelector(".blurb").textContent;

    cardPreview.removeAttribute("hidden");
    cardPreviewOverlay.removeAttribute("hidden");
    document.body.classList.add("is-locked");

    requestAnimationFrame(() => {
        cardPreview.classList.add("on");
        cardPreviewOverlay.classList.add("on");
    })
}

function closeCardPreview() {
    cardPreview.classList.remove("on");
    cardPreviewOverlay.classList.remove("on");
    document.body.classList.remove("is-locked");

    setTimeout(() => {
        cardPreview.setAttribute("hidden", "");
        cardPreviewOverlay.setAttribute("hidden", "");
    }, 520);
}

closeBtn.addEventListener("click", closeCardPreview);
cardPreviewOverlay.addEventListener("click", closeCardPreview);
addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCardPreview();
})