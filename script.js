/* ================================= */
/* LIFE RPG - MAIN GAME CODE */
/* ================================= */


/* ================================= */
/* DATA */
/* ================================= */

const defaultGame = {
    diamonds: 10,

    stats: {
        organisation: {
            level: 1,
            xp: 0
        },

        wellbeing: {
            level: 1,
            xp: 0
        },

        intelligence: {
            level: 1,
            xp: 0
        },

        development: {
            level: 1,
            xp: 0
        }
    },

    mainQuests: [],
    sideQuests: [],

    inventory: []
};


let game = loadGame();

let currentQuestType = "main";

let stepCount = 0;


/* ================================= */
/* SHOP ITEMS */
/* ================================= */

const shopItems = [

    {
        id: "cat",
        name: "Cosy Cat",
        icon: "🐈",
        price: 250,
        description: "A tiny companion for your adventures."
    },

    {
        id: "rabbit",
        name: "Little Rabbit",
        icon: "🐇",
        price: 350,
        description: "A fluffy little adventure buddy."
    },

    {
        id: "puppy",
        name: "Adventure Puppy",
        icon: "🐕",
        price: 500,
        description: "Ready for every quest."
    },

    {
        id: "flowers",
        name: "Flower Bouquet",
        icon: "💐",
        price: 75,
        description: "A little reward for yourself."
    },

    {
        id: "plant",
        name: "Little Plant",
        icon: "🪴",
        price: 100,
        description: "Add some greenery to your room."
    },

    {
        id: "bookshelf",
        name: "Bookshelf",
        icon: "📚",
        price: 300,
        description: "For your growing collection."
    },

    {
        id: "hoodie",
        name: "Cosy Hoodie",
        icon: "🧥",
        price: 200,
        description: "Comfort +10."
    },

    {
        id: "sneakers",
        name: "Adventure Sneakers",
        icon: "👟",
        price: 175,
        description: "For your next adventure."
    },

    {
        id: "journal",
        name: "Beautiful Journal",
        icon: "📔",
        price: 150,
        description: "For thoughts, plans and memories."
    }

];


/* ================================= */
/* LOAD / SAVE */
/* ================================= */

function loadGame() {

    const saved = localStorage.getItem("lifeRPG");

    if (!saved) {
        return structuredClone(defaultGame);
    }

    try {

        const old = JSON.parse(saved);

        return {
            ...structuredClone(defaultGame),
            ...old,
            stats: {
                ...structuredClone(defaultGame.stats),
                ...(old.stats || {})
            },
            mainQuests: old.mainQuests || [],
            sideQuests: old.sideQuests || [],
            inventory: old.inventory || []
        };

    } catch (error) {

        console.error("Could not load saved game:", error);

        return structuredClone(defaultGame);
    }
}


function saveGame() {
    localStorage.setItem("lifeRPG", JSON.stringify(game));
}


/* ================================= */
/* XP SYSTEM */
/* ================================= */

function xpRequired(level) {

    return Math.floor(
        50 * Math.pow(1.35, level - 1)
    );

}


function addXP(category, amount) {

    if (!amount || amount <= 0) {
        return;
    }

    const stat = game.stats[category];

    if (!stat) {
        return;
    }

    stat.xp += Number(amount);

    while (stat.xp >= xpRequired(stat.level)) {

        stat.xp -= xpRequired(stat.level);

        stat.level++;

        const diamondReward = 10 + stat.level * 5;

        game.diamonds += diamondReward;

        alert(
            `✨ LEVEL UP!\n\n${formatCategory(category)} reached Level ${stat.level}!\n\n💎 +${diamondReward} diamonds`
        );
    }

}


/* ================================= */
/* CATEGORY NAMES */
/* ================================= */

function formatCategory(category) {

    const names = {
        organisation: "Organisation",
        wellbeing: "Wellbeing",
        intelligence: "Intelligence",
        development: "Personal Development"
    };

    return names[category] || category;
}


/* ================================= */
/* TABS */
/* ================================= */

