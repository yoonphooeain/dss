import json
from pathlib import Path


DATASET_PATH = Path(__file__).parent / "data" / "phones.json"


def calculate_scores(dataset, price_weight, camera_weight, battery_weight, performance_weight):
    scores = []

    for phone in dataset:
      score = (
          phone["price"] * price_weight
          + phone["camera_score"] * camera_weight
          + phone["battery_score"] * battery_weight
          + phone["performance_score"] * performance_weight
      )
      scores.append(
          {
              "model": phone["model"],
              "brand": phone["brand"],
              "year": phone["year"],
              "score": round(score, 2),
          }
      )

    ranking = sorted(scores, key=lambda item: item["score"], reverse=True)
    winner = ranking[0] if ranking else None

    return scores, ranking, winner


def load_dataset(path=DATASET_PATH):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


if __name__ == "__main__":
    phones = load_dataset()
    scores, ranking, winner = calculate_scores(
        dataset=phones,
        price_weight=0.01,
        camera_weight=0.25,
        battery_weight=0.25,
        performance_weight=0.25,
    )

    print("Scores:")
    for item in scores:
        print(f'{item["model"]}: {item["score"]}')

    print("\nRanking:")
    for index, item in enumerate(ranking, start=1):
        print(f'{index}. {item["model"]} - {item["score"]}')

    print("\nWinner:")
    print(winner)
