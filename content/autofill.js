function getQuestionGroups() {
  const groups = {};

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    if (!groups[radio.name]) {
      groups[radio.name] = [];
    }

    groups[radio.name].push(radio);
  });

  return groups;
}

async function fillSurvey(strategy) {
  const groups = getQuestionGroups();

  const names = Object.keys(groups);

  if (!names.length) {
    console.error("No questions found");
    return;
  }

  const answers = generateAnswers(strategy, names.length);

  names.forEach((questionName, index) => {
    const score = answers[index];

    const radio = groups[questionName].find((r) => Number(r.value) === score);

    if (radio) {
      radio.checked = true;

      radio.dispatchEvent(
        new Event("change", {
          bubbles: true,
        }),
      );
    }
  });

  console.log("Survey filled");

  setTimeout(submitSurvey, 1000);
}

async function submitSurvey() {
  await saveProcessingSubject();

  const btn = document.querySelector("#btnupdate");

  btn?.click();
}

async function removeCurrentSubject() {
  const queue = await getSurveyQueue();

  if (!queue.length) {
    return;
  }

  queue.shift();

  await saveSurveyQueue(queue);
}

async function finishQueue() {
  await clearSurveyQueue();

  await stopAutoFill();

  console.log("Queue completed");
}

(function () {
  const originalAlert = window.alert;

  window.alert = async function (msg) {
    const state = await getAutoFillState();

    if (state.running) {
      const queue = await getSurveyQueue();

      queue.shift();

      await saveSurveyQueue(queue);
    }

    return originalAlert(msg);
  };
})();

async function saveProcessingSubject() {
  const queue = await getSurveyQueue();

  if (!queue.length) {
    return;
  }

  await setStorage("processing_subject", queue[0]);
}

async function cleanupAfterReload() {
  const state = await getAutoFillState();

  if (!state.running) {
    return;
  }

  const processing = await getStorage("processing_subject");

  if (!processing) {
    return;
  }

  const queue = await getSurveyQueue();

  if (queue.length && queue[0].value === processing.value) {
    queue.shift();

    await saveSurveyQueue(queue);
  }

  await removeStorage("processing_subject");
}

(async () => {
  await cleanupAfterReload();
})();
