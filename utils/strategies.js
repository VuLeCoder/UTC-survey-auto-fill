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
