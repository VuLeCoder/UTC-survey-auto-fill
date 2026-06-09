const storageModule = () => {
  const COURSE_CONFIG = "course_config";
  const SURVEY_QUEUE = "survey_queue";
  const AUTO_FILL_STATE = "auto_fill_state";

  function get(key) {
    return new Promise((res) => {
      chrome.storage.local.get([key], (r) => res(r[key]));
    });
  }

  function set(key, value) {
    return new Promise((res) => {
      chrome.storage.local.set({ [key]: value }, res);
    });
  }

  function remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  }

  return {
    async getCourseConfig() {
      return (await get(COURSE_CONFIG)) || {};
    },

    async saveCourseConfig(config) {
      await set(COURSE_CONFIG, config);
    },

    async getSurveyQueue() {
      return (await get(SURVEY_QUEUE)) || [];
    },

    async saveSurveyQueue(queue) {
      await set(SURVEY_QUEUE, queue);
    },

    async getAutoFillState() {
      return (
        (await get(AUTO_FILL_STATE)) || {
          running: false,
          currentIndex: 0,
        }
      );
    },

    async saveAutoFillState(state) {
      await set(AUTO_FILL_STATE, state);
    },

    async startAutoFill() {
      await set(AUTO_FILL_STATE, {
        running: true,
        currentIndex: 0,
      });
    },

    async stopAutoFill() {
      await set(AUTO_FILL_STATE, {
        running: false,
        currentIndex: 0,
      });
    },

    async clearStorage() {
      await remove([COURSE_CONFIG, SURVEY_QUEUE, AUTO_FILL_STATE]);
    },
  };
};

window.UTC_Vuz.register("modules", "storage", storageModule());