function showTab(tabId, button) {

    document.querySelectorAll(".tab-section").forEach(section => {
        section.classList.remove("active-tab");
    });

    document.querySelectorAll(".nav-button").forEach(btn => {
        btn.classList.remove("active");
    });

    const selectedTab = document.getElementById(tabId);

    if (selectedTab) {
        selectedTab.classList.add("active-tab");
    }

    if (button) {
        button.classList.add("active");
    }

    renderAll();
}


/* ================================= */
/* QUEST CREATOR */
/* ================================= */

function openQuestCreator(type = "main") {

    currentQuestType = type;

    const modal = document.getElementById("questModal");

    const title = document.getElementById("modalTitle");

    if (type === "side") {
        title.textContent = "Create Side Quest";
    } else {
        title.textContent = "Create Quest";
    }

    document.getElementById("questForm").reset();

    document.getElementById("diamondReward").value = 10;

    document.getElementById("stepInputs").innerHTML = "";

    stepCount = 0;

    addStep();

    modal.classList.add("open");

    document.body.style.overflow = "hidden";

}


function closeQuestCreator() {

    document.getElementById("questModal").classList.remove("open");

    document.body.style.overflow = "";

}


/* ================================= */
/* ADD QUEST STEP */
/* ================================= */

function addStep() {

    stepCount++;

    const container = document.getElementById("stepInputs");

    const row = document.createElement("div");

    row.className = "step-row";

    row.innerHTML = `

        <span class="step-number">
            ${stepCount}.
        </span>

        <input
            type="text"
            class="step-input"
            placeholder="What do you need to do?"
            required
        >

        <button
            type="button"
            class="remove-step"
            onclick="removeStep(this)"
            title="Remove step"
        >
            ×
        </button>

    `;

    container.appendChild(row);

}


/* ================================= */
/* REMOVE STEP */
/* ================================= */

function removeStep(button) {

    const row = button.parentElement;

    row.remove();

    renumberSteps();

}


function renumberSteps() {

    const rows = document.querySelectorAll(".step-row");

    rows.forEach((row, index) => {

        row.querySelector(".step-number").textContent =
            `${index + 1}.`;

    });

    stepCount = rows.length;

}


/* ================================= */
/* CREATE QUEST */
/* ================================= */

function createQuest(event) {

    event.preventDefault();

    const name =
        document.getElementById("questName").value.trim();

    const description =
        document.getElementById("questDescription").value.trim();

    const organisation =
        Number(document.getElementById("organisationReward").value) || 0;

    const wellbeing =
        Number(document.getElementById("wellbeingReward").value) || 0;

    const intelligence =
        Number(document.getElementById("intelligenceReward").value) || 0;

    const development =
        Number(document.getElementById("developmentReward").value) || 0;

    const diamonds =
        Number(document.getElementById("diamondReward").value) || 0;


    const steps = Array.from(
        document.querySelectorAll(".step-input")
    )
    .map(input => input.value.trim())
    .filter(value => value !== "");


    if (!name) {

        alert("Please give your quest a name!");

        return;
    }


    if (steps.length === 0) {

        alert("Please add at least one quest step!");

        return;
    }


    const quest = {

        id: Date.now(),

        name: name,

        description: description,

        rewards: {

            organisation: organisation,

            wellbeing: wellbeing,

            intelligence: intelligence,

            development: development,

            diamonds: diamonds

        },

        steps: steps.map(text => ({
            text: text,
            completed: false
        })),

        completed: false

    };


    if (currentQuestType === "side") {

        game.sideQuests.push(quest);

    } else {

        game.mainQuests.push(quest);

    }


    saveGame();

    closeQuestCreator();

    renderAll();

}


/* ================================= */
/* COMPLETE QUEST STEP */
/* ================================= */

function toggleStep(questId, type, stepIndex) {

    const quests =
        type === "side"
            ? game.sideQuests
            : game.mainQuests;


    const quest = quests.find(q => q.id === questId);

    if (!quest) {
        return;
    }


    quest.steps[stepIndex].completed =
        !quest.steps[stepIndex].completed;


    const allComplete =
        quest.steps.every(step => step.completed);


    if (allComplete && !quest.completed) {

        completeQuest(quest, type);

        return;
    }


    saveGame();

    renderAll();

}


