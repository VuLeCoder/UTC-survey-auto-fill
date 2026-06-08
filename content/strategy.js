const STRATEGY = {
  RANDOM_13: "RANDOM_13",
  RANDOM_34: "RANDOM_34",
  RANDOM_45: "RANDOM_45",

  ONE4_FULL5: "ONE4_FULL5",
  ONE5_FULL4: "ONE5_FULL4",
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomRange(count, min, max) {
  const result = [];

  for (let i = 0; i < count; i++) {
    result.push(randomInt(min, max));
  }

  return result;
}

function generateOne4Full5(count) {
  const result = Array(count).fill(5);
  const index = randomInt(0, count - 1);

  result[index] = 4;
  return result;
}

function generateOne5Full4(count) {
  const result = Array(count).fill(4);
  const index = randomInt(0, count - 1);

  result[index] = 5;
  return result;
}

function generateAnswers(strategy, questionCount) {
  switch (strategy) {
    case STRATEGY.RANDOM_13:
      return generateRandomRange(questionCount, 1, 3);

    case STRATEGY.RANDOM_34:
      return generateRandomRange(questionCount, 3, 4);

    case STRATEGY.RANDOM_45:
      return generateRandomRange(questionCount, 4, 5);

    case STRATEGY.ONE4_FULL5:
      return generateOne4Full5(questionCount);

    case STRATEGY.ONE5_FULL4:
      return generateOne5Full4(questionCount);

    default:
      return generateRandomRange(questionCount, 4, 5);
  }
}

function groupQuestions() {
  const groups = {};

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    const name = radio.name;

    if (!groups[name]) {
      groups[name] = [];
    }

    groups[name].push(radio);
  });

  return groups;
}
