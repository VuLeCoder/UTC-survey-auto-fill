const STRATEGY = {
  RANDOM_13: "RANDOM_13",
  RANDOM_45: "RANDOM_45",
  FULL5_ONE4: "FULL5_ONE4",
};

function normalizeNumber(n) {
  const num = Number(n);

  if (!Number.isFinite(num)) return 0;
  if (num <= 0) return 0;

  return Math.floor(num);
}

function randomInt(min, max) {
  if (min >= max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomArray(size, min, max) {
  return Array.from({ length: size }, () => randomInt(min, max));
}

function generateFull5One4(size) {
  const res = Array(size).fill(5);
  if (size > 0) {
    res[randomInt(0, size - 1)] = 4;
  }
  return res;
}

const strategy = {
  STRATEGIES: [
    {
      value: STRATEGY.RANDOM_13,
      text: "Random 1-3",
    },
    {
      value: STRATEGY.RANDOM_45,
      text: "Random 4-5",
    },
    {
      value: STRATEGY.FULL5_ONE4,
      text: "Full 5, one 4",
    },
  ],

  getStrategyText(s) {
    const item = this.STRATEGIES.find((i) => i.value === s);
    return item?.text;
  },

  generateAnswers(s, questionNum) {
    const num = normalizeNumber(questionNum);
    if (num <= 0) return [];

    switch (s) {
      case STRATEGY.RANDOM_13:
        return generateRandomArray(num, 1, 3);

      case STRATEGY.RANDOM_45:
        return generateRandomArray(num, 4, 5);

      case STRATEGY.FULL5_ONE4:
        return generateFull5One4(num);

      default:
        return generateFull5One4(num);
    }
  },
};

window.UTC_Vuz.register("modules", "strategy", strategy);
