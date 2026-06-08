function fillCurrentSubject(strategy) {
  const questionNames = [
    ...new Set(
      [...document.querySelectorAll('input[type="radio"]')].map((r) => r.name),
    ),
  ];

  questionNames.forEach((name) => {
    const value = chooseValue(strategy);

    const radio = document.querySelector(
      `input[name="${name}"][value="${value}"]`,
    );

    if (radio) {
      radio.click();
    }
  });
}
