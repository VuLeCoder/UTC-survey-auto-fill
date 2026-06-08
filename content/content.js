console.log("content.js loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SUBJECTS") {
    sendResponse({
      subjects: getSubjects(),
    });
  }

  if (message.type === "FILL_SURVEY") {
    const { config } = message;

    const select = document.querySelector('select[name="lophocphan"]');

    if (select) {
      const selectedOption = select.options[select.selectedIndex];

      const subjectName = extractSubjectName(selectedOption.textContent);

      const strategy = config.subjects[subjectName] || config.defaultStrategy;

      fillCurrentSubject(strategy);

      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Select not found" });
    }
  }

  return true;
});
