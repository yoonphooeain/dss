const dashboardUserName = document.getElementById("dashboard-user-name");
const dashboardUserEmail = document.getElementById("dashboard-user-email");
const dashboardUtilityName = document.getElementById("dashboard-utility-name");
const dashboardSavedCount = document.getElementById("dashboard-saved-count");
const dashboardProgressRing = document.getElementById("dashboard-progress-ring");
const dashboardProgressMetaOne = document.getElementById("dashboard-progress-meta-one");
const dashboardProgressMetaTwo = document.getElementById("dashboard-progress-meta-two");
const dashboardLatestWinner = document.getElementById("dashboard-latest-winner");
const dashboardLatestScore = document.getElementById("dashboard-latest-score");
const dashboardLatestRunnerup = document.getElementById("dashboard-latest-runnerup");
const dashboardLatestReason = document.getElementById("dashboard-latest-reason");
const dashboardLatestImage = document.getElementById("dashboard-latest-image");
const dashboardCommandWinner = document.getElementById("dashboard-command-winner");
const dashboardCommandHelper = document.getElementById("dashboard-command-helper");
const dashboardLiveState = document.getElementById("dashboard-live-state");
const dashboardLiveNote = document.getElementById("dashboard-live-note");
const dashboardLiveSummary = document.getElementById("dashboard-live-summary");
const dashboardProcessState = document.getElementById("dashboard-process-state");
const dashboardSummarySelected = document.getElementById("dashboard-summary-selected");
const dashboardSummaryWinner = document.getElementById("dashboard-summary-winner");
const dashboardSummaryWinnerNote = document.getElementById("dashboard-summary-winner-note");
const dashboardSummarySaved = document.getElementById("dashboard-summary-saved");
const dashboardSummaryMode = document.getElementById("dashboard-summary-mode");
const dashboardSummaryModeNote = document.getElementById("dashboard-summary-mode-note");
const dashboardRecentActivity = document.getElementById("dashboard-recent-activity");
const dashboardHistoryTableBody = document.getElementById("dashboard-history-table-body");
const dashboardSearchInput = document.getElementById("dashboard-search-input");
const dashboardNotificationCount = document.getElementById("dashboard-notification-count");
const dashboardExportButton = document.getElementById("dashboard-export-btn");
const dashboardFlowBrowse = document.getElementById("dashboard-flow-browse");
const dashboardFlowSelect = document.getElementById("dashboard-flow-select");
const dashboardFlowWeight = document.getElementById("dashboard-flow-weight");
const dashboardFlowScore = document.getElementById("dashboard-flow-score");
const dashboardFlowSteps = Array.from(document.querySelectorAll("[data-flow-step]"));
const dashboardFlowLines = Array.from(document.querySelectorAll("[data-flow-line]"));
const USER_KEY = "phonedssUser";
const AUTH_KEY = "phonedssAuthenticated";
const RESULTS_KEY = "dssResults";
const SAVED_COMPARISONS_KEY = "phonedssSavedComparisons";
const LOGIN_URL = "login.html?v=flow19";
const RESULTS_URL = "results.html?v=flow24";
const savedUserRaw = localStorage.getItem(USER_KEY);
let recentActivityItems = [];

if (!savedUserRaw || sessionStorage.getItem(AUTH_KEY) !== "true") {
  window.location.href = LOGIN_URL;
}

try {
  const savedUser = JSON.parse(savedUserRaw);
  const normalizedName = (savedUser?.name || "Yoonphooeain").replace(/76\b/g, "").trim();
  const normalizedEmail = (savedUser?.email || "yoonphooeain@gmail.com")
    .replace("yoonphooeain76@", "yoonphooeain@")
    .trim();

  if (dashboardUserName) {
    dashboardUserName.textContent = normalizedName || "Yoonphooeain";
  }

  if (dashboardUtilityName) {
    dashboardUtilityName.textContent = normalizedName || "Yoonphooeain";
  }

  if (dashboardUserEmail) {
    dashboardUserEmail.textContent = normalizedEmail || "yoonphooeain@gmail.com";
  }
} catch (error) {
  window.location.href = LOGIN_URL;
}

