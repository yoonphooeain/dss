const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#eef3fb",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#9aa7bd" },
      grid: { color: "rgba(255,255,255,0.06)" },
    },
    y: {
      ticks: { color: "#9aa7bd" },
      grid: { color: "rgba(255,255,255,0.06)" },
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
          label: "Sales Trend",
          data: [120, 160, 180, 220, 260, 300, 340],
          borderColor: "#5fb3ff",
          backgroundColor: "rgba(95, 179, 255, 0.18)",
          tension: 0.35,
          fill: true,
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
        labels: ["iPhone", "Samsung"],
        datasets: [
          {
            label: "Brand Comparison",
            data: [88, 84],
            backgroundColor: ["#5fb3ff", "#7dd3a5"],
            borderRadius: 14,
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
            data: [52, 60, 69, 77, 84, 92],
            borderColor: "#5fb3ff",
            backgroundColor: "rgba(95, 179, 255, 0.14)",
            fill: true,
            tension: 0.35,
          },
          {
            label: "Samsung Trend",
            data: [48, 58, 67, 74, 82, 90],
            borderColor: "#7dd3a5",
            backgroundColor: "rgba(125, 211, 165, 0.14)",
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
      type: "pie",
      data: {
        labels: ["iPhone", "Samsung"],
        datasets: [
          {
            label: "Distribution",
            data: [50, 50],
            backgroundColor: ["#5fb3ff", "#ffbf69"],
            borderColor: "rgba(17, 22, 31, 0.8)",
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#eef3fb",
            },
          },
        },
      },
    });
  }
}

createDashboardChart();
createAnalyticsCharts();
