const chartText = "#eaf3ff";
const chartMuted = "rgba(214, 227, 245, 0.72)";
const chartGrid = "rgba(255, 255, 255, 0.08)";
const RESULTS_KEY = "dssResults";

const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartText,
        boxWidth: 12,
        usePointStyle: true,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: chartMuted },
      grid: { color: chartGrid },
    },
    y: {
      ticks: { color: chartMuted },
      grid: { color: chartGrid },
    },
  },
};

const criteriaLabelMap = {
  price_weight: "Price",
  performance_weight: "Performance",
  camera_weight: "Camera",
  battery_weight: "Battery",
  display_weight: "Display",
  software_support_weight: "Software Support",
};

let analyticsCharts = [];

function createDashboardChart() {
  const dashboardCanvas = document.getElementById("dashboardChart");
  if (!dashboardCanvas) return;

  new Chart(dashboardCanvas, {
    type: "line",
    data: {
      labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
      datasets: [
        {
          label: "Evaluation Activity",
          data: [40, 58, 66, 79, 90, 108, 126],
          borderColor: "#7ef1ff",
          backgroundColor: "rgba(126, 241, 255, 0.16)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    },
    options: commonChartOptions,
  });
}

function readDssResults() {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY)) || null;
  } catch {
    return null;
  }
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function formatDateTime(value) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";
  return parsed.toLocaleString();
}

function destroyAnalyticsCharts() {
  analyticsCharts.forEach((chart) => chart?.destroy());
  analyticsCharts = [];
}

function buildAnalyticsPayload() {
  const stored = readDssResults();

  if (!stored?.scores?.length) {
    return null;
  }

  const scores = stored.scores;
  const brandLabels = ["Apple", "Samsung"];
  const averageByBrand = brandLabels.map((brand) =>
    Number(average(scores.filter((item) => item.brand === brand).map((item) => item.score)).toFixed(2))
  );

  const years = [...new Set(scores.map((item) => item.year))].sort((a, b) => a - b);
  const buildYearSeries = (brand) =>
    years.map((year) =>
      Number(
        average(scores.filter((item) => item.brand === brand && item.year === year).map((item) => item.score)).toFixed(2)
      )
    );

  const ranking = stored.ranking || [];
  const total = ranking.length || 1;
  const topCut = Math.max(1, Math.ceil(total / 3));
  const midCut = Math.max(topCut + 1, Math.ceil((total * 2) / 3));
  const distribution = [
    ranking.slice(0, topCut).length,
    ranking.slice(topCut, midCut).length,
    ranking.slice(midCut).length,
  ];

  const weights = stored.weights || {};
  const topBrandIndex = averageByBrand[0] >= averageByBrand[1] ? 0 : 1;
  const topBrand = brandLabels[topBrandIndex];
  const runnerBrand = brandLabels[topBrandIndex === 0 ? 1 : 0];
  const winnerEntry = stored.winner || ranking[0] || null;
  const runnerUpEntry = ranking[1] || null;
  const winner = winnerEntry?.model || "Latest winner";
  const weightSummary = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => criteriaLabelMap[key] || key.replace("_weight", "").replace(/^\w/, (char) => char.toUpperCase()));

  const topContributions = (winnerEntry?.contributions || []).slice(0, 4);
  const runnerGap =
    winnerEntry && runnerUpEntry ? Number((winnerEntry.score - runnerUpEntry.score).toFixed(2)) : 0;

  return {
    brandLabels,
    averageByBrand,
    years: years.map(String),
    iphoneTrend: buildYearSeries("Apple"),
    samsungTrend: buildYearSeries("Samsung"),
    distribution,
    topBrand,
    runnerBrand,
    winner,
    winnerEntry,
    runnerUpEntry,
    runnerGap,
    selectedCount: stored.selectedModels?.length || ranking.length,
    weightSummary,
    topContributions,
    generatedAt: stored.generatedAt,
  };
}