try {
  const savedResults = JSON.parse(localStorage.getItem(RESULTS_KEY) || "null");
  const savedComparisons = JSON.parse(localStorage.getItem(SAVED_COMPARISONS_KEY) || "[]");
  const hasResults = Boolean(savedResults?.winner);
  const contribution = savedResults?.winner?.contributions?.[0]?.label || "No explanation yet";
  const runnerUp = savedResults?.ranking?.[1]?.model || "No runner-up";
  const savedCount = Array.isArray(savedComparisons) ? savedComparisons.length : 0;
  const selectedCount = Array.isArray(savedResults?.selectedModels) ? savedResults.selectedModels.length : 0;
  const activeMode = detectActiveMode(savedResults?.rawWeights || savedResults?.weights || {});
  const recentItems = buildRecentActivity(savedResults, savedComparisons);

  if (dashboardSavedCount) {
    dashboardSavedCount.textContent = String(savedCount);
  }

  if (dashboardSummarySaved) {
    dashboardSummarySaved.textContent = String(savedCount);
  }

  if (dashboardNotificationCount) {
    dashboardNotificationCount.textContent = String(Math.max(savedCount, hasResults ? 1 : 0));
  }

  if (dashboardSummarySelected) {
    dashboardSummarySelected.textContent = String(selectedCount);
  }

  if (dashboardProgressRing) {
    dashboardProgressRing.textContent = hasResults ? "Ready" : "Pending";
  }

  if (dashboardProgressMetaOne) {
    dashboardProgressMetaOne.textContent = savedCount ? `${savedCount} result${savedCount > 1 ? "s" : ""} saved` : "No saved results";
  }

  if (dashboardProgressMetaTwo) {
    dashboardProgressMetaTwo.textContent = hasResults ? "Charts synced" : "Run evaluation";
  }

  if (dashboardLiveState) {
    dashboardLiveState.textContent = hasResults ? "Recommendation synced" : "System ready";
  }

  if (dashboardLiveNote) {
    dashboardLiveNote.textContent = hasResults
      ? "Latest evaluation has been saved to the dashboard"
      : "Waiting for the next evaluation run";
  }

  if (dashboardLatestWinner) {
    dashboardLatestWinner.textContent = hasResults ? savedResults.winner.model : "No result yet";
  }

  updateWinnerThumbnail(savedResults?.winner?.model);

  if (dashboardSummaryWinner) {
    dashboardSummaryWinner.textContent = hasResults ? savedResults.winner.model : "No result yet";
  }

  if (dashboardSummaryWinnerNote) {
    dashboardSummaryWinnerNote.textContent = hasResults
      ? `Runner-up: ${runnerUp}`
      : "Run DSS to identify a winner";
  }

  if (dashboardLatestScore) {
    dashboardLatestScore.textContent = hasResults ? savedResults.winner.score.toFixed(2) : "Run DSS first";
  }

  if (dashboardLatestRunnerup) {
    dashboardLatestRunnerup.textContent = hasResults ? runnerUp : "Waiting";
  }

  if (dashboardLatestReason) {
    dashboardLatestReason.textContent = hasResults ? contribution : "No explanation yet";
  }

  if (dashboardCommandWinner) {
    dashboardCommandWinner.textContent = hasResults ? savedResults.winner.model : "No result yet";
  }

  if (dashboardCommandHelper) {
    dashboardCommandHelper.textContent = hasResults
      ? `Runner-up: ${runnerUp}`
      : "Run DSS to generate a recommendation";
  }

  if (dashboardLiveSummary) {
    dashboardLiveSummary.textContent = hasResults
      ? `${savedResults.winner.model} is leading the latest weighted decision`
      : "Ready for a new decision run";
  }

  if (dashboardProcessState) {
    dashboardProcessState.textContent = hasResults ? "Winner saved" : "Awaiting run";
  }

  renderWorkflowState({
    hasResults,
    selectedCount,
    activeMode,
    winner: savedResults?.winner?.model || "",
  });

  if (dashboardSummaryMode) {
    dashboardSummaryMode.textContent = formatModeLabel(activeMode);
  }

  if (dashboardSummaryModeNote) {
    dashboardSummaryModeNote.textContent = hasResults
      ? `Latest run used ${formatModeLabel(activeMode).toLowerCase()} preferences`
      : "Ready for a fresh run";
  }

  renderRecentActivity(recentItems);
  renderHistoryTable(recentItems);
} catch (error) {
  // Keep the dashboard fallback copy if results cannot be parsed.
  updateWinnerThumbnail("");
  renderWorkflowState({
    hasResults: false,
    selectedCount: 0,
    activeMode: "balanced",
    winner: "",
  });
  renderRecentActivity([]);
  renderHistoryTable([]);
}

document.getElementById("dashboard-logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = "index.html";
});

function formatModeLabel(mode) {
  const map = {
    balanced: "Balanced",
    budget: "Best for Budget",
    camera: "Best for Camera",
    performance: "Best for Performance",
    custom: "Custom",
  };

  return map[mode] || "Balanced";
}

