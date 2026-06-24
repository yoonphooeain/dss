import json
from pathlib import Path


DATASET_PATH = Path(__file__).parent / "data" / "phones.json"
CRITERIA = [
    ("price_score", "price_weight"),
    ("performance_score", "performance_weight"),
    ("camera_score", "camera_weight"),
    ("battery_score", "battery_weight"),
    ("display_score", "display_weight"),
    ("software_support_score", "software_support_weight"),
]

def normalize_weights(weights):
    total = sum(weights.values())
    if not total:
        return weights
    return {key: value / total for key, value in weights.items()}


def calculate_scores(
    dataset,
    price_weight,
    performance_weight,
    camera_weight,
    battery_weight,
    display_weight,
    software_support_weight,
):
    raw_weights = {
        "price_weight": price_weight,
        "performance_weight": performance_weight,
        "camera_weight": camera_weight,
        "battery_weight": battery_weight,
        "display_weight": display_weight,
        "software_support_weight": software_support_weight,
    }
    weights = normalize_weights(raw_weights)
    scores = []

    for phone in dataset:
        contributions = []
        score = 0

        for criterion_key, weight_key in CRITERIA:
            weighted_score = float(phone.get(criterion_key, 0)) * weights[weight_key]
            score += weighted_score
            contributions.append(
                {
                    "label": criterion_key.replace("_score", "").replace("_", " ").title(),
                    "rawScore": float(phone.get(criterion_key, 0)),
                    "weightedScore": round(weighted_score, 2),
                }
            )

        scores.append(
            {
                **phone,
                "score": round(score, 2),
                "contributions": sorted(contributions, key=lambda item: item["weightedScore"], reverse=True),
            }
        )

    ranking = sorted(scores, key=lambda item: item["score"], reverse=True)
    winner = ranking[0] if ranking else None

    return scores, ranking, winner, weights


def generate_explanation(winner, ranking):
    if not winner:
        return "Choose phones and assign weights to generate a recommendation."

    runner_up = ranking[1] if len(ranking) > 1 else None
    top_factors = (winner.get("contributions") or [])[:3]
    factor_text = " and ".join(item["label"].lower() for item in top_factors) if top_factors else "balanced criteria"
    contribution_text = (
        " Top contributing factors: "
        + ", ".join(f'{item["label"]} ({item["weightedScore"]:.2f})' for item in top_factors)
        + "."
        if top_factors
        else ""
    )
    runner_text = (
        f" It remains ahead of {runner_up['model']} in the weighted ranking."
        if runner_up
        else ""
    )
    return (
        f"{winner['model']} wins because {factor_text} scores are stronger under your current preferences."
        f"{contribution_text}{runner_text}"
    )


def load_dataset(path=DATASET_PATH):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


if __name__ == "__main__":
    phones = load_dataset()
    scores, ranking, winner, weights = calculate_scores(
        dataset=phones,
        price_weight=0.15,
        performance_weight=0.2,
        camera_weight=0.2,
        battery_weight=0.15,
        display_weight=0.15,
        software_support_weight=0.15,
    )

    print("Scores:")
    for item in scores:
        print(f'{item["model"]}: {item["score"]}')

    print("\nRanking:")
    for index, item in enumerate(ranking, start=1):
        print(f'{index}. {item["model"]} - {item["score"]}')

    print("\nWinner:")
    print(winner)
    print("\nWeights:")
    print(weights)
