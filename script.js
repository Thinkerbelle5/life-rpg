let player = {
    diamonds: 0,

    intelligence: {
        level: 1,
        xp: 0
    },

    compassion: {
        level: 1,
        xp: 0
    },

    courage: {
        level: 1,
        xp: 0
    },

    quests: []
};


// -------------------------
// LEVEL SYSTEM
// -------------------------

function xpRequired(level) {

    return Math.floor(
        50 * Math.pow(1.35, level - 1)
    );

}


// -------------------------
// SAVE GAME
// -------------------------

function saveGame() {

    localStorage.setItem(
        "lifeRPG",
        JSON.stringify(player)
    );

}


// -------------------------
// LOAD GAME
// -------------------------

function loadGame() {

    const savedGame = localStorage.getItem("lifeRPG");

    if (savedGame) {

        player = JSON.parse(savedGame);

    }

}


// -------------------------
// ADD XP
// -------------------------

function addXP(stat, amount) {

    player[stat].xp += amount;

    while (
        player[stat].xp >= xpRequired(player[stat].level)
    ) {

        player[stat].xp -= xpRequired(player[stat].level);

        player[stat].level++;

        const diamondReward =
            10 + (player[stat].level * 5);

        player.diamonds += diamondReward;

        alert(
            `✨ LEVEL UP! ✨\n\n` +
            `${stat.toUpperCase()} is now Level ${player[stat].level}!\n\n` +
            `You earned ${diamondReward} 💎`
        );

    }

}


// -------------------------
// UPDATE SCREEN
// -------------------------

function updateDisplay() {

    document.getElementById("diamondCount").textContent =
        player.diamonds;


    updateStat(
        "intelligence",
        "intelligenceLevel",
        "intelligenceXP",
        "intelligenceRequired",
        "intelligenceBar"
    );

    updateStat(
        "compassion",
        "compassionLevel",
        "compassionXP",
        "compassionRequired",
        "compassionBar"
    );

    updateStat(
        "courage",
        "courageLevel",
        "courageXP",
        "courageRequired",
        "courageBar"
    );


    renderQuests();

}


function updateStat(
    stat,
    levelID,
    xpID,
    requiredID,
    barID
) {

    const level = player[stat].level;

    const xp = player[stat].xp;

    const required = xpRequired(level);


    document.getElementById(levelID).textContent =
        level;

    document.getElementById(xpID).textContent =
        xp;

    document.getElementById(requiredID).textContent =
        required;


    const percentage =
        Math.min((xp / required) * 100, 100);

    document.getElementById(barID).style.width =
        percentage + "%";

}


// -------------------------
// QUEST CREATOR
// -------------------------

function openQuestCreator() {

    document
        .getElementById("questModal")
        .classList.remove("hidden");

}


function closeQuestCreator() {

    document
        .getElementById("questModal")
        .classList.add("hidden");

}


// -------------------------
// ADD QUEST STEP
// -------------------------

function addStep() {

    const container =
        document.getElementById("stepInputs");

    const number =
        container.children.length + 1;


    const step =
        document.createElement("div");

    step.className = "step-input";


    step.innerHTML = `
        <span>${number}.</span>

        <input
            type="text"
            placeholder="What do you need to do?"
        >
    `;


    container.appendChild(step);

}


// -------------------------
// CREATE QUEST
// -------------------------

function createQuest() {

    const name =
        document.getElementById("questName").value.trim();

    const description =
        document.getElementById("questDescription").value.trim();


    if (!name) {

        alert("Give your quest a name first!");

        return;

    }


    const steps =
        Array.from(
            document.querySelectorAll(
                "#stepInputs input"
            )
        )
        .map(input => input.value.trim())
        .filter(step => step !== "");


    if (steps.length === 0) {

        alert("Add at least one quest step!");

        return;

    }


    const quest = {

        id: Date.now(),

        name: name,

        description: description,

        rewards: {

            intelligence:
                Number(
                    document.getElementById(
                        "intelligenceReward"
                    ).value
                ),

            compassion:
                Number(
                    document.getElementById(
                        "compassionReward"
                    ).value
                ),

            courage:
                Number(
                    document.getElementById(
                        "courageReward"
                    ).value
                ),

            diamonds:
                Number(
                    document.getElementById(
                        "diamondReward"
                    ).value
                )

        },

        steps: steps.map(step => ({

            text: step,

            completed: false

        })),

        completed: false

    };


    player.quests.push(quest);


    saveGame();

    updateDisplay();

    closeQuestCreator();

    resetQuestCreator();

}


