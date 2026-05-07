const scoreList = document.getElementById("score-list");
const rankingList = document.getElementById("ranking-list");
const winnerBox = document.getElementById("winner-box");
const explanationBox = document.getElementById("explanation-box");
const dssForm = document.getElementById("dss-form");
const selectionGrid = document.getElementById("selection-grid");
const weightSummaryNote = document.getElementById("weight-summary-note");
const selectedPhoneCount = document.getElementById("selected-phone-count");
const liveTotalWeight = document.getElementById("live-total-weight");
const liveBestMatch = document.getElementById("live-best-match");
const resetBalancedWeightsButton = document.getElementById("reset-balanced-weights");
const scoreBarCanvas = document.getElementById("dssScoreBarChart");
const criteriaRadarCanvas = document.getElementById("dssCriteriaRadarChart");

const CRITERIA = [
  { key: "price_score", label: "Price", weightKey: "price_weight", helper: "affordability" },
  { key: "performance_score", label: "Performance", weightKey: "performance_weight", helper: "speed" },
  { key: "camera_score", label: "Camera", weightKey: "camera_weight", helper: "photo quality" },
  { key: "battery_score", label: "Battery", weightKey: "battery_weight", helper: "endurance" },
  { key: "display_score", label: "Display", weightKey: "display_weight", helper: "screen quality" },
  { key: "software_support_score", label: "Software Support", weightKey: "software_support_weight", helper: "updates" },
];

const DEFAULT_WEIGHTS = {
  price_weight: 0.15,
  performance_weight: 0.2,
  camera_weight: 0.2,
  battery_weight: 0.15,
  display_weight: 0.15,
  software_support_weight: 0.15,
};

const WEIGHT_INPUT_IDS = CRITERIA.map((criterion) => criterion.weightKey);
const RESULTS_KEY = "dssResults";
let products = [];
let scoreBarChart = null;
let criteriaRadarChart = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundOne(value) {
  return Number(value.toFixed(1));
}

function hasKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function enrichProducts(rawProducts) {
  if (!Array.isArray(rawProducts) || !rawProducts.length) return [];

  const prices = rawProducts.map((item) => Number(item.price) || 0);
  const years = rawProducts.map((item) => Number(item.year) || 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearRange = Math.max(1, maxYear - minYear);
  const priceRange = Math.max(1, maxPrice - minPrice);

  return rawProducts
    .map((item) => {
      const yearProgress = ((Number(item.year) || minYear) - minYear) / yearRange;
      const price = Number(item.price) || minPrice;
      const model = item.model || "";
      const brand = item.brand || "";
      const priceScore = item.price_score ?? clamp(10 - ((price - minPrice) / priceRange) * 4.8, 5.2, 10);

      let displayScore = 4.9 + yearProgress * 3.9 + (brand === "Samsung" ? 0.25 : 0);
      if (hasKeyword(model, ["plus", "max", "ultra", "note"])) displayScore += 0.35;
      if (hasKeyword(model, ["pro"])) displayScore += 0.2;
      if (hasKeyword(model, ["fold"])) displayScore += 0.45;
      if (hasKeyword(model, ["flip", "fe"])) displayScore += 0.15;
      displayScore = clamp(displayScore, 4.8, 9.9);

      let softwareScore = 5.2 + yearProgress * 3.7 + (brand === "Apple" ? 0.9 : 0.15);
      if (Number(item.year) >= 2023) softwareScore += brand === "Apple" ? 0.15 : 0.1;
      softwareScore = clamp(softwareScore, 5.0, 10);

      return {
        ...item,
        price_score: roundOne(priceScore),
        display_score: roundOne(item.display_score ?? displayScore),
        software_support_score: roundOne(item.software_support_score ?? item.software_score ?? softwareScore),
      };
    })
    .sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.model.localeCompare(b.model);
    });
}

function readWeights() {
  return CRITERIA.reduce((weights, criterion) => {
    weights[criterion.weightKey] = Number(document.getElementById(criterion.weightKey).value);
    return weights;
  }, {});
}

function sumWeights(weights) {
  return CRITERIA.reduce((total, criterion) => total + weights[criterion.weightKey], 0);
}

function normalizeWeights(weights) {
  const total = sumWeights(weights);
  if (!total) return { ...DEFAULT_WEIGHTS };

  return CRITERIA.reduce((normalized, criterion) => {
    normalized[criterion.weightKey] = weights[criterion.weightKey] / total;
    return normalized;
  }, {});
}

function calculateScore(item, weights) {
  return CRITERIA.reduce((score, criterion) => {
    return score + Number(item[criterion.key] || 0) * weights[criterion.weightKey];
  }, 0);
}

function buildContributionLines(item, weights) {
  return CRITERIA.map((criterion) => ({
    label: criterion.label,
    helper: criterion.helper,
    rawScore: Number(item[criterion.key] || 0),
    weightedScore: Number((Number(item[criterion.key] || 0) * weights[criterion.weightKey]).toFixed(2)),
  })).sort((a, b) => b.weightedScore - a.weightedScore);
}

