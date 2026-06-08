console.log("content.js loaded");

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

function init() {
  console.log("[Survey Helper] Survey page detected → running...");

  chrome.storage.local.get(["isAutoFilling", "surveyConfig"], (data) => {
    const config = data.surveyConfig || {
      defaultStrategy: "RANDOM_45",
      subjects: {},
    };

    if (data.isAutoFilling) {
      console.log("Auto-filling is active, continuing...");
      handleAutoFillAll(config);
    }
  });
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
  const unrated = subjects.filter((s) => s.isUnrated);

  if (unrated.length === 0) {
    console.log("All subjects filled!");

    await chrome.storage.local.set({ isAutoFilling: false });

    alert("Xong! Tất cả các môn đã được đánh giá.");
    return;
  }

  const select = document.querySelector('select[name="lophocphan"]');
  if (!select) return;

  const currentValue = select.value;
  const isCurrentUnrated = unrated.some((s) => s.value === currentValue);

  if (isCurrentUnrated) {
    console.log("Current subject is unrated, filling...");
    fillAndOptionallySubmit(config, true);
  } else {
    const target = unrated[0];

    console.log(`Switching to: ${target.fullName}`);

    select.value = target.value;

    if (select.onchange) {
      select.onchange();
    } else {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
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
      submitBtn.click();
    } else {
      console.warn("Submit button not found");
    }
  }
}
