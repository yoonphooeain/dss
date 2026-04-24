const chartText = "#eaf3ff";
const chartMuted = "rgba(214, 227, 245, 0.72)";
const chartGrid = "rgba(255, 255, 255, 0.08)";

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

function createAnalyticsCharts() {
  const barCanvas = document.getElementById("brandBarChart");
  const lineCanvas = document.getElementById("trendLineChart");
  const pieCanvas = document.getElementById("distributionPieChart");

  if (barCanvas) {
    new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: ["Apple", "Samsung"],
        datasets: [
          {
            label: "Average Score",
            data: [89, 86],
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
        labels: ["2010", "2013", "2016", "2019", "2022", "2025"],
        datasets: [
          {
            label: "iPhone Trend",
            data: [52, 61, 70, 79, 87, 93],
            borderColor: "#7ef1ff",
            backgroundColor: "rgba(126, 241, 255, 0.12)",
            fill: true,
            tension: 0.35,
          },
          {
            label: "Samsung Trend",
            data: [48, 58, 67, 75, 83, 90],
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
        labels: ["Premium", "Balanced", "Budget Friendly"],
        datasets: [
          {
            data: [40, 38, 22],
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
