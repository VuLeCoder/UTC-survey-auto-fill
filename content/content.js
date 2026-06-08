function getSubjectSelect() {
  return document.querySelector('select[name="lophocphan"]');
}

function isSurveyPage() {
  return !!getSubjectSelect();
}

function getDisplayName(fullName) {
  return fullName.replace(/\([^)]*\)$/, "").trim();
}

function extractSubjects() {
  const select = getSubjectSelect();

  if (!select) {
    return [];
  }

  const map = {};

  [...select.options].forEach((option) => {
    const text = option.textContent.trim();

    const isCompleted = text.includes("Đã hoàn thành");

    if (isCompleted) {
      return;
    }

    const fullName = text.replace("(Chưa đánh giá)", "").trim();

    const displayName = getDisplayName(fullName);

    if (!map[displayName]) {
      map[displayName] = {
        displayName,
        subjects: [],
      };
    }

    map[displayName].subjects.push({
      value: option.value,
      fullName,
    });
  });

  return Object.values(map);
}

function buildQueue(groupedSubjects, config) {
  const queue = [];

  groupedSubjects.forEach((subject) => {
    const strategy = config[subject.displayName]?.strategy;

    subject.subjects.forEach((s) => {
      queue.push({
        displayName: subject.displayName,

        fullName: s.fullName,

        value: s.value,

        strategy,
      });
    });
  });

  return queue;
}

async function selectSubject(value) {
  const select = getSubjectSelect();

  if (!select) {
    return false;
  }

  select.value = value;

  select.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );

  return true;
}

function getCurrentSubject() {
  const select = getSubjectSelect();

  if (!select) {
    return null;
  }

  const option = select.options[select.selectedIndex];

  return {
    value: option.value,
    text: option.textContent.trim(),
  };
}

async function fillCurrentSubject(strategy) {
  fillSurvey(strategy);
}

async function startQueue() {
  const grouped = extractSubjects();

  const config = await getSubjectConfig();

  const queue = buildQueue(grouped, config);

  await saveSurveyQueue(queue);

  await startAutoFill();

  await processQueue();
}

async function processQueue() {
  const queue = await getSurveyQueue();

  if (!queue.length) {
    await stopAutoFill();

    alert("Hoàn thành tất cả khảo sát");

    return;
  }

  const current = queue[0];

  const select = getSubjectSelect();

  select.value = current.value;

  await chrome.storage.local.set({
    processing_subject: current,
  });

  fillSurvey(current.strategy);
}

async function resumeAutoFill() {
  const state = await getAutoFillState();

  if (!state.running) {
    return;
  }

  setTimeout(processQueue, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "GET_SUBJECTS":
      sendResponse({
        subjects: extractSubjects(),
      });

      break;

    case "FILL_CURRENT":
      fillCurrentSubject(message.strategy);

      break;

    case "AUTO_FILL_ALL":
      startQueue();

      break;
  }

  return true;
});

(async () => {
  if (!isSurveyPage()) {
    return;
  }

  await resumeAutoFill();
})();