function detectActiveMode(weightMap) {
  const normalized = normalizeWeights(weightMap);
  const presetWeights = {
    balanced: {
      price_weight: 0.15,
      performance_weight: 0.2,
      camera_weight: 0.2,
      battery_weight: 0.15,
      display_weight: 0.15,
      software_support_weight: 0.15,
    },
    budget: {
      price_weight: 0.35,
      performance_weight: 0.15,
      camera_weight: 0.1,
      battery_weight: 0.15,
      display_weight: 0.1,
      software_support_weight: 0.15,
    },
    camera: {
      price_weight: 0.1,
      performance_weight: 0.15,
      camera_weight: 0.35,
      battery_weight: 0.1,
      display_weight: 0.15,
      software_support_weight: 0.15,
    },
    performance: {
      price_weight: 0.1,
      performance_weight: 0.35,
      camera_weight: 0.15,
      battery_weight: 0.15,
      display_weight: 0.15,
      software_support_weight: 0.1,
    },
  };

  const entries = Object.entries(presetWeights).map(([mode, preset]) => {
    const score = Object.keys(preset).reduce((sum, key) => sum + Math.abs((normalized[key] || 0) - preset[key]), 0);
    return { mode, score };
  });

  entries.sort((a, b) => a.score - b.score);
  return entries[0]?.score <= 0.12 ? entries[0].mode : "custom";
}

function normalizeWeights(weightMap) {
  const raw = {
    price_weight: Number(weightMap.price_weight || 0),
    performance_weight: Number(weightMap.performance_weight || 0),
    camera_weight: Number(weightMap.camera_weight || 0),
    battery_weight: Number(weightMap.battery_weight || 0),
    display_weight: Number(weightMap.display_weight || 0),
    software_support_weight: Number(weightMap.software_support_weight || 0),
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);

  if (!total) {
    return {
      price_weight: 0.15,
      performance_weight: 0.2,
      camera_weight: 0.2,
      battery_weight: 0.15,
      display_weight: 0.15,
      software_support_weight: 0.15,
    };
  }

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Number((value / total).toFixed(4))])
  );
}

function renderRecentActivity(items) {
  if (!dashboardRecentActivity) return;

  recentActivityItems = Array.isArray(items) ? items : [];

  if (!items.length) {
    dashboardRecentActivity.innerHTML = `<div class="dashboard-recent-empty"><span>No recent comparison</span><em>Run DSS first</em></div>`;
    return;
  }

  dashboardRecentActivity.innerHTML = items
    .slice(0, 5)
    .map((item) => {
      return `
        <button class="dashboard-recent-item" type="button" data-recent-id="${item.id}">
          <span class="dashboard-recent-copy">
            <strong>${item.title}</strong>
            <em>${item.meta}</em>
          </span>
          <span class="dashboard-recent-open">Open</span>
        </button>
      `;
    })
    .join("");
}

