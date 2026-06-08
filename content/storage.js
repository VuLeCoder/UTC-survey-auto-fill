const STORAGE_KEYS = {
  SUBJECT_CONFIG: "subject_config",
  SURVEY_QUEUE: "survey_queue",
  AUTO_FILL_STATE: "auto_fill_state",
};

function getStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

function setStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        [key]: value,
      },
      resolve,
    );
  });
}

function removeStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, resolve);
  });
}

/* ==========================
   Subject Config
========================== */

async function getSubjectConfig() {
  return (await getStorage(STORAGE_KEYS.SUBJECT_CONFIG)) || {};
}

async function saveSubjectConfig(config) {
  await setStorage(STORAGE_KEYS.SUBJECT_CONFIG, config);
}

/* ==========================
   Survey Queue
========================== */

async function getSurveyQueue() {
  return (await getStorage(STORAGE_KEYS.SURVEY_QUEUE)) || [];
}

async function saveSurveyQueue(queue) {
  await setStorage(STORAGE_KEYS.SURVEY_QUEUE, queue);
}

async function clearSurveyQueue() {
  await removeStorage(STORAGE_KEYS.SURVEY_QUEUE);
}

/* ==========================
   Auto Fill State
========================== */

async function getAutoFillState() {
  return (
    (await getStorage(STORAGE_KEYS.AUTO_FILL_STATE)) || {
      running: false,
      currentIndex: 0,
    }
  );
}

async function saveAutoFillState(state) {
  await setStorage(STORAGE_KEYS.AUTO_FILL_STATE, state);
}

async function startAutoFill() {
  await saveAutoFillState({
    running: true,
    currentIndex: 0,
  });
}

async function stopAutoFill() {
  await saveAutoFillState({
    running: false,
    currentIndex: 0,
  });
}