// -------------------------
// RESET QUEST CREATOR
// -------------------------

function resetQuestCreator() {

    document.getElementById("questName").value = "";

    document.getElementById("questDescription").value = "";

    document.getElementById("intelligenceReward").value = 0;

    document.getElementById("compassionReward").value = 0;

    document.getElementById("courageReward").value = 0;

    document.getElementById("diamondReward").value = 10;


    document.getElementById("stepInputs").innerHTML = `

        <div class="step-input">

            <span>1.</span>

            <input
                type="text"
                placeholder="What do you need to do?"
            >

        </div>

    `;

}


// -------------------------
// RENDER QUESTS
// -------------------------

function renderQuests() {

    const container =
        document.getElementById("questList");


    if (player.quests.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">🗺️</div>

                <h3>Your adventure awaits.</h3>

                <p>
                    Create your first quest to get started.
                </p>

                <button
                    onclick="openQuestCreator()"
                    class="primary-button"
                >
                    Create Your First Quest
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    player.quests.forEach(quest => {

        const card =
            document.createElement("div");

        card.className = "quest-card";


        const completedSteps =
            quest.steps.filter(
                step => step.completed
            ).length;


        const percentage =
            Math.round(
                (completedSteps /
                quest.steps.length) * 100
            );


        const stepsHTML =
            quest.steps.map(
                (step, index) => `

                <label
                    class="quest-step ${
                        step.completed
                            ? "completed"
                            : ""
                    }"
                >

                    <input
                        type="checkbox"
                        ${
                            step.completed
                                ? "checked"
                                : ""
                        }
                        onchange="
                            toggleStep(
                                ${quest.id},
                                ${index}
                            )
                        "
                    >

                    <span>
                        ${step.text}
                    </span>

                </label>

            `
            ).join("");


        card.innerHTML = `

            <h3>📜 ${quest.name}</h3>

            <p class="quest-description">
                ${quest.description}
            </p>

            <p>
                <strong>
                    ${completedSteps}/${quest.steps.length}
                    steps completed
                </strong>
                · ${percentage}%
            </p>

            ${stepsHTML}

            <div class="quest-rewards">

                ${
                    quest.rewards.intelligence > 0
                    ? `🧠 +${quest.rewards.intelligence} XP`
                    : ""
                }

                ${
                    quest.rewards.compassion > 0
                    ? `💗 +${quest.rewards.compassion} XP`
                    : ""
                }

                ${
                    quest.rewards.courage > 0
                    ? `🛡️ +${quest.rewards.courage} XP`
                    : ""
                }

                ${
                    quest.rewards.diamonds > 0
                    ? `💎 +${quest.rewards.diamonds}`
                    : ""
                }

            </div>


            ${
                percentage === 100 && !quest.completed

                ? `

                    <button
                        class="primary-button quest-complete"
                        onclick="
                            completeQuest(${quest.id})
                        "
                    >
                        ✨ Complete Quest
                    </button>

                `

                : ""
            }

        `;


        container.appendChild(card);

    });

}


// -------------------------
// TOGGLE STEP
// -------------------------

function toggleStep(questID, stepIndex) {

    const quest =
        player.quests.find(
            q => q.id === questID
        );


    if (!quest) return;


    quest.steps[stepIndex].completed =
        !quest.steps[stepIndex].completed;


    saveGame();

    updateDisplay();

}


// -------------------------
// COMPLETE QUEST
// -------------------------

function completeQuest(questID) {

    const quest =
        player.quests.find(
            q => q.id === questID
        );


    if (!quest || quest.completed) return;


    quest.completed = true;


    addXP(
        "intelligence",
        quest.rewards.intelligence
    );

    addXP(
        "compassion",
        quest.rewards.compassion
    );

    addXP(
        "courage",
        quest.rewards.courage
    );


    player.diamonds +=
        quest.rewards.diamonds;


    alert(
        `✨ QUEST COMPLETE! ✨\n\n` +
        `${quest.name}\n\n` +
        `You earned ${quest.rewards.diamonds} 💎`
    );


    saveGame();

    updateDisplay();

}


// -------------------------
// START GAME
// -------------------------

loadGame();

updateDisplay();
