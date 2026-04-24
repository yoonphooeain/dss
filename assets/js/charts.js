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
  const winner = stored.winner?.model || "Latest winner";
  const weightSummary = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key.replace("_weight", "").replace(/^\w/, (char) => char.toUpperCase()));

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
    weightSummary,
    generatedAt: stored.generatedAt,
  };
}

function updateAnalyticsText(payload) {
  if (!payload) return;

  const liveNote = document.getElementById("analytics-live-note");
  const summaryTitle = document.getElementById("analytics-summary-title");
  const summaryCopy = document.getElementById("analytics-summary-copy");
  const insightOneTitle = document.getElementById("analytics-insight-one-title");
  const insightOneCopy = document.getElementById("analytics-insight-one-copy");
  const insightTwoTitle = document.getElementById("analytics-insight-two-title");
  const insightTwoCopy = document.getElementById("analytics-insight-two-copy");
  const insightThreeTitle = document.getElementById("analytics-insight-three-title");
  const insightThreeCopy = document.getElementById("analytics-insight-three-copy");

  if (liveNote) {
    const weightText = payload.weightSummary.length ? payload.weightSummary.join(", ") : "your selected criteria";
    liveNote.textContent = `Live analytics updated from your latest DSS result. Main weights: ${weightText}.`;
  }

  if (summaryTitle) {
    summaryTitle.textContent = `Live result for ${payload.winner}`;
  }

  if (summaryCopy) {
    summaryCopy.textContent = `These charts now reflect your latest DSS weights and ranking instead of fixed sample values.`;
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
    insightThreeCopy.textContent = `${payload.winner} is the current top recommendation based on your most recent DSS calculation.`;
  }
}

function createAnalyticsCharts() {
  const barCanvas = document.getElementById("brandBarChart");
  const lineCanvas = document.getElementById("trendLineChart");
  const pieCanvas = document.getElementById("distributionPieChart");
  const livePayload = buildAnalyticsPayload();

  if (livePayload) {
    updateAnalyticsText(livePayload);
  }

  if (barCanvas) {
    new Chart(barCanvas, {
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
    });
  }

  if (lineCanvas) {
    new Chart(lineCanvas, {
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
    });
  }

  if (pieCanvas) {
    new Chart(pieCanvas, {
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
    });
  }
}

createDashboardChart();
createAnalyticsCharts();
