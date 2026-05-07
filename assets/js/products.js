const dataset = Array.isArray(window.PHONES_DATA) ? window.PHONES_DATA : [];
const productsGrid = document.getElementById("products-grid");
const datasetCount = document.getElementById("dataset-count");
const searchInput = document.getElementById("search-input");
const brandFilter = document.getElementById("brand-filter");
const yearFilter = document.getElementById("year-filter");
const sortFilter = document.getElementById("sort-filter");
const IMAGE_VERSION = "flow19";

function populateYearFilter() {
  if (!yearFilter) return;

  const years = [...new Set(dataset.map((item) => item.year))].sort((a, b) => b - a);
  yearFilter.innerHTML += years.map((year) => `<option value="${year}">${year}</option>`).join("");
}

function renderProducts(items) {
  if (!productsGrid) return;

  if (!items.length) {
    productsGrid.innerHTML = '<div class="table-empty">No phones match the current filters.</div>';
    datasetCount.textContent = "0 results";
    return;
  }

  datasetCount.textContent = `${items.length} results`;
  productsGrid.innerHTML = items
    .map(
      (phone) => `
        <article class="phone-data-card">
          <div class="phone-data-image">
            <img
              src="${phone.image}?v=${IMAGE_VERSION}"
              alt="${phone.model}"
              loading="lazy"
              onerror="this.onerror=null;this.src='assets/images/products-generated/${phone.model
                .toLowerCase()
                .replace(/\+/g, 'plus')
                .replace(/[^a-z0-9]+/g, '-')}.svg?v=${IMAGE_VERSION}'"
            >
          </div>
          <div class="phone-data-body">
            <h3>${phone.model}</h3>
            <span class="tag">${phone.brand} • ${phone.year}</span>
            <div class="phone-meta-grid">
              <span><strong>Price</strong><br>${phone.price_score ?? phone.price}</span>
              <span><strong>Performance</strong><br>${phone.performance_score}</span>
              <span><strong>Camera</strong><br>${phone.camera_score}</span>
              <span><strong>Battery</strong><br>${phone.battery_score}</span>
              <span><strong>Display</strong><br>${phone.display_score ?? "-"}</span>
              <span><strong>Software</strong><br>${phone.software_support_score ?? phone.software_score ?? "-"}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function sortItems(items, sortValue) {
  const sorted = [...items];

  switch (sortValue) {
    case "year-asc":
      sorted.sort((a, b) => a.year - b.year);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "performance-desc":
      sorted.sort((a, b) => b.performance_score - a.performance_score);
      break;
    default:
      sorted.sort((a, b) => b.year - a.year);
  }

  return sorted;
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const year = yearFilter.value;
  const sortValue = sortFilter.value;

  const filtered = dataset.filter((item) => {
    const matchesQuery = item.model.toLowerCase().includes(query);
    const matchesBrand = brand === "all" || item.brand === brand;
    const matchesYear = year === "all" || String(item.year) === year;

    return matchesQuery && matchesBrand && matchesYear;
  });

  renderProducts(sortItems(filtered, sortValue));
}

if (productsGrid) {
  populateYearFilter();
  renderProducts(sortItems(dataset, "year-desc"));

  [searchInput, brandFilter, yearFilter, sortFilter].forEach((element) => {
    element?.addEventListener("input", applyFilters);
    element?.addEventListener("change", applyFilters);
  });
}