function localCalculate(dataset, weights) {
  const normalizedWeights = normalizeWeights(weights);
  const scores = dataset.map((item) => ({
    ...item,
    score: Number(calculateScore(item, normalizedWeights).toFixed(2)),
    contributions: buildContributionLines(item, normalizedWeights),
  }));

  const ranking = [...scores].sort((a, b) => b.score - a.score);

  return {
    scores,
    ranking,
    winner: ranking[0] || null,
    normalizedWeights,
  };
}

function createExplanation(winner, ranking) {
  if (!winner) {
    return "Choose phones and move the sliders to see a live recommendation.";
  }

  const runnerUp = ranking[1];
  const topFactors = (winner.contributions || []).slice(0, 3);
  const topText = topFactors.length
    ? topFactors.map((item) => item.label.toLowerCase()).join(" and ")
    : "balanced criteria";
  const highlighted = topFactors.length
    ? ` Top contributing factors: ${topFactors
        .map((item) => `${item.label} (${item.weightedScore.toFixed(2)})`)
        .join(", ")}.`
    : "";
  const runnerText = runnerUp ? ` It remains ahead of ${runnerUp.model} in the live weighted ranking.` : "";
  return `${winner.model} wins because ${topText} scores are stronger under your current preferences.${highlighted}${runnerText}`;
}

function saveResults(data) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(data));
}

function updateWeightLabels() {
  const weights = readWeights();
  const total = sumWeights(weights);
  const normalized = normalizeWeights(weights);

  CRITERIA.forEach((criterion) => {
    const valueNode = document.getElementById(`${criterion.weightKey}_value`);
    if (valueNode) {
      valueNode.textContent = weights[criterion.weightKey].toFixed(2);
    }
  });

  if (liveTotalWeight) {
    liveTotalWeight.textContent = total.toFixed(2);
  }

  if (weightSummaryNote) {
    const dominant = [...CRITERIA]
      .sort((a, b) => normalized[b.weightKey] - normalized[a.weightKey])
      .slice(0, 2)
      .map((item) => item.label)
      .join(" + ");
    weightSummaryNote.textContent = `Total weight: ${total.toFixed(2)}. If needed, the system normalizes the weights automatically. Current focus: ${dominant}.`;
  }
}

function renderSelectionCards(dataset) {
  if (!selectionGrid) return;

  const preselectedModels = new Set(dataset.slice(0, 6).map((item) => item.model));

  selectionGrid.innerHTML = dataset
    .map(
      (item) => `
        <label class="selection-card selection-card-detailed">
          <input type="checkbox" name="selected_phone" value="${item.model}" ${preselectedModels.has(item.model) ? "checked" : ""}>
          <img src="${item.image}" alt="${item.model}">
          <div>
            <span>${item.model}</span>
            <small>${item.brand} • ${item.year} • $${item.price}</small>
            <small>Price ${item.price_score} • Perf ${item.performance_score} • Cam ${item.camera_score}</small>
            <small>Battery ${item.battery_score} • Display ${item.display_score} • Support ${item.software_support_score}</small>
          </div>
        </label>
      `
    )
    .join("");
}

function getSelectedDataset() {
  const checked = Array.from(document.querySelectorAll('input[name="selected_phone"]:checked')).map(
    (input) => input.value
  );
  return checked.length ? products.filter((item) => checked.includes(item.model)) : products;
}

