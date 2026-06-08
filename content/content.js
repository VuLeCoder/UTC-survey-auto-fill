console.log("content.js loaded");

const STORAGE_KEYS = {
  AUTO_FILLING: "isAutoFilling",
  CONFIG: "surveyConfig",
  LAST_SUBMITTED: "lastSubmittedSubject",
  WAITING_REFRESH: "waitingRefresh",
};

function isSurveyPage() {
  const url = window.location.href;

  return (
    url.includes("survey") ||
    url.includes("khao-sat") ||
    document.querySelector('select[name="lophocphan"]') // fallback mạnh nhất
  );
}

if (!isSurveyPage()) {
  console.log("[Survey Helper] Not survey page → skip execution");
} else {
  init();
}

async function init() {
  console.log("[Survey Helper] Survey page detected");

  chrome.storage.local.get(
    [
      STORAGE_KEYS.AUTO_FILLING,
      STORAGE_KEYS.CONFIG,
      STORAGE_KEYS.WAITING_REFRESH,
    ],
    (data) => {
      const config = data.surveyConfig || {
        defaultStrategy: "RANDOM_45",
        subjects: {},
      };

      if (!data.isAutoFilling) {
        return;
      }

      if (data.waitingRefresh) {
        console.log(
          "[AutoFill] First reload after submit -> force second reload",
        );

        chrome.storage.local.set({
          [STORAGE_KEYS.WAITING_REFRESH]: false,
        });

        setTimeout(() => {
          location.reload();
        }, 1500);

        return;
      }

      setTimeout(() => {
        handleAutoFillAll(config);
      }, 1000);
    },
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isSurveyPage()) {
    sendResponse?.({ success: false, reason: "not_survey_page" });
    return true;
  }

  if (message.type === "GET_SUBJECTS") {
    sendResponse({
      subjects: getSubjects(),
    });
  }

  if (message.type === "FILL_SURVEY") {
    fillAndOptionallySubmit(message.config);
    sendResponse({ success: true });
  }

  if (message.type === "START_AUTO_FILL_ALL") {
    handleAutoFillAll(message.config);
    sendResponse({ success: true });
  }

  return true;
});

async function handleAutoFillAll(config) {
  const subjects = getSubjects();

  console.table(subjects);

  const unrated = subjects.filter((s) => s.isUnrated);

  console.log("[AutoFill] Unrated:", unrated.length);

  if (unrated.length === 0) {
    console.log("[AutoFill] All subjects completed");

    await chrome.storage.local.set({
      [STORAGE_KEYS.AUTO_FILLING]: false,
      [STORAGE_KEYS.LAST_SUBMITTED]: null,
    });

    alert("Đã hoàn thành tất cả khảo sát.");

    return;
  }

  const select = document.querySelector('select[name="lophocphan"]');

  if (!select) {
    return;
  }

  const currentValue = select.value;

  console.log("[AutoFill] Current:", currentValue);

  const isCurrentUnrated = unrated.some((s) => s.value === currentValue);

  if (isCurrentUnrated) {
    console.log("[AutoFill] Fill current subject");

    fillAndOptionallySubmit(config, true);

    return;
  }

  const target = unrated[0];

  console.log("[AutoFill] Switch to:", target.fullName);

  select.value = target.value;

  if (window.jQuery) {
    $(select).trigger("change");
  } else {
    select.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }
}

function fillAndOptionallySubmit(config, forceSubmit = false) {
  const select = document.querySelector('select[name="lophocphan"]');
  if (!select) return;

  const selectedOption = select.options[select.selectedIndex];
  const subjectName = extractSubjectName(selectedOption.textContent);

  let strategy = config.subjects[subjectName] || "DEFAULT";
  if (strategy === "DEFAULT") {
    strategy = config.defaultStrategy;
  }

  console.log(`Subject: "${subjectName}" | Strategy: "${strategy}"`);

  fillCurrentSubject(strategy);

  if (forceSubmit) {
    const submitBtn = document.getElementById("btnupdate");

    if (submitBtn) {
      console.log("Submitting...");

      chrome.storage.local.set({
        [STORAGE_KEYS.LAST_SUBMITTED]: select.value,

        [STORAGE_KEYS.WAITING_REFRESH]: true,
      });

      console.log("[AutoFill] Submit:", select.value);

      setTimeout(() => {
        submitBtn.click();
      }, 800);
    } else {
      console.warn("Submit button not found");
    }
  }
}