/* ================================= */
/* COMPLETE QUEST */
/* ================================= */

function completeQuest(quest, type) {

    quest.completed = true;


    addXP(
        "organisation",
        quest.rewards.organisation
    );

    addXP(
        "wellbeing",
        quest.rewards.wellbeing
    );

    addXP(
        "intelligence",
        quest.rewards.intelligence
    );

    addXP(
        "development",
        quest.rewards.development
    );


    game.diamonds +=
        Number(quest.rewards.diamonds) || 0;


    let bonusMessage = "";


    /* SIDE QUEST BONUS */

    if (type === "side") {

        const randomItem =
            shopItems[
                Math.floor(
                    Math.random() * shopItems.length
                )
            ];

        game.inventory.push(randomItem.id);

        bonusMessage =
            `\n🎁 Bonus item: ${randomItem.icon} ${randomItem.name}`;
    }


    saveGame();

    renderAll();


    alert(
        `✨ QUEST COMPLETE!\n\n${quest.name}\n\n` +
        `💎 +${quest.rewards.diamonds} diamonds` +
        bonusMessage
    );


    /* REMOVE COMPLETED QUEST */

    setTimeout(() => {

        const quests =
            type === "side"
                ? game.sideQuests
                : game.mainQuests;


        const index =
            quests.findIndex(q => q.id === quest.id);


        if (index !== -1) {

            quests.splice(index, 1);

            saveGame();

            renderAll();

        }

    }, 100);

}


/* ================================= */
/* RENDER STATS */
/* ================================= */

function renderStats() {

    const categories = [
        "organisation",
        "wellbeing",
        "intelligence",
        "development"
    ];


    categories.forEach(category => {

        const stat = game.stats[category];

        const required =
            xpRequired(stat.level);


        const percentage =
            Math.min(
                100,
                (stat.xp / required) * 100
            );


        document.getElementById(
            `${category}Level`
        ).textContent =
            `Lv. ${stat.level}`;


        document.getElementById(
            `${category}XP`
        ).textContent =
            `${stat.xp} / ${required} XP`;


        document.getElementById(
            `${category}Bar`
        ).style.width =
            `${percentage}%`;

    });


    document.getElementById(
        "diamondCount"
    ).textContent =
        game.diamonds;


    document.getElementById(
        "shopDiamondCount"
    ).textContent =
        game.diamonds;

}


/* ================================= */
/* RENDER QUESTS */
/* ================================= */

