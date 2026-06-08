function chooseValue(strategy) {
  switch (strategy) {
    case "RANDOM_13":
      return Math.floor(Math.random() * 3) + 1;

    case "RANDOM_34":
      return Math.random() < 0.5 ? 3 : 4;

    case "RANDOM_45":
      return Math.random() < 0.5 ? 4 : 5;

    default:
      return 5;
  }
}

function getStrategyValues(strategy, count) {
  if (strategy === "ONE4_FULL5") {
    const specialIndex = Math.floor(Math.random() * count);
    return Array.from({ length: count }, (_, i) => (i === specialIndex ? 4 : 5));
  }

  if (strategy === "ONE5_FULL4") {
    const specialIndex = Math.floor(Math.random() * count);
    return Array.from({ length: count }, (_, i) => (i === specialIndex ? 5 : 4));
  }

  return Array.from({ length: count }, () => chooseValue(strategy));
}
