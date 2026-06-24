const bestPhoneName = document.getElementById("best-phone-name");
const bestPhoneSummary = document.getElementById("best-phone-summary");
const winnerDetails = document.getElementById("winner-details");
const whyItWins = document.getElementById("why-it-wins");
const finalAdvice = document.getElementById("final-advice");
const runnerUpName = document.getElementById("runner-up-name");
const comparisonGrid = document.getElementById("comparison-grid");
const topFactorList = document.getElementById("top-factor-list");
const saveResultButton = document.getElementById("save-result-btn");
const saveResultStatus = document.getElementById("save-result-status");
const savedComparisonList = document.getElementById("saved-comparison-list");
const saveResultNameInput = document.getElementById("save-result-name");
const RESULTS_KEY = "dssResults";
const SAVED_COMPARISONS_KEY = "phonedssSavedComparisons";

let currentResult = null;

function formatFactorLabel(label) {
  return label || "Overall score";
}

function getTopFactors(winner) {
  return (winner?.contributions || []).slice(0, 3);
}

function buildWhyItWins(winner, runnerUp, weights) {
  if (!winner) {
    return "Run the DSS evaluation first to generate a dynamic explanation.";
  }

  const topFactors = getTopFactors(winner);
  const factorNames = topFactors.map((item) => item.label.toLowerCase());
  const leadText = factorNames.length
    ? `${factorNames.slice(0, 2).join(" and ")}`
    : "its weighted criteria";

  const dominantWeights = Object.entries(weights || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key.replace("_weight", "").replace(/_/g, " "));

  const preferenceText = dominantWeights.length
    ? ` based on your preference for ${dominantWeights.join(" and ")}`
    : " based on your selected weights";

  const runnerText = runnerUp
    ? ` It stays ahead of ${runnerUp.model} by ${Math.abs(winner.score - runnerUp.score).toFixed(2)} points.`
    : "";

  return `${winner.model} wins because ${leadText} contribute most strongly${preferenceText}.${runnerText}`;
}

function createAdvice(winner, runnerUp) {
  if (!winner) {
    return "Run the DSS evaluation first to generate a personalized recommendation.";
  }

  const topFactors = getTopFactors(winner).map((item) => item.label.toLowerCase());
  if (topFactors.length >= 2) {
    return `${winner.model} is the strongest choice when you care most about ${topFactors[0]} and ${topFactors[1]}. Consider ${runnerUp?.model || "the runner-up"} if you want a closer alternative.`;
  }

  return `${winner.model} is the better pick if you want the highest overall weighted score.`;
}

function renderFallback() {
  currentResult = null;
  if (saveResultNameInput) {
    saveResultNameInput.value = "";
  }
  bestPhoneName.textContent = "No result yet";
  bestPhoneSummary.textContent = "Run DSS Evaluation first to generate a real recommendation.";
  winnerDetails.innerHTML = `
    <div><strong>Score</strong><br><span class="hint-text">Waiting</span></div>
    <div><strong>Brand</strong><br><span class="hint-text">Waiting</span></div>
  `;
  whyItWins.textContent = "Run the DSS evaluation first to generate a dynamic explanation.";
  finalAdvice.textContent = "Open DSS Evaluation, select phones, set your weights, and then return to this page.";
  runnerUpName.textContent = "Waiting for DSS result";
  comparisonGrid.innerHTML = `
    <div class="comparison-row"><span>Winner Score</span><strong>Waiting</strong></div>
    <div class="comparison-row"><span>Runner-up Score</span><strong>Waiting</strong></div>
  `;
  topFactorList.innerHTML = `<div class="comparison-row"><span>Top Factor</span><strong>Waiting</strong></div>`;
  renderSavedComparisons();
}

function renderTopFactors(winner) {
  if (!topFactorList) return;

  const factors = getTopFactors(winner);
  topFactorList.innerHTML = factors.length
    ? factors
        .map(
          (factor) => `
            <div class="comparison-row">
              <span>${formatFactorLabel(factor.label)}</span>
              <strong>${factor.weightedScore.toFixed(2)}</strong>
            </div>
          `
        )
        .join("")
    : `<div class="comparison-row"><span>Top Factor</span><strong>Waiting for result</strong></div>`;
}

function renderResult(data) {
  currentResult = data;
  const winner = data.winner;
  const runnerUp = data.ranking?.[1];
  const explanation = data.explanation || buildWhyItWins(winner, runnerUp, data.weights);

  bestPhoneName.textContent = winner.model;
  bestPhoneSummary.textContent = `${winner.model} is currently the highest-ranked phone in the DSS calculation.`;
  winnerDetails.innerHTML = `
    <div><strong>Score</strong><br><span class="hint-text">${winner.score.toFixed(2)}</span></div>
    <div><strong>Brand</strong><br><span class="hint-text">${winner.brand || "Phone Model"}</span></div>
  `;
  whyItWins.textContent = explanation;
  finalAdvice.textContent = createAdvice(winner, runnerUp);
  renderTopFactors(winner);

  if (runnerUp) {
    const topWinnerFactor = getTopFactors(winner)[0];
    comparisonGrid.innerHTML = `
      <div class="comparison-row"><span>Winner Score</span><strong>${winner.score.toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Runner-up Score</span><strong>${runnerUp.score.toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Gap</span><strong>${(winner.score - runnerUp.score).toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Top Contributing Factor</span><strong>${topWinnerFactor ? topWinnerFactor.label : "Balanced"}</strong></div>
    `;
    runnerUpName.textContent = runnerUp.model;
  }

  if (saveResultNameInput) {
    saveResultNameInput.value = data.savedName || "";
  }

  renderSavedComparisons();
}

