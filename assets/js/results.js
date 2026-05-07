const bestPhoneName = document.getElementById("best-phone-name");
const bestPhoneSummary = document.getElementById("best-phone-summary");
const winnerDetails = document.getElementById("winner-details");
const whyItWins = document.getElementById("why-it-wins");
const finalAdvice = document.getElementById("final-advice");
const runnerUpName = document.getElementById("runner-up-name");
const comparisonGrid = document.getElementById("comparison-grid");
const topFactorList = document.getElementById("top-factor-list");

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
}

try {
  const saved = JSON.parse(localStorage.getItem("dssResults"));
  if (saved?.winner) {
    renderResult(saved);
  } else {
    renderFallback();
  }
} catch (error) {
  renderFallback();
}