function updateAnalyticsText(payload) {
  const liveNote = document.getElementById("analytics-live-note");
  const summaryTitle = document.getElementById("analytics-summary-title");
  const summaryCopy = document.getElementById("analytics-summary-copy");
  const liveStateTitle = document.getElementById("analytics-live-state-title");
  const liveStateCopy = document.getElementById("analytics-live-state-copy");
  const metricWinner = document.getElementById("analytics-metric-winner");
  const metricWinnerCopy = document.getElementById("analytics-metric-winner-copy");
  const metricGap = document.getElementById("analytics-metric-gap");
  const metricGapCopy = document.getElementById("analytics-metric-gap-copy");
  const metricFocus = document.getElementById("analytics-metric-focus");
  const metricFocusCopy = document.getElementById("analytics-metric-focus-copy");
  const insightOneTitle = document.getElementById("analytics-insight-one-title");
  const insightOneCopy = document.getElementById("analytics-insight-one-copy");
  const insightTwoTitle = document.getElementById("analytics-insight-two-title");
  const insightTwoCopy = document.getElementById("analytics-insight-two-copy");
  const insightThreeTitle = document.getElementById("analytics-insight-three-title");
  const insightThreeCopy = document.getElementById("analytics-insight-three-copy");
  const brandCopy = document.getElementById("analytics-brand-copy");
  const trendCopy = document.getElementById("analytics-trend-copy");
  const distributionCopy = document.getElementById("analytics-distribution-copy");
  const radarCopy = document.getElementById("analytics-radar-copy");
  const factorCopy = document.getElementById("analytics-factor-copy");

  if (!payload) {
    if (liveNote) {
      liveNote.textContent = "Run DSS Evaluation first to update these charts with your latest weights and ranking.";
    }
    if (summaryTitle) {
      summaryTitle.textContent = "Live DSS Insight Board";
    }
    if (summaryCopy) {
      summaryCopy.textContent = "Clean visuals turn raw weighted scores into a thesis-ready explanation.";
    }
    if (liveStateTitle) {
      liveStateTitle.textContent = "Waiting for DSS Result";
    }
    if (liveStateCopy) {
      liveStateCopy.textContent = "Open DSS Evaluation, choose phones, adjust the sliders, and return here for live charts.";
    }
    if (metricWinner) {
      metricWinner.textContent = "Waiting";
    }
    if (metricWinnerCopy) {
      metricWinnerCopy.textContent = "No live recommendation yet.";
    }
    if (metricGap) {
      metricGap.textContent = "0.00";
    }
    if (metricGapCopy) {
      metricGapCopy.textContent = "The score gap appears after a DSS run.";
    }
    if (metricFocus) {
      metricFocus.textContent = "Balanced";
    }
    if (metricFocusCopy) {
      metricFocusCopy.textContent = "Top user weights will appear here.";
    }
    if (insightOneTitle) {
      insightOneTitle.textContent = "Apple";
    }
    if (insightOneCopy) {
      insightOneCopy.textContent = "Run the DSS to see which brand is stronger under your current weighted preferences.";
    }
    if (insightTwoTitle) {
      insightTwoTitle.textContent = "Samsung";
    }
    if (insightTwoCopy) {
      insightTwoCopy.textContent = "The runner-up insight appears after the system compares the latest top alternatives.";
    }
    if (insightThreeTitle) {
      insightThreeTitle.textContent = "Latest Run";
    }
    if (insightThreeCopy) {
      insightThreeCopy.textContent = "Charts support recommendation, but the final choice should still follow user preference weights.";
    }
    if (brandCopy) {
      brandCopy.textContent = "Average weighted score by brand from the latest DSS calculation.";
    }
    if (trendCopy) {
      trendCopy.textContent = "Weighted score trend across selected model years for Apple and Samsung.";
    }
    if (distributionCopy) {
      distributionCopy.textContent = "Ranking split of top, middle, and lower scored phones.";
    }
    if (radarCopy) {
      radarCopy.textContent = "Criterion-level comparison of the strongest two phones in the latest run.";
    }
    if (factorCopy) {
      factorCopy.textContent = "Weighted contribution of the winning phone's most influential criteria.";
    }
    return;
  }

  const weightText = payload.weightSummary.length ? payload.weightSummary.join(", ") : "your selected criteria";
  const focusLabel = payload.weightSummary.length ? payload.weightSummary.slice(0, 2).join(" + ") : "Balanced";
  const topContribution = payload.topContributions[0];

  if (liveNote) {
    liveNote.textContent = `Live analytics updated from your latest DSS result. Main weights: ${weightText}.`;
  }

  if (summaryTitle) {
    summaryTitle.textContent = `Live result for ${payload.winner}`;
  }

  if (summaryCopy) {
    summaryCopy.textContent = `These charts now reflect your latest DSS weights and ranking instead of fixed sample values.`;
  }

  if (liveStateTitle) {
    liveStateTitle.textContent = "Latest DSS Run Captured";
  }

  if (liveStateCopy) {
    liveStateCopy.textContent = `Last updated: ${formatDateTime(payload.generatedAt)}. Selected phones: ${payload.selectedCount}.`;
  }

  if (metricWinner) {
    metricWinner.textContent = payload.winner;
  }

  if (metricWinnerCopy) {
    metricWinnerCopy.textContent = `Current top recommendation with score ${payload.winnerEntry?.score?.toFixed(2) || "0.00"}.`;
  }

  if (metricGap) {
    metricGap.textContent = payload.runnerGap.toFixed(2);
  }

  if (metricGapCopy) {
    metricGapCopy.textContent = payload.runnerUpEntry
      ? `${payload.winner} leads ${payload.runnerUpEntry.model} by ${payload.runnerGap.toFixed(2)} points.`
      : "A second candidate will appear when at least two phones are selected.";
  }

  if (metricFocus) {
    metricFocus.textContent = focusLabel;
  }

  if (metricFocusCopy) {
    metricFocusCopy.textContent = `Most influential user weights in the latest calculation: ${weightText}.`;
  }

  if (insightOneTitle) {
    insightOneTitle.textContent = payload.topBrand;
  }

  if (insightOneCopy) {
    insightOneCopy.textContent = `${payload.topBrand} currently has the stronger average score in your latest evaluation result.`;
  }

  if (insightTwoTitle) {
    insightTwoTitle.textContent = payload.runnerBrand;
  }

  if (insightTwoCopy) {
    insightTwoCopy.textContent = `${payload.runnerBrand} remains competitive and can become stronger when your weights shift toward its better criteria.`;
  }

  if (insightThreeTitle) {
    insightThreeTitle.textContent = "Latest Winner";
  }

  if (insightThreeCopy) {
    insightThreeCopy.textContent = topContribution
      ? `${payload.winner} wins mainly because ${topContribution.label.toLowerCase()} contributes the most under your latest weights.`
      : `${payload.winner} is the current top recommendation based on your most recent DSS calculation.`;
  }

  if (brandCopy) {
    brandCopy.textContent = `Average weighted score by brand across ${payload.selectedCount} selected phones.`;
  }

  if (trendCopy) {
    trendCopy.textContent = "Weighted score trend by model year for the currently selected Apple and Samsung devices.";
  }

  if (distributionCopy) {
    distributionCopy.textContent = "Current ranking split into top, middle, and lower-scored groups from the latest run.";
  }

  if (radarCopy) {
    radarCopy.textContent = payload.runnerUpEntry
      ? `${payload.winner} and ${payload.runnerUpEntry.model} are compared across all six DSS criteria.`
      : `Select at least two phones to compare the winner with a runner-up.`;
  }

  if (factorCopy) {
    factorCopy.textContent = topContribution
      ? `The winner is mainly driven by ${payload.topContributions.map((item) => item.label).join(", ")}.`
      : "Weighted contribution of the winning phone's most influential criteria.";
  }
}

