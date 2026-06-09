const autofillController = () => {
  async function start() {
    const storageModule = window.UTC_Vuz.registry.modules.storage;
    const autofillModule = window.UTC_Vuz.registry.modules.autofillSurvey;

    await storageModule.startAutoFill();
    console.log("[Controller] Start AutoFill");

    await autofillModule.autoFill();
  }

  async function stop() {
    const storage = window.UTC_Vuz.registry.modules.storage;

    await storage.stopAutoFill();
    console.log("[Controller] stopped");
  }

  return {
    start,
    stop,
  };
};

window.UTC_Vuz.register(
  "controller",
  "autofillController",
  autofillController(),
);
