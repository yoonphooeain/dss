const scoreList = document.getElementById("score-list");
const rankingList = document.getElementById("ranking-list");
const winnerBox = document.getElementById("winner-box");
const explanationBox = document.getElementById("explanation-box");
const dssForm = document.getElementById("dss-form");
const selectionGrid = document.getElementById("selection-grid");

const API_BASE =
  window.location.protocol === "file:"
    ? "http://127.0.0.1:5000"
    : `${window.location.protocol}//${window.location.hostname}:5000`;

let products = Array.isArray(window.PHONES_DATA) ? window.PHONES_DATA : [];

function calculateScore(item, weights) {
  return (
    item.price * weights.price_weight +
    item.camera_score * weights.camera_weight +
    item.battery_score * weights.battery_weight +
    item.performance_score * weights.performance_weight
  );
}

function localCalculate(dataset, weights) {
  const scores = dataset.map((item) => ({
    ...item,
    score: calculateScore(item, weights),
  }));

  const ranking = [...scores].sort((a, b) => b.score - a.score);

  return {
    scores,
    ranking,
    winner: ranking[0],
  };
}

function createExplanation(winner, ranking) {
  if (!winner) {
    return "The system will explain why the winner ranks higher after calculation.";
  }

  const runnerUp = ranking[1];
  const strengths = [];

  if (winner.camera_score >= 8.5) strengths.push("strong camera quality");
  if (winner.battery_score >= 8.5) strengths.push("solid battery life");
  if (winner.performance_score >= 8.5) strengths.push("high performance");
  if (winner.price <= 900) strengths.push("reasonable price range");

  const strengthText = strengths.length ? strengths.join(", ") : "a balanced overall profile";
  const runnerUpText = runnerUp
    ? ` It stays ahead of ${runnerUp.model} in the final utility score.`
    : "";

  return `${winner.model} ranks first because it offers ${strengthText}.${runnerUpText}`;
}

function saveResults(data) {
  localStorage.setItem("dssResults", JSON.stringify(data));
}

function renderSelectionCards(dataset) {
  if (!selectionGrid) return;

  selectionGrid.innerHTML = dataset
    .map(
      (item, index) => `
        <label class="selection-card">
          <input type="checkbox" name="selected_phone" value="${item.model}" ${index < 4 ? "checked" : ""}>
          <div>
            <span>${item.model}</span>
            <small>${item.brand} • ${item.year}</small>
          </div>
        </label>
      `
    )
    .join("");
}

async function loadProducts() {
  if (products.length) {
    renderSelectionCards(products);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/products`);

    if (!response.ok) {
      throw new Error("Unable to load products.");
    }

    products = await response.json();
    renderSelectionCards(products);
  } catch (error) {
    if (winnerBox) {
      winnerBox.innerHTML = `
        <div class="winner-card">
          <span class="site-kicker">Error</span>
          <strong>${error.message}</strong>
          <p>Make sure the Flask API is running on port 5000.</p>
        </div>
      `;
    }
  }
}

function renderScores(scores) {
  if (!scoreList) return;

  scoreList.innerHTML = scores
    .map(
      (item) => `
        <div class="score-row">
          <span>${item.model}</span>
          <strong>${item.score.toFixed(2)}</strong>
        </div>
      `
    )
    .join("");
}

function renderRanking(ranking) {
  if (!rankingList) return;

  rankingList.innerHTML = ranking
    .map(
      (item, index) => `
        <div class="rank-row">
          <span>#${index + 1} ${item.model}</span>
          <strong>${item.score.toFixed(2)}</strong>
        </div>
      `
    )
    .join("");
}

function renderWinner(winner, ranking) {
  if (!winnerBox) return;

  winnerBox.innerHTML = `
    <div class="winner-card">
      <span class="site-kicker">Winner Result</span>
      <strong>${winner.model}</strong>
      <p>Final Score: ${winner.score.toFixed(2)}</p>
      <p>${createExplanation(winner, ranking)}</p>
    </div>
  `;
}

function renderExplanation(text) {
  if (explanationBox) {
    explanationBox.textContent = text;
  }
}

function getSelectedDataset() {
  const checked = Array.from(document.querySelectorAll('input[name="selected_phone"]:checked')).map(
    (input) => input.value
  );

  return checked.length ? products.filter((item) => checked.includes(item.model)) : products;
}

async function requestApiCalculation(payload) {
  const response = await fetch(`${API_BASE}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to calculate DSS ranking.");
  }

  return response.json();
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    dataset: getSelectedDataset(),
    price_weight: Number(document.getElementById("price_weight").value),
    camera_weight: Number(document.getElementById("camera_weight").value),
    battery_weight: Number(document.getElementById("battery_weight").value),
    performance_weight: Number(document.getElementById("performance_weight").value),
  };

  try {
    let data;

    try {
      data = await requestApiCalculation(payload);
    } catch (error) {
      data = localCalculate(payload.dataset, payload);
    }

    const explanation = createExplanation(data.winner, data.ranking);
    const resultPayload = {
      ...data,
      explanation,
      weights: {
        price_weight: payload.price_weight,
        camera_weight: payload.camera_weight,
        battery_weight: payload.battery_weight,
        performance_weight: payload.performance_weight,
      },
      selectedModels: payload.dataset.map((item) => item.model),
      generatedAt: new Date().toISOString(),
    };

    renderScores(data.scores);
    renderRanking(data.ranking);
    renderWinner(data.winner, data.ranking);
    renderExplanation(explanation);
    saveResults(resultPayload);
  } catch (error) {
    if (winnerBox) {
      winnerBox.innerHTML = `
        <div class="winner-card">
          <span class="site-kicker">Error</span>
          <strong>${error.message}</strong>
          <p>Please review your inputs and try again.</p>
        </div>
      `;
    }
  }
}

if (dssForm) {
  loadProducts();
  dssForm.addEventListener("submit", handleSubmit);
}