function getSavedComparisons() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_COMPARISONS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setSavedComparisons(items) {
  localStorage.setItem(SAVED_COMPARISONS_KEY, JSON.stringify(items));
}

function formatSavedTimestamp(value) {
  if (!value) return "Saved result";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved result";
  return date.toLocaleString();
}

function createSavedComparisonEntry(data) {
  return {
    id: data.generatedAt || `${Date.now()}`,
    savedName: data.savedName || "",
    savedAt: new Date().toISOString(),
    winner: data.winner,
    ranking: data.ranking,
    explanation: data.explanation,
    weights: data.weights || data.normalizedWeights || {},
    rawWeights: data.rawWeights || {},
    selectedModels: data.selectedModels || [],
    generatedAt: data.generatedAt || new Date().toISOString(),
  };
}

function updateSaveStatus(text) {
  if (saveResultStatus) {
    saveResultStatus.textContent = text;
  }
}

function saveCurrentResult() {
  if (!currentResult?.winner) {
    updateSaveStatus("Run DSS Evaluation first before saving a comparison.");
    return;
  }

  const savedComparisons = getSavedComparisons();
  const resultId = currentResult.generatedAt || currentResult.winner.model;
  const existingIndex = savedComparisons.findIndex((item) => item.id === resultId);
  const customName = saveResultNameInput?.value.trim() || "";
  const entry = createSavedComparisonEntry({
    ...currentResult,
    savedName: customName,
  });

  if (existingIndex >= 0) {
    savedComparisons[existingIndex] = entry;
    updateSaveStatus("This comparison was already saved. The saved copy has been refreshed.");
  } else {
    savedComparisons.unshift(entry);
    updateSaveStatus("Current comparison saved successfully.");
  }

  setSavedComparisons(savedComparisons.slice(0, 10));
  renderSavedComparisons();
}

function loadSavedComparison(id) {
  const savedComparisons = getSavedComparisons();
  const selected = savedComparisons.find((item) => item.id === id);
  if (!selected) return;

  const liveResult = {
    winner: selected.winner,
    ranking: selected.ranking,
    explanation: selected.explanation,
    weights: selected.weights,
    rawWeights: selected.rawWeights,
    selectedModels: selected.selectedModels,
    generatedAt: selected.generatedAt,
    savedName: selected.savedName || "",
  };
  localStorage.setItem(RESULTS_KEY, JSON.stringify(liveResult));
  renderResult(liveResult);
  updateSaveStatus("Saved comparison loaded into the current result view.");
}

function deleteSavedComparison(id) {
  const savedComparisons = getSavedComparisons().filter((item) => item.id !== id);
  setSavedComparisons(savedComparisons);
  renderSavedComparisons();
  updateSaveStatus("Saved comparison removed.");
}

function renderSavedComparisons() {
  if (!savedComparisonList) return;

  const savedComparisons = getSavedComparisons();
  if (!savedComparisons.length) {
    savedComparisonList.innerHTML = `<div class="comparison-row"><span>History</span><strong>Nothing saved yet</strong></div>`;
    return;
  }

  savedComparisonList.innerHTML = savedComparisons
    .map((item) => {
      const displayName = item.savedName || item.winner?.model || "Saved result";
      const winnerScore = item.winner?.score != null ? Number(item.winner.score).toFixed(2) : "0.00";
      const savedTime = formatSavedTimestamp(item.savedAt);
      return `
        <div class="comparison-row">
          <span>${displayName}<br><small class="hint-text">${savedTime}</small></span>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <strong>${winnerScore}</strong>
            <button class="site-link-btn subtle saved-result-action" type="button" data-load-id="${item.id}">Load</button>
            <button class="site-link-btn subtle saved-result-action" type="button" data-delete-id="${item.id}">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

try {
  const saved = JSON.parse(localStorage.getItem(RESULTS_KEY));
  if (saved?.winner) {
    renderResult(saved);
  } else {
    renderFallback();
  }
} catch (error) {
  renderFallback();
}

saveResultButton?.addEventListener("click", saveCurrentResult);

savedComparisonList?.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (loadButton) {
    loadSavedComparison(loadButton.dataset.loadId);
  }

  if (deleteButton) {
    deleteSavedComparison(deleteButton.dataset.deleteId);
  }
});