function renderHistoryTable(items) {
  if (!dashboardHistoryTableBody) return;

  if (!items.length) {
    dashboardHistoryTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="dashboard-table-empty">Run DSS first to populate the dashboard log.</td>
      </tr>
    `;
    return;
  }

  dashboardHistoryTableBody.innerHTML = items
    .slice(0, 6)
    .map((item) => {
      const score = item.payload?.winner?.score != null ? Number(item.payload.winner.score).toFixed(2) : "0.00";
      const selectedCount = Array.isArray(item.payload?.selectedModels) ? item.payload.selectedModels.length : 0;
      const status = item.source === "latest" ? "Live" : "Saved";
      return `
        <tr>
          <td>
            <strong>${item.title}</strong>
            <small>${item.payload?.winner?.model || "No winner"}</small>
          </td>
          <td>${item.modeLabel || "Balanced"}</td>
          <td>${selectedCount || "-"}</td>
          <td>${score}</td>
          <td><span class="dashboard-table-status ${status === "Live" ? "is-live" : "is-saved"}">${status}</span></td>
          <td>${formatActivityTime(item.payload?.savedAt || item.payload?.generatedAt)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildRecentActivity(savedResults, savedComparisons) {
  const items = [];

  if (savedResults?.winner) {
    const modeLabel = formatModeLabel(detectActiveMode(savedResults.rawWeights || savedResults.weights || {}));
    items.push({
      id: `latest-${savedResults.generatedAt || "current"}`,
      title: savedResults.savedName || savedResults.winner.model,
      meta: `${modeLabel} • ${formatActivityTime(savedResults.generatedAt)}`,
      modeLabel,
      source: "latest",
      payload: {
        winner: savedResults.winner,
        ranking: savedResults.ranking,
        explanation: savedResults.explanation,
        weights: savedResults.weights,
        rawWeights: savedResults.rawWeights,
        selectedModels: savedResults.selectedModels || [],
        generatedAt: savedResults.generatedAt,
        savedName: savedResults.savedName || "",
        savedAt: savedResults.savedAt || "",
      },
    });
  }

  if (Array.isArray(savedComparisons)) {
    savedComparisons.forEach((item) => {
      if (!item?.winner) return;
      const title = item.savedName || item.winner.model || "Saved result";
      const modeLabel = formatModeLabel(detectActiveMode(item.rawWeights || item.weights || {}));
      const meta = `${modeLabel} • ${formatActivityTime(item.savedAt || item.generatedAt)}`;
      const duplicate = items.some((entry) => entry.title === title && entry.meta === meta);
      if (!duplicate) {
        items.push({
          id: item.id || `saved-${item.generatedAt || item.savedAt || Date.now()}`,
          title,
          meta,
          modeLabel,
          source: "saved",
          payload: {
            winner: item.winner,
            ranking: item.ranking,
            explanation: item.explanation,
            weights: item.weights,
            rawWeights: item.rawWeights,
            selectedModels: item.selectedModels || [],
            generatedAt: item.generatedAt,
            savedName: item.savedName || "",
          },
        });
      }
    });
  }

  return items;
}

function formatActivityTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function updateWinnerThumbnail(modelName) {
  if (!dashboardLatestImage) return;

  const phoneList = Array.isArray(window.PHONES_DATA) ? window.PHONES_DATA : [];
  const matchedPhone = phoneList.find((item) => item.model === modelName);
  const imageSrc = matchedPhone?.image || "assets/images/products/iphone-16-pro.png";
  const altText = matchedPhone?.model ? `${matchedPhone.model} thumbnail` : "Latest winner phone";

  dashboardLatestImage.src = imageSrc;
  dashboardLatestImage.alt = altText;
}

function renderWorkflowState({ hasResults, selectedCount, activeMode, winner }) {
  if (dashboardFlowBrowse) {
    dashboardFlowBrowse.textContent = "Dataset ready";
  }

  if (dashboardFlowSelect) {
    dashboardFlowSelect.textContent = selectedCount
      ? `${selectedCount} phone${selectedCount > 1 ? "s" : ""} selected`
      : "Choose 2 to 5 phones";
  }

  if (dashboardFlowWeight) {
    dashboardFlowWeight.textContent = `${formatModeLabel(activeMode)} mode`;
  }

  if (dashboardFlowScore) {
    dashboardFlowScore.textContent = hasResults ? "Scores calculated" : "Weighted scoring ready";
  }

  if (dashboardProcessState) {
    dashboardProcessState.textContent = hasResults ? winner || "Winner ready" : "Awaiting run";
  }

  dashboardFlowSteps.forEach((step, index) => {
    const completed = index === 0 || (index === 1 && selectedCount > 0) || (index === 2 && selectedCount > 0) || (index === 3 && hasResults) || (index === 4 && hasResults);
    step.classList.toggle("is-complete", completed);
  });

  dashboardFlowLines.forEach((line, index) => {
    const completed = (index === 0 && selectedCount > 0) || (index === 1 && selectedCount > 0) || (index === 2 && hasResults) || (index === 3 && hasResults);
    line.classList.toggle("is-complete", completed);
  });
}

dashboardRecentActivity?.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-recent-id]");
  if (!trigger) return;

  const selectedId = trigger.getAttribute("data-recent-id");
  const selectedItem = recentActivityItems.find((item) => item.id === selectedId);
  if (!selectedItem?.payload?.winner) return;

  localStorage.setItem(RESULTS_KEY, JSON.stringify(selectedItem.payload));
  window.location.href = RESULTS_URL;
});

dashboardSearchInput?.addEventListener("input", () => {
  const query = dashboardSearchInput.value.trim().toLowerCase();
  if (!query) {
    renderRecentActivity(recentActivityItems);
    renderHistoryTable(recentActivityItems);
    return;
  }

  const filteredItems = recentActivityItems.filter((item) => {
    const winnerName = item.payload?.winner?.model || "";
    return (
      item.title.toLowerCase().includes(query) ||
      item.meta.toLowerCase().includes(query) ||
      winnerName.toLowerCase().includes(query) ||
      (item.modeLabel || "").toLowerCase().includes(query)
    );
  });

  renderRecentActivity(filteredItems);
  renderHistoryTable(filteredItems);
});

dashboardExportButton?.addEventListener("click", () => {
  if (!recentActivityItems.length) return;

  const rows = [
    ["Comparison", "Mode", "Selected", "Winner", "Winner Score", "Status", "Updated"],
    ...recentActivityItems.slice(0, 10).map((item) => [
      item.title,
      item.modeLabel || "Balanced",
      String(Array.isArray(item.payload?.selectedModels) ? item.payload.selectedModels.length : 0),
      item.payload?.winner?.model || "",
      item.payload?.winner?.score != null ? Number(item.payload.winner.score).toFixed(2) : "",
      item.source === "latest" ? "Live" : "Saved",
      formatActivityTime(item.payload?.savedAt || item.payload?.generatedAt),
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "phonedss-dashboard-log.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
