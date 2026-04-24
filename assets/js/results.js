const bestPhoneName = document.getElementById("best-phone-name");
const bestPhoneSummary = document.getElementById("best-phone-summary");
const winnerDetails = document.getElementById("winner-details");
const whyItWins = document.getElementById("why-it-wins");
const finalAdvice = document.getElementById("final-advice");
const runnerUpName = document.getElementById("runner-up-name");
const comparisonGrid = document.getElementById("comparison-grid");

function createAdvice(winner, runnerUp) {
  if (!winner) {
    return "Run the DSS evaluation first to generate a personalized recommendation.";
  }

  if (winner.price <= 900) {
    return `${winner.model} is a strong choice if you want high value without moving too far into flagship pricing.`;
  }

  return `${winner.model} is the better pick if you want a premium option with stronger overall capability. Consider ${runnerUp?.model || "the runner-up"} if you want to compare value before deciding.`;
}

function renderFallback() {
  const fallbackWinner = {
    model: "iPhone 15 Pro",
    score: 94.8,
    brand: "Apple",
  };
  const fallbackRunnerUp = {
    model: "Galaxy S24 Ultra",
    score: 92.5,
  };

  renderResult({
    winner: fallbackWinner,
    ranking: [fallbackWinner, fallbackRunnerUp],
    explanation: `${fallbackWinner.model} leads because it combines strong performance, camera quality, and solid battery results.`,
  });
}

function renderResult(data) {
  const winner = data.winner;
  const runnerUp = data.ranking?.[1];

  bestPhoneName.textContent = winner.model;
  bestPhoneSummary.textContent = `${winner.model} is currently the highest-ranked phone in the DSS calculation.`;
  winnerDetails.innerHTML = `
    <div><strong>Score</strong><br><span class="hint-text">${winner.score.toFixed(2)}</span></div>
    <div><strong>Brand</strong><br><span class="hint-text">${winner.brand || "Phone Model"}</span></div>
  `;
  whyItWins.textContent = data.explanation;
  finalAdvice.textContent = createAdvice(winner, runnerUp);

  if (runnerUp) {
    runnerUpName.textContent = runnerUp.model;
    comparisonGrid.innerHTML = `
      <div class="comparison-row"><span>Winner Score</span><strong>${winner.score.toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Runner-up Score</span><strong>${runnerUp.score.toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Gap</span><strong>${(winner.score - runnerUp.score).toFixed(2)}</strong></div>
      <div class="comparison-row"><span>Decision Focus</span><strong>Balanced overall quality</strong></div>
    `;
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
