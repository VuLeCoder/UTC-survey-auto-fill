function fillCurrentSubject(strategy) {
  const radioGroups = [
    ...new Set(
      [...document.querySelectorAll('input[type="radio"]')].map((r) => r.name),
    ),
  ];

  const values = getStrategyValues(strategy, radioGroups.length);

  radioGroups.forEach((name, index) => {
    const value = values[index];

    const radio = document.querySelector(
      `input[name="${name}"][value="${value}"]`,
    );

    if (radio) {
      radio.click();
    }
  });
}
