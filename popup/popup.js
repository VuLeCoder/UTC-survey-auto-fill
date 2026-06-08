const loadBtn = document.getElementById("load-btn");

const saveBtn = document.getElementById("save-btn");

const fillBtn = document.getElementById("fill-btn");

const fillAllBtn = document.getElementById("fill-all-btn");

const configSection = document.getElementById("config-section");
configSection.hidden = true;

const actionSection = document.getElementById("action-section");

const subjectsContainer = document.getElementById("subjects-container");

const defaultStrategy = document.getElementById("default-strategy");

async function getSubjectConfig() {
  const result = await chrome.storage.local.get("subject_config");

  if (Object.keys(result.subject_config || {}).length) {
    actionSection.hidden = false;
  }

  return result.subject_config || {};
}

async function saveSubjectConfig(config) {
  await chrome.storage.local.set({
    subject_config: config,
  });
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tabs[0];
}

async function sendMessage(action, payload = {}) {
  const tab = await getCurrentTab();

  return chrome.tabs.sendMessage(tab.id, {
    action,
    ...payload,
  });
}

function createStrategySelect(selected) {
  const select = document.createElement("select");

  select.className = "subject-strategy";

  STRATEGIES.forEach((strategy) => {
    const option = document.createElement("option");

    option.value = strategy.value;

    option.textContent = strategy.text;

    option.selected = strategy.value === selected;

    select.appendChild(option);
  });

  return select;
}

async function renderSubjects(subjects) {
  subjectsContainer.innerHTML = "";

  const config = await getSubjectConfig();

  subjects.forEach((subject) => {
    const row = document.createElement("div");

    row.className = "subject-row";

    const name = document.createElement("div");

    name.className = "subject-name";

    name.textContent = subject.displayName;

    const strategy = createStrategySelect(
      config[subject.displayName]?.strategy || defaultStrategy.value,
    );

    strategy.dataset.subject = subject.displayName;

    row.appendChild(name);

    row.appendChild(strategy);

    subjectsContainer.appendChild(row);
  });
}

loadBtn.addEventListener("click", async () => {
  try {
    const response = await sendMessage("GET_SUBJECTS");

    const subjects = response.subjects || [];

    await renderSubjects(subjects);

    configSection.hidden = false;

    actionSection.hidden = false;
  } catch (err) {
    alert("Không tìm thấy trang khảo sát");
  }
});

saveBtn.addEventListener("click", async () => {
  const config = {};

  document.querySelectorAll(".subject-strategy").forEach((select) => {
    config[select.dataset.subject] = {
      strategy: select.value,
    };
  });

  await saveSubjectConfig(config);

  alert("Đã lưu cấu hình");
});

fillBtn.addEventListener("click", async () => {
  await sendMessage("FILL_CURRENT", {
    strategy: defaultStrategy.value,
  });

  window.close();
});

fillAllBtn.addEventListener("click", async () => {
  const config = {};

  document.querySelectorAll(".subject-strategy").forEach((select) => {
    config[select.dataset.subject] = {
      strategy: select.value,
    };
  });

  await saveSubjectConfig(config);

  await sendMessage("AUTO_FILL_ALL");

  window.close();
});