function createAnalyticsCharts() {
  const barCanvas = document.getElementById("brandBarChart");
  const lineCanvas = document.getElementById("trendLineChart");
  const pieCanvas = document.getElementById("distributionPieChart");
  const radarCanvas = document.getElementById("winnerRadarChart");
  const factorCanvas = document.getElementById("factorBarChart");
  const livePayload = buildAnalyticsPayload();

  updateAnalyticsText(livePayload);
  destroyAnalyticsCharts();

  if (barCanvas) {
    analyticsCharts.push(new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: livePayload?.brandLabels || ["Apple", "Samsung"],
        datasets: [
          {
            label: "Average Score",
            data: livePayload?.averageByBrand || [89, 86],
            backgroundColor: ["rgba(126, 241, 255, 0.88)", "rgba(191, 140, 255, 0.82)"],
            borderRadius: 16,
          },
        ],
      },
      options: commonChartOptions,
    }));
  }

  if (lineCanvas) {
    analyticsCharts.push(new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: livePayload?.years || ["2010", "2013", "2016", "2019", "2022", "2025"],
        datasets: [
          {
            label: "iPhone Trend",
            data: livePayload?.iphoneTrend || [52, 61, 70, 79, 87, 93],
            borderColor: "#7ef1ff",
            backgroundColor: "rgba(126, 241, 255, 0.12)",
            fill: true,
            tension: 0.35,
          },
          {
            label: "Samsung Trend",
            data: livePayload?.samsungTrend || [48, 58, 67, 75, 83, 90],
            borderColor: "#bf8cff",
            backgroundColor: "rgba(191, 140, 255, 0.12)",
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: commonChartOptions,
    }));
  }

  if (pieCanvas) {
    analyticsCharts.push(new Chart(pieCanvas, {
      type: "doughnut",
      data: {
        labels: ["Top Ranked", "Middle Ranked", "Lower Ranked"],
        datasets: [
          {
            data: livePayload?.distribution || [40, 38, 22],
            backgroundColor: [
              "rgba(126, 241, 255, 0.88)",
              "rgba(191, 140, 255, 0.82)",
              "rgba(255, 210, 125, 0.82)",
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: chartText,
              usePointStyle: true,
            },
          },
        },
      },
    }));
  }

  if (radarCanvas) {
    const winner = livePayload?.winnerEntry;
    const runnerUp = livePayload?.runnerUpEntry;
    const winnerRadarData = winner
      ? [
          winner.price_score,
          winner.performance_score,
          winner.camera_score,
          winner.battery_score,
          winner.display_score,
          winner.software_support_score,
        ]
      : [0, 0, 0, 0, 0, 0];
    const runnerRadarData = runnerUp
      ? [
          runnerUp.price_score,
          runnerUp.performance_score,
          runnerUp.camera_score,
          runnerUp.battery_score,
          runnerUp.display_score,
          runnerUp.software_support_score,
        ]
      : [0, 0, 0, 0, 0, 0];

    analyticsCharts.push(new Chart(radarCanvas, {
      type: "radar",
      data: {
        labels: ["Price", "Performance", "Camera", "Battery", "Display", "Software Support"],
        datasets: [
          {
            label: winner?.model || "Winner",
            data: winnerRadarData,
            borderColor: "rgba(112, 229, 255, 0.95)",
            backgroundColor: "rgba(112, 229, 255, 0.16)",
            pointBackgroundColor: "rgba(112, 229, 255, 1)",
            borderWidth: 2,
          },
          {
            label: runnerUp?.model || "Runner-up",
            data: runnerRadarData,
            borderColor: "rgba(191, 140, 255, 0.95)",
            backgroundColor: "rgba(191, 140, 255, 0.14)",
            pointBackgroundColor: "rgba(191, 140, 255, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: chartText },
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
    }));
  }

  if (factorCanvas) {
    const factorLabels =
      livePayload?.topContributions?.map((item) => item.label) || ["Price", "Performance", "Camera", "Battery"];
    const factorValues =
      livePayload?.topContributions?.map((item) => item.weightedScore) || [0, 0, 0, 0];

    analyticsCharts.push(new Chart(factorCanvas, {
      type: "bar",
      data: {
        labels: factorLabels,
        datasets: [
          {
            label: "Weighted Contribution",
            data: factorValues,
            backgroundColor: [
              "rgba(112, 229, 255, 0.88)",
              "rgba(191, 140, 255, 0.82)",
              "rgba(255, 210, 125, 0.82)",
              "rgba(133, 240, 187, 0.82)",
            ],
            borderRadius: 14,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: chartText },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 4,
            ticks: { color: chartMuted },
            grid: { color: chartGrid },
          },
          y: {
            ticks: { color: chartMuted },
            grid: { display: false },
          },
        },
      },
    }));
  }
}

createDashboardChart();
createAnalyticsCharts();
