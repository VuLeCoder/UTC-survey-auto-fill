console.log("content.js loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_SUBJECTS") {
    sendResponse({
      subjects: getSubjects(),
    });
  }

  return true;
});
