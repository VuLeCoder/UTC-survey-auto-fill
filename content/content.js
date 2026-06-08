console.log("content.js loaded");

// Auto-run if enabled
chrome.storage.local.get(["isAutoFilling", "surveyConfig"], (data) => {
  const config = data.surveyConfig || {
    defaultStrategy: "RANDOM_45",
    subjects: {},
    autoOk: false,
  };

  if (config.autoOk) {
    injectAutoOk();
  }

  if (data.isAutoFilling) {
    console.log("Auto-filling is active, continuing...");
    handleAutoFillAll(config);
  }
});

function injectAutoOk() {
  console.log("Injecting Auto-OK script...");
  const script = document.createElement("script");
  script.textContent = `
    (function() {
      const originalAlert = window.alert;
      const originalConfirm = window.confirm;

      window.alert = function(msg) { 
        if (msg && msg.includes("Xong!")) {
          originalAlert(msg);
          return;
        }
        console.log("Intercepted alert:", msg); 
        return true; 
      };
      window.confirm = function(msg) { 
        console.log("Intercepted confirm:", msg); 
        return true; 
      };
    })();
  `;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SUBJECTS") {
    sendResponse({
      subjects: getSubjects(),
    });
  }

  if (message.type === "FILL_SURVEY") {
    const { config } = message;

    fillAndOptionallySubmit(config);

    sendResponse({ success: true });
  }

  if (message.type === "START_AUTO_FILL_ALL") {
    const { config } = message;

    handleAutoFillAll(config);

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

    fillAndOptionallySubmit(config, true); // Force submit for auto-fill all
  } else {
    const target = unrated[0];

    console.log(`Switching to unrated subject: ${target.fullName}`);

    select.value = target.value;

    if (select.onchange) {
      select.onchange();
    } else if (select.form) {
      select.form.submit();
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

  console.log(
    `Processing subject: "${subjectName}", selected strategy: "${strategy}"`,
  );

  fillCurrentSubject(strategy);

  if (forceSubmit) {
    const submitBtn = document.getElementById("btnupdate");

    if (submitBtn) {
      console.log("Submitting...");

      submitBtn.click();
    } else {
      console.warn("Submit button with id='btnupdate' not found");
    }
  }
}
