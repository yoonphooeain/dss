# DSS Web App

A dark neumorphism Decision Support System web app for comparing iPhone and Samsung phones from 2010 to 2025.

## Features

- Dark neumorphism UI
- Responsive landing page with e-commerce style design
- Sidebar dashboard UI
- Login page UI
- Dashboard main page with Chart.js chart area
- Product catalog page for iPhone and Samsung models
- DSS comparison page with weight-based scoring
- Analytics dashboard with bar, line, and pie charts
- Flask API for product data and DSS score calculation
- JSON phone dataset
- Standalone Python scoring script

## Project Structure

```text
dss/
├── app.py
├── dss_scoring.py
├── README.md
├── .gitignore
├── data/
│   └── phones.json
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── charts.js
│       └── dss.js
├── index.html
├── login.html
├── dashboard-sidebar.html
├── dashboard.html
├── products.html
├── dss.html
└── analytics.html
```

## Pages

- `index.html` - landing page
- `login.html` - login UI
- `dashboard-sidebar.html` - sidebar-only dashboard navigation
- `dashboard.html` - dashboard overview page
- `products.html` - phone product catalog
- `dss.html` - DSS scoring interface
- `analytics.html` - analytics dashboard

## Backend API

### `GET /products`

Returns the phone dataset in JSON format.

### `POST /calculate`

Calculates phone scores and returns:

- scores
- ranking
- winner

Example request body:

```json
{
  "price_weight": 0.01,
  "camera_weight": 0.25,
  "battery_weight": 0.25,
  "performance_weight": 0.25
}
```

## Run Locally

### 1. Open the static UI

You can open the landing page directly:

```bash
open /Users/macbook/project/dss/index.html
```

Or open it manually in a browser:

```text
file:///Users/macbook/project/dss/index.html
```

### 2. Run the Flask API

```bash
cd /Users/macbook/project/dss
python3 app.py
```

The API will run at:

```text
http://127.0.0.1:5000
```

Available endpoints:

- `http://127.0.0.1:5000/products`
- `http://127.0.0.1:5000/calculate` (`POST` only)

## Run the Python DSS Script

```bash
cd /Users/macbook/project/dss
python3 dss_scoring.py
```

## Notes

- `dss.html` uses `fetch()` to call `/products` and `/calculate`
- If you open HTML files with `file://`, the API-connected DSS page may not work correctly
- For full frontend + backend integration, the HTML pages should be served through Flask routes

## Dataset

The dataset is stored in:

`data/phones.json`

It includes:

- model
- brand
- year
- price
- camera_score
- battery_score
- performance_score

## Tech Stack

- HTML
- CSS
- JavaScript
- Chart.js
- Python
- Flask

