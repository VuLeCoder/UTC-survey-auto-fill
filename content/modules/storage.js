const storage = {
  get(key) {
    return new Promise((res) => {
      chrome.storage.local.get([key], (r) => res(r[key]));
    });
  },

  set(key, value) {
    return new Promise((res) => {
      chrome.storage.local.set({ [key]: value }, res);
    });
  },
};

window.UTC_Vuz.register("modules", "storage", storage);