function renderScores(scores) {
  if (!scoreList) return;

  scoreList.innerHTML = scores
    .map((item) => {
      const primaryFactor = item.contributions?.[0];
      return `
        <div class="score-row score-row-card">
          <div>
            <span>${item.model}</span>
            <small>${primaryFactor ? `Top factor: ${primaryFactor.label}` : "Weighted score"}</small>
          </div>
          <strong>${item.score.toFixed(2)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderRanking(ranking) {
  if (!rankingList) return;

  rankingList.innerHTML = ranking
    .map((item, index) => {
      const width = Math.max(12, Math.min(100, item.score * 10));
      return `
        <div class="rank-row rank-row-card">
          <div class="rank-copy">
            <span>#${index + 1} ${item.model}</span>
            <small>${item.brand} • ${item.year}</small>
            <div class="rank-meter"><span style="width:${width}%"></span></div>
          </div>
          <strong>${item.score.toFixed(2)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderWinner(winner, ranking) {
  if (!winnerBox) return;

  if (!winner) {
    winnerBox.innerHTML = `
      <div class="winner-card">
        <span class="site-kicker">Live Winner</span>
        <strong>No phones selected</strong>
        <p>Please select phones to generate a ranking.</p>
      </div>
    `;
    return;
  }

  const topFactors = (winner.contributions || [])
    .slice(0, 3)
    .map(
      (item) => `
        <div class="comparison-row">
          <span>${item.label}</span>
          <strong>${item.weightedScore.toFixed(2)}</strong>
        </div>
      `
    )
    .join("");

  winnerBox.innerHTML = `
    <div class="winner-card">
      <span class="site-kicker">Live Winner</span>
      <strong>${winner.model}</strong>
      <p>Final Score: ${winner.score.toFixed(2)}</p>
      <p>${createExplanation(winner, ranking)}</p>
      <div class="result-stack winner-breakdown" style="margin-top: 14px;">
        ${topFactors}
      </div>
    </div>
  `;
}

function renderExplanation(text) {
  if (explanationBox) {
    explanationBox.textContent = text;
  }
}

function renderCharts(result) {
  if (typeof Chart === "undefined") return;

  if (scoreBarCanvas) {
    if (scoreBarChart) {
      scoreBarChart.destroy();
    }

    scoreBarChart = new Chart(scoreBarCanvas, {
      type: "bar",
      data: {
        labels: result.ranking.map((item) => item.model),
        datasets: [
          {
            label: "Total Score",
            data: result.ranking.map((item) => item.score),
            backgroundColor: "rgba(112, 229, 255, 0.82)",
            borderRadius: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#eaf3ff" },
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(214, 227, 245, 0.72)" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          y: {
            min: 0,
            max: 10,
            ticks: { color: "rgba(214, 227, 245, 0.72)" },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });
  }

  if (criteriaRadarCanvas) {
    if (criteriaRadarChart) {
      criteriaRadarChart.destroy();
    }

    const topPhones = result.ranking.slice(0, 2);
    const labels = CRITERIA.map((criterion) => criterion.label);

    criteriaRadarChart = new Chart(criteriaRadarCanvas, {
      type: "radar",
      data: {
        labels,
        datasets: topPhones.map((phone, index) => ({
          label: phone.model,
          data: CRITERIA.map((criterion) => Number(phone[criterion.key] || 0)),
          borderColor: index === 0 ? "rgba(112, 229, 255, 0.95)" : "rgba(174, 121, 255, 0.95)",
          backgroundColor: index === 0 ? "rgba(112, 229, 255, 0.16)" : "rgba(174, 121, 255, 0.14)",
          pointBackgroundColor: index === 0 ? "rgba(112, 229, 255, 1)" : "rgba(174, 121, 255, 1)",
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: "#eaf3ff" },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            angleLines: { color: "rgba(255,255,255,0.08)" },
            grid: { color: "rgba(255,255,255,0.08)" },
            pointLabels: { color: "rgba(214, 227, 245, 0.82)" },
            ticks: {
              color: "rgba(214, 227, 245, 0.65)",
              backdropColor: "transparent",
            },
          },
        },
      },
    });
  }
}

function updateSummary(result, selectedDataset, rawWeights) {
  if (selectedPhoneCount) {
    selectedPhoneCount.textContent = String(selectedDataset.length);
  }

  if (liveBestMatch) {
    liveBestMatch.textContent = result.winner ? result.winner.model : "No selection";
  }

  saveResults({
    ...result,
    explanation: createExplanation(result.winner, result.ranking),
    rawWeights,
    weights: result.normalizedWeights,
    selectedModels: selectedDataset.map((item) => item.model),
    generatedAt: new Date().toISOString(),
  });
}

function recalculateAndRender() {
  const rawWeights = readWeights();
  const selectedDataset = getSelectedDataset();
  const result = localCalculate(selectedDataset, rawWeights);
  const explanation = createExplanation(result.winner, result.ranking);

  renderScores(result.scores);
  renderRanking(result.ranking);
  renderWinner(result.winner, result.ranking);
  renderExplanation(explanation);
  renderCharts(result);
  updateSummary(result, selectedDataset, rawWeights);
}

function attachRealtimeEvents() {
  WEIGHT_INPUT_IDS.forEach((inputId) => {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
      updateWeightLabels();
      recalculateAndRender();
    });
  });

  selectionGrid.addEventListener("change", recalculateAndRender);

  if (resetBalancedWeightsButton) {
    resetBalancedWeightsButton.addEventListener("click", () => {
      Object.entries(DEFAULT_WEIGHTS).forEach(([key, value]) => {
        document.getElementById(key).value = value;
      });
      updateWeightLabels();
      recalculateAndRender();
    });
  }
}

function initialize() {
  products = enrichProducts(
    Array.isArray(window.PHONES_DATA) && window.PHONES_DATA.length
      ? window.PHONES_DATA
      : Array.isArray(window.WEIGHTED_PHONES_DATA)
        ? window.WEIGHTED_PHONES_DATA
        : []
  );
  renderSelectionCards(products);
  updateWeightLabels();
  attachRealtimeEvents();
  recalculateAndRender();
}

if (dssForm) {
  dssForm.addEventListener("submit", (event) => {
    event.preventDefault();
    recalculateAndRender();
  });
  initialize();
}
