(async function () {
  await new Promise((r) => setTimeout(r, 300));

  const isSupported = await window.UTC_Vuz.bootstrap();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { action, config } = request;

    if (action === "CHECK_PAGE") {
      sendResponse({ isSupported });
    }

    if (action === "GET_COURSES") {
      const autofillSurvey = window.UTC_Vuz.registry.modules.autofillSurvey;
      const courses = autofillSurvey ? autofillSurvey.getListCourses() : [];
      sendResponse({ courses });
    }

    if (action === "START_AUTO_FILL") {
      const controller = window.UTC_Vuz.registry.controller.autofillController;
      const storageModule = window.UTC_Vuz.registry.modules.storage;
      const autofillSurvey = window.UTC_Vuz.registry.modules.autofillSurvey;

      (async () => {
        if (config) {
          await storageModule.saveCourseConfig(config.courseStrategies);
        }

        await autofillSurvey.initCourseQueue();
        await controller.start();
        sendResponse({ success: true });
      })();
      return true;
    }
  });

  console.log("[UTC] system ready");
})();
