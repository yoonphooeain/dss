const scoreList = document.getElementById("score-list");
const rankingList = document.getElementById("ranking-list");
const winnerBox = document.getElementById("winner-box");
const dssForm = document.getElementById("dss-form");
const firstModelSelect = document.getElementById("phone_model_1");
const secondModelSelect = document.getElementById("phone_model_2");
let products = [];

function populateModelSelects(dataset) {
  if (!firstModelSelect || !secondModelSelect) return;

  const options = dataset
    .map((item) => `<option value="${item.model}">${item.model}</option>`)
    .join("");

  firstModelSelect.innerHTML = options;
  secondModelSelect.innerHTML = options;

  if (dataset[0]) firstModelSelect.value = dataset[0].model;
  if (dataset[1]) secondModelSelect.value = dataset[1].model;
}

async function loadProducts() {
  try {
    const response = await fetch("/products");

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    products = await response.json();
    populateModelSelects(products);
  } catch (error) {
    winnerBox.innerHTML = `
      <div class="winner-badge" style="color: var(--danger);">
        <span>Error</span>
        <strong>${error.message}</strong>
      </div>
    `;
  }
}

function renderScores(scores) {
  scoreList.innerHTML = "";
  scores.forEach((item) => {
    const row = document.createElement("div");
    row.className = "score-item";
    row.innerHTML = `<span>${item.model}</span><strong>${item.score.toFixed(2)}</strong>`;
    scoreList.appendChild(row);
  });
}

function renderRanking(ranking) {
  rankingList.innerHTML = "";
  ranking.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "ranking-item";
    row.innerHTML = `<span>#${index + 1} ${item.model}</span><strong>${item.score.toFixed(2)}</strong>`;
    rankingList.appendChild(row);
  });
}

function renderWinner(winner) {
  winnerBox.innerHTML = `
    <div class="winner-badge">
      <span>Winner Result</span>
      <strong>${winner.model} • ${winner.score.toFixed(2)}</strong>
    </div>
  `;
}

async function handleSubmit(event) {
  event.preventDefault();

  const selectedModels = [firstModelSelect?.value, secondModelSelect?.value];
  const selectedDataset = products.filter((item) => selectedModels.includes(item.model));

  const payload = {
    dataset: selectedDataset.length ? selectedDataset : products,
    price_weight: Number(document.getElementById("price_weight").value),
    camera_weight: Number(document.getElementById("camera_weight").value),
    battery_weight: Number(document.getElementById("battery_weight").value),
    performance_weight: Number(document.getElementById("performance_weight").value),
  };

  try {
    const response = await fetch("/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Unable to calculate DSS ranking.");
    }

    const data = await response.json();
    renderScores(data.scores);
    renderRanking(data.ranking);
    renderWinner(data.winner);
  } catch (error) {
    winnerBox.innerHTML = `
      <div class="winner-badge" style="color: var(--danger);">
        <span>Error</span>
        <strong>${error.message}</strong>
      </div>
    `;
  }
}

if (dssForm) {
  loadProducts();
  dssForm.addEventListener("submit", handleSubmit);
}
