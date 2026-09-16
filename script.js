// NAV PILL:
const sections = [...document.querySelectorAll("section")];
const links = [...document.querySelectorAll(".nav a")];

// THEME:
const modeBtn = document.querySelector("#mode");

// PROJECT CARD:
const cards = [...document.querySelectorAll(".card")];
const scrim = document.querySelector("#scrim");
const sheet = document.querySelector("#sheet");
const closeBtn = document.querySelector("#s-close");

// BOARD:
const wuwaWidget = document.querySelector("#widget-wuwa");
const statsBox = wuwaWidget.querySelector(".stats");
const notesBox = wuwaWidget.querySelector(".notes");
const profileBox = wuwaWidget.querySelector(".profile");

// -------------- Nav Pill -------------- //
const thumb = document.querySelector(".nav-thumb");

// The click handler places the pill, so track must leave it alone until the scroll finishes.
let jumping = false;
let timerId;


/* Moves the pill behind a link.
   offsetWidth is how wide that link is on screen, offsetLeft how far it sits from .nav's left edge.
 */
function syncNav(link) {
    thumb.style.width = (link.offsetWidth + 12) + "px"; // `+12`, offset adjustment
    thumb.style.transform = `translateX(${link.offsetLeft - 6}px)`; // `-6` offset adjustment
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
    // This is based off of the `0.34​`, feel free to change it.
    const line = scrollY + innerHeight * 0.34;
    let current = sections[0];

    // Every section above the `line` overwrites `current`, so the last overwrite is the one you're on.
    sections.forEach((s) => {
        if (s.offsetTop <= line) current = s;
    });

    // Prevents `setProperty` from running every scroll event. (which would reset the hue transition constantly.)
    if (currentSection === current.id) return;

    // Sets the current section if every other check passes.
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
    // Changes the hue to the new current section (and runs the transition)
    document.documentElement.style.setProperty("--h", current.dataset.hue);
}


addEventListener("scroll", track);
addEventListener("load", track);

setTimeout(() => document.documentElement.classList.add("ready"), 100);


// -------------- Theme -------------- //
const lastMode = localStorage.getItem("mode");
// Restores the saved (dark / light mode) from the last refresh.
if (lastMode) { // If getItem returns null, the below lines would break the code (if prevents this)
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



// -------------- Project Card -------------- //
function openSheet(card) {
    const openBtn = document.querySelector("#s-open");
    if (card.dataset.url) {
        openBtn.href = card.dataset.url;
        openBtn.textContent = card.dataset.label;
        openBtn.hidden = false;
    } else {
        openBtn.hidden = true;
    }

    document.querySelector("#s-title").textContent = card.querySelector("h3").textContent;
    document.querySelector("#s-meta").textContent = card.querySelector(".sub").textContent;
    document.querySelector("#s-blurb").textContent = card.querySelector(".blurb").textContent;

    sheet.removeAttribute("hidden");
    scrim.removeAttribute("hidden");
    document.body.classList.add("is-locked");

    requestAnimationFrame(() => {
        sheet.classList.add("on");
        scrim.classList.add("on");
    })
}

function closeSheet() {
    sheet.classList.remove("on");
    scrim.classList.remove("on");
    document.body.classList.remove("is-locked");

    setTimeout(() => {
        sheet.setAttribute("hidden", "");
        scrim.setAttribute("hidden", "");
    }, 520);
}

cards.forEach((card) => {
    card.addEventListener("click", () => openSheet(card));
});

closeBtn.addEventListener("click", closeSheet);
scrim.addEventListener("click", closeSheet);
addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
})


// -------------- Board -------------- //

fetch("assets/data/board/wuwa.json")
    .then(r => r.json())
    .then(data => {
        wuwaWidget.querySelector("h3").textContent = data.title;
        statsBox.textContent = "";
        notesBox.textContent = "";
        profileBox.textContent = "";

        data.stats.forEach(stat => {
            const statEl = document.createElement("div");
            statEl.className = "stat";

            const value = document.createElement("div");
            value.className = "stat-value";
            value.textContent = stat.value;

            const label = document.createElement("div");
            label.className = "stat-label";
            label.textContent = stat.label;

            statEl.appendChild(value);
            statEl.appendChild(label);
            statsBox.appendChild(statEl);
        });

        data.notes.forEach(note => {
            const noteEl = document.createElement("div");
            noteEl.className = "note";
            noteEl.textContent = note;

            notesBox.appendChild(noteEl);
        });
        data.profile.forEach(detail => {
            const detailEl = document.createElement("div");
            detailEl.className = "detail";

            const label = document.createElement("div");
            label.className = "detail-label";
            label.textContent = detail.label + ":";

            const value = document.createElement("div");
            value.className = "detail-value";
            value.textContent = detail.value;

            detailEl.appendChild(label);
            detailEl.appendChild(value);
            profileBox.appendChild(detailEl);
        })
    });