function renderQuestList(type) {

    const quests =
        type === "side"
            ? game.sideQuests
            : game.mainQuests;


    const container =
        document.getElementById(
            type === "side"
                ? "sideQuestList"
                : "mainQuestList"
        );


    container.innerHTML = "";


    if (quests.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ${type === "side" ? "✨" : "📜"}
                </div>

                <h3>
                    No active ${type === "side" ? "side quests" : "main quests"}
                </h3>

                <p>
                    Your next adventure is waiting for you.
                </p>

            </div>

        `;

        return;
    }


    quests.forEach(quest => {

        const card =
            document.createElement("div");

        card.className = "quest-card";


        const rewardText = [];

        if (quest.rewards.organisation > 0)
            rewardText.push(`🧹 +${quest.rewards.organisation}`);

        if (quest.rewards.wellbeing > 0)
            rewardText.push(`🌿 +${quest.rewards.wellbeing}`);

        if (quest.rewards.intelligence > 0)
            rewardText.push(`🧠 +${quest.rewards.intelligence}`);

        if (quest.rewards.development > 0)
            rewardText.push(`✨ +${quest.rewards.development}`);

        if (quest.rewards.diamonds > 0)
            rewardText.push(`💎 +${quest.rewards.diamonds}`);


        card.innerHTML = `

            <div class="quest-header">

                <div>

                    <h3>${escapeHTML(quest.name)}</h3>

                    <p class="quest-description">
                        ${escapeHTML(
                            quest.description ||
                            "Complete the steps below."
                        )}
                    </p>

                </div>

                <div class="quest-reward">
                    ${rewardText.join(" · ")}
                </div>

            </div>


            <div class="quest-steps">

                ${quest.steps.map((step, index) => `

                    <label class="
                        quest-step
                        ${step.completed ? "completed" : ""}
                    ">

                        <input
                            type="checkbox"
                            ${step.completed ? "checked" : ""}
                            onchange="
                                toggleStep(
                                    ${quest.id},
                                    '${type}',
                                    ${index}
                                )
                            "
                        >

                        <span>
                            ${escapeHTML(step.text)}
                        </span>

                    </label>

                `).join("")}

            </div>

        `;


        container.appendChild(card);

    });

}


/* ================================= */
/* SHOP */
/* ================================= */

function renderShop() {

    const container =
        document.getElementById("shopGrid");


    container.innerHTML = "";


    shopItems.forEach(item => {

        const owned =
            game.inventory.includes(item.id);


        const canAfford =
            game.diamonds >= item.price;


        const card =
            document.createElement("div");

        card.className = "shop-item";


        card.innerHTML = `

            <div class="shop-icon">
                ${item.icon}
            </div>

            <h3>
                ${item.name}
            </h3>

            <p>
                ${item.description}
            </p>

            <div class="price">
                💎 ${item.price}
            </div>

            <button
                class="buy-button"
                onclick="buyItem('${item.id}')"
                ${(!canAfford || owned) ? "disabled" : ""}
            >

                ${
                    owned
                        ? "✓ Owned"
                        : canAfford
                            ? "Buy"
                            : "Not enough diamonds"
                }

            </button>

        `;


        container.appendChild(card);

    });

}


/* ================================= */
/* BUY SHOP ITEM */
/* ================================= */

function buyItem(itemId) {

    const item =
        shopItems.find(
            item => item.id === itemId
        );


    if (!item) {
        return;
    }


    if (game.inventory.includes(item.id)) {

        alert("You already own this item!");

        return;
    }


    if (game.diamonds < item.price) {

        alert("You don't have enough diamonds yet!");

        return;
    }


    game.diamonds -= item.price;

    game.inventory.push(item.id);


    saveGame();

    renderAll();


    alert(
        `🎉 Purchased!\n\n${item.icon} ${item.name}`
    );

}


/* ================================= */
/* INVENTORY */
/* ================================= */

function renderInventory() {

    const container =
        document.getElementById(
            "inventoryGrid"
        );


    container.innerHTML = "";


    if (game.inventory.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🎒
                </div>

                <h3>
                    Your inventory is empty
                </h3>

                <p>
                    Complete side quests or visit the shop to collect items.
                </p>

            </div>

        `;

        return;
    }


    game.inventory.forEach(itemId => {

        const item =
            shopItems.find(
                item => item.id === itemId
            );


        if (!item) {
            return;
        }


        const card =
            document.createElement("div");

        card.className =
            "inventory-item";


        card.innerHTML = `

            <div class="inventory-icon">
                ${item.icon}
            </div>

            <h3>
                ${item.name}
            </h3>

            <p>
                ${item.description}
            </p>

        `;


        container.appendChild(card);

    });

}


/* ================================= */
/* ESCAPE HTML */
/* ================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ================================= */
/* RENDER EVERYTHING */
/* ================================= */

function renderAll() {

    renderStats();

    renderQuestList("main");

    renderQuestList("side");

    renderShop();

    renderInventory();

}


/* ================================= */
/* CLOSE MODAL WHEN CLICKING OUTSIDE */
/* ================================= */

document
    .getElementById("questModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeQuestCreator();

        }

    });


/* ================================= */
/* FORM SUBMISSION */
/* ================================= */

document
    .getElementById("questForm")
    .addEventListener("submit", createQuest);


/* ================================= */
/* INITIAL LOAD */
/* ================================= */

renderAll();
