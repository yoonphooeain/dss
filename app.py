import json
from pathlib import Path

from flask import Flask, jsonify, request

from dss_scoring import calculate_scores


BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "data" / "phones.json"
WEIGHTED_DATASET_PATH = BASE_DIR / "data" / "weighted_phones.json"

app = Flask(__name__)


def load_dataset():
    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def load_weighted_dataset():
    with open(WEIGHTED_DATASET_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/products")
def get_products():
    return jsonify(load_dataset())


@app.post("/calculate")
def calculate():
    payload = request.get_json(silent=True) or {}
    dataset = payload.get("dataset", load_weighted_dataset())

    scores, ranking, winner, normalized_weights = calculate_scores(
        dataset=dataset,
        price_weight=float(payload.get("price_weight", 0)),
        performance_weight=float(payload.get("performance_weight", 0)),
        camera_weight=float(payload.get("camera_weight", 0)),
        battery_weight=float(payload.get("battery_weight", 0)),
        display_weight=float(payload.get("display_weight", 0)),
        software_support_weight=float(payload.get("software_support_weight", 0)),
    )

    return jsonify(
        {
            "scores": scores,
            "ranking": ranking,
            "winner": winner,
            "normalizedWeights": normalized_weights,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
