const autofillModule = () => {
  // === === === === === ===
  // private:
  // === === === === === ===
  const COURSE_SELECTOR = 'select[name="lophocphan"]';
  const COMPLETED = "Đã hoàn thành";

  function getDisplayName(fullName) {
    return fullName.replace(/\([^)]*\)$/, "").trim();
  }

  function getListCourses() {
    const courseSelector = document.querySelector(COURSE_SELECTOR);
    if (!courseSelector) return [];

    const map = {};
    [...courseSelector.options].forEach((option) => {
      const text = option.textContent.trim();
      const isCompleted = text.includes(COMPLETED);

      const fullName = text
        .replace("(Chưa đánh giá)", "")
        .replace("Đã hoàn thành", "")
        .trim();

      const displayName = getDisplayName(fullName);
      if (!map[displayName]) {
        map[displayName] = {
          displayName,
          classes: [],
        };
      }

      map[displayName].classes.push({
        value: option.value,
        fullName,
        isCompleted,
      });
    });
    return Object.values(map);
  }

  function buildQueue(listCourses, config) {
    const queue = [];

    listCourses.forEach((course) => {
      const strategy = config[course.displayName]?.strategy;

      course.classes.forEach((c) => {
        if (c.isCompleted) return;

        queue.push({
          displayName: course.displayName,
          fullName: c.fullName,
          value: c.value,
          strategy: strategy,
        });
      });
    });

    return queue;
  }

  async function selectClass(value) {
    const courseSelector = document.querySelector(COURSE_SELECTOR);
    if (!courseSelector) return false;

    courseSelector.value = value;
    courseSelector.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );

    return true;
  }

  async function processQueue() {
    const storageModule = window.UTC_Vuz.registry.modules.storage;
    if (!storageModule) {
      console.error("Storage module not ready");
      return;
    }

    const fillQuestionsModule = window.UTC_Vuz.registry.modules.fillQuestions;
    if (!fillQuestionsModule) {
      console.error("fillQuestion module not ready");
      return;
    }

    const queue = await storageModule.getSurveyQueue();
    if (!queue.length) {
      await storageModule.stopAutoFill();
      alert("Hoàn thành tất cả khảo sát");
      return;
    }

    await storageModule.startAutoFill();

    const currClass = queue[0];
    await selectClass(currClass.value);

    const newQueue = queue.slice(1);
    await storageModule.saveSurveyQueue(newQueue);

    await fillQuestionsModule.autofillQuestions(currClass.strategy);
  }

  // === === === === === ===
  // public:
  // === === === === === ===
  return {
    getListCourses,

    async initCourseQueue() {
      const storageModule = window.UTC_Vuz.registry.modules.storage;
      if (!storageModule) {
        console.error("Storage module not ready");
        return;
      }

      const listCourses = getListCourses();
      const config = await storageModule.getCourseConfig();

      const queue = buildQueue(listCourses, config);
      await storageModule.saveSurveyQueue(queue);
    },

    async autoFill() {
      const storageModule = window.UTC_Vuz.registry.modules.storage;
      if (!storageModule) {
        console.error("Storage module not ready");
        return;
      }

      const state = await storageModule.getAutoFillState();
      if (!state.running) {
        return;
      }

      setTimeout(async () => {
        await processQueue();
      }, 1000);
    },
  };
};

window.UTC_Vuz.register("modules", "autofillSurvey", autofillModule());
