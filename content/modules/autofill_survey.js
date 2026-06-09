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
    const defaultStrategy = config.defaultStrategy || "FULL5_ONE4";
    const courseStrategies = config.courseStrategies || {};

    listCourses.forEach((course) => {
      let strategy = courseStrategies[course.displayName]?.strategy;
      if (!strategy || strategy === "DEFAULT") {
        strategy = defaultStrategy;
      }

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
    const fillQuestionsModule = window.UTC_Vuz.registry.modules.fillQuestions;

    if (!storageModule || !fillQuestionsModule) {
      console.error("Modules not ready");
      return;
    }

    let queue = await storageModule.getSurveyQueue();
    const currentList = getListCourses();
    const flatClasses = currentList.flatMap((c) => c.classes);

    // Filter out completed courses from the head of the queue
    let changed = false;
    while (queue.length > 0) {
      const top = queue[0];
      const match = flatClasses.find((c) => c.value === top.value);
      if (match && match.isCompleted) {
        console.log(`[AutoFill] ${top.fullName} already completed, skipping.`);
        queue.shift();
        changed = true;
      } else {
        break;
      }
    }

    if (changed) {
      await storageModule.saveSurveyQueue(queue);
    }

    if (!queue.length) {
      const state = await storageModule.getAutoFillState();
      if (state.running) {
        await storageModule.stopAutoFill();
        alert("Hoàn thành tất cả khảo sát!");
      }
      return;
    }

    const currClass = queue[0];
    const courseSelector = document.querySelector(COURSE_SELECTOR);
    const hasQuestions = !!document.querySelector('input[type="radio"]');

    if (hasQuestions) {
      if (courseSelector && courseSelector.value === currClass.value) {
        console.log(`[AutoFill] Filling questions for: ${currClass.fullName}`);
        await fillQuestionsModule.autofillQuestions(currClass.strategy);
      } else {
        console.log(
          `[AutoFill] Wrong class selected or need refresh. Selecting: ${currClass.fullName}`,
        );
        await selectClass(currClass.value);
      }
    } else {
      console.log(`[AutoFill] Selecting class: ${currClass.fullName}`);
      const success = await selectClass(currClass.value);
      if (!success) {
        console.error("[AutoFill] Could not find course selector");
      }
    }
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
