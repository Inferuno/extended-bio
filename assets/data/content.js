import { openCardPreview } from "../../script.js";

// CONTENT FETCHES:
const wuwaWidget = document.querySelector("#widget-wuwa");
const statsBox = wuwaWidget.querySelector(".stats");
const notesBox = wuwaWidget.querySelector(".notes");
const profileBox = wuwaWidget.querySelector(".profile");

const linksWidget = document.querySelector("#widget-links");
const linksBox = linksWidget.querySelector(".links");

const steamWidget = document.querySelector("#widget-steam");
const achievementsBox = steamWidget.querySelector(".achievements");
const wishlistBox = steamWidget.querySelector(".wishlist");

const projectsBox = document.querySelector(".grid");

const identityBox = document.querySelector(".identity");
const identityName = identityBox.querySelector("h1");
const identityHandle = identityBox.querySelector(".handle");
const identityBio = identityBox.querySelector(".bio");

// -------------- Content Fetches -------------- //

fetch("assets/data/board/wuwa.json")
    .then(r => r.json())
    .then(data => {
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


fetch("assets/data/board/links.json")
    .then(r => r.json())
    .then(data => {
        data.forEach(link => {
            const row = document.createElement("a");
            row.className = "link";
            row.href = link.url;
            row.target = "_blank";

            const icon = document.createElement("img");
            icon.className = "link-icon";
            icon.src = link.icon;
            icon.alt = "";

            const name = document.createElement("span");
            name.className = "link-name";
            name.textContent = link.name;

            const handle = document.createElement("span");
            handle.className = "link-handle";
            handle.textContent = link.handle;

            const arrow = document.createElement("span")
            arrow.className = "material-symbols-rounded"
            arrow.textContent = "arrow_outward"

            row.appendChild(icon);
            row.appendChild(name);
            row.appendChild(handle);
            row.appendChild(arrow);
            linksBox.appendChild(row);
        });
    });

fetch("https://blue-water-5c1b.infernokingyt.workers.dev/")
    .then(r => r.json())
    .then(data => {
        wishlistBox.textContent = "";
        achievementsBox.textContent = "";

        const number = document.createElement("div");
        number.className = "wishlist-amount";
        number.textContent = data.wishlist.items;

        const game = data.wishlist.game;

        const title = document.createElement("div");
        title.className = "wishlist-game-title";
        title.textContent = game.title;


        const priceRow = document.createElement("div");
        priceRow.className = "wishlist-game-price-row";

        const price = document.createElement("span");
        price.className = "wishlist-game-price";
        if (game.price) {
            price.textContent = "$" + game.price.toFixed(2);
        } else {
            price.textContent = "Game Unreleased";
        }

        const sale = document.createElement("span");
        sale.className = "wishlist-game-sale";
        if (game.saleAmount) sale.textContent = "-" + game.saleAmount + "%";

        const image = document.createElement("div");
        image.className = "wishlist-game-image";
        if (game.imageUrl) image.style.backgroundImage = `url(${game.imageUrl})`;

        const onSale = document.createElement("div");
        onSale.className = "wishlist-on-sale";
        onSale.textContent = data.wishlist.itemsOnSale + " games on sale";

        const ratingRow = document.createElement("div");
        ratingRow.className = "wishlist-rating";

        const ratingEmpty = document.createElement("div");
        ratingEmpty.className = "stars-empty";
        if (game.rating) ratingEmpty.textContent = "★★★★★";

        const ratingFull = document.createElement("div");
        ratingFull.className = "stars-full";
        if (game.rating) ratingFull.textContent = "★★★★★";
        ratingFull.style.width = game.rating * 20 + "%";

        wishlistBox.appendChild(number);
        wishlistBox.appendChild(image);
        ratingRow.appendChild(ratingEmpty);
        ratingRow.appendChild(ratingFull);
        wishlistBox.appendChild(title);
        priceRow.appendChild(sale);
        priceRow.appendChild(price);
        priceRow.appendChild(ratingRow);
        wishlistBox.appendChild(priceRow);
        wishlistBox.appendChild(onSale);

        data.achievements.forEach((achievement, index) => {
            if (achievement.rarity > 100) return;
            if (achievement.rarity <= 0) return;

            const achievementRow = document.createElement("div");
            achievementRow.className = "achievement";

            const image = document.createElement("span");
            image.className = "achievement-img";
            if (achievement.imageUrl) image.style.backgroundImage = `url(${achievement.imageUrl})`;

            const name = document.createElement("span");
            name.className = "achievement-name";
            name.textContent = achievement.name;

            const rarity = document.createElement("span");
            rarity.className = "achievement-rarity";
            rarity.textContent = achievement.rarity + "%";


            if (index === 0 && achievement.rarity <= 5) {
                achievementRow.classList.add("rare");
            }

            achievementRow.appendChild(image);
            achievementRow.appendChild(name);
            achievementRow.appendChild(rarity);
            achievementsBox.appendChild(achievementRow);

        });
    });

fetch("assets/data/projects/projects.json")
    .then(r => r.json())
    .then(data => {
        projectsBox.textContent = "";
        data.forEach(project => {
            const card = document.createElement("button");
            card.className = "card";
            card.dataset.label = project.linkLabel;
            card.dataset.url = project.linkUrl;
            card.type = "button";

            const thumbnail = document.createElement("span");
            thumbnail.className = "card-thumbnail";
            if (project.cardThumbnail) thumbnail.style.backgroundImage = `url(${project.cardThumbnail})`;

            const title = document.createElement("h3");
            title.textContent = project.title;

            const stack = document.createElement("div");
            stack.className = "stack";
            stack.textContent = project.stack;

            const blurb = document.createElement("p");
            blurb.className = "blurb";
            blurb.textContent = project.blurb;

            card.appendChild(thumbnail);
            card.appendChild(title);
            card.appendChild(stack);
            card.appendChild(blurb);
            projectsBox.appendChild(card);

            card.addEventListener("click", () => openCardPreview(card));
        });
    });

fetch("assets/data/identity/profile.json")
    .then(r => r.json())
    .then(data => {
        identityName.textContent = data.name;
        identityHandle.textContent = data.handle;
        identityBio.textContent = data.bio;
    });