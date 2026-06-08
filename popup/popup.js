const SURVEY_DOMAIN = "sis.utc.edu.vn";

const container = document.getElementById("subjects-container");
const configSection = document.getElementById("config-section");
const actionSection = document.getElementById("action-section");
const defaultStrategy = document.getElementById("default-strategy");

const loadBtn = document.getElementById("load-btn");
const saveBtn = document.getElementById("save-btn");
const fillBtn = document.getElementById("fill-btn");
const fillAllBtn = document.getElementById("fill-all-btn");

const statusSection = document.getElementById("status-section");
const statusMessage = document.getElementById("status-message");
const statusActionBtn = document.getElementById("status-action-btn");

loadBtn.addEventListener("click", loadSubjects);
saveBtn.addEventListener("click", () => saveConfig(false));
fillBtn.addEventListener("click", triggerFill);
fillAllBtn.addEventListener("click", triggerFillAll);

defaultStrategy.addEventListener("change", hideActions);

function hideActions() {
  actionSection.hidden = true;
}

function showActions() {
  actionSection.hidden = false;
}

window.addEventListener("DOMContentLoaded", async () => {
  const isValid = await detectValidTab();
  if (!isValid) return;

  const data = await chrome.storage.local.get("surveyConfig");
  if (!data.surveyConfig) {
    return;
  }

  loadSubjects();
});

async function detectValidTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes(SURVEY_DOMAIN)) {
    statusSection.hidden = true;
    loadBtn.hidden = false;
    return true;
  }

  // Not on valid domain, search for other tabs
  const allTabs = await chrome.tabs.query({ currentWindow: true });
  const otherTab = allTabs.find((t) => t.url && t.url.includes(SURVEY_DOMAIN));

  statusSection.hidden = false;
  loadBtn.hidden = true;
  configSection.hidden = true;

  if (otherTab) {
    statusMessage.textContent = "Bạn đang ở tab khác. Quay lại tab UTC?";
    statusActionBtn.textContent = "Chuyển tới tab UTC";
    statusActionBtn.onclick = () => {
      chrome.tabs.update(otherTab.id, { active: true });
      window.close();
    };
  } else {
    statusMessage.textContent = "Vui lòng mở trang khảo sát của UTC.";
    statusActionBtn.textContent = "Mở trang khảo sát";
    statusActionBtn.onclick = () => {
      chrome.tabs.create({ url: SURVEY_URL });
      window.close();
    };
  }
  return false;
}

async function loadSubjects() {
  loadBtn.disabled = true;
  loadBtn.textContent = "Loading...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "GET_SUBJECTS",
      },
      async (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          loadBtn.disabled = false;
          loadBtn.textContent = "Load Subjects";
          return;
        }

        if (response && response.subjects) {
          await renderSubjects(response.subjects);
          loadBtn.style.display = "none";
          configSection.hidden = false;
          hideActions();
        } else {
          statusSection.hidden = false;
          statusMessage.textContent =
            "Bạn cần vào đúng trang 'Khảo sát trực tuyến'.";
          statusActionBtn.textContent = "Đi tới trang khảo sát";
          loadBtn.disabled = false;
          loadBtn.textContent = "Load Subjects";
        }
      },
    );
  } catch (err) {
    console.error(err);
    loadBtn.disabled = false;
    loadBtn.textContent = "Load Subjects";
  }
}

async function triggerFillAll() {
  fillAllBtn.disabled = true;
  fillAllBtn.textContent = "Processing...";

  try {
    await chrome.storage.local.set({ isAutoFilling: true });
    const config = await loadConfig();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "START_AUTO_FILL_ALL",
        config: config,
      },
      (response) => {
        fillAllBtn.disabled = false;
        fillAllBtn.textContent = "Auto Fill All (Unrated)";

        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        window.close(); // Close popup to let the automation run
      },
    );
  } catch (err) {
    console.error(err);
    fillAllBtn.disabled = false;
    fillAllBtn.textContent = "Auto Fill All (Unrated)";
  }
}

function createStrategySelect() {
  const select = document.createElement("select");
  select.className = "subject-strategy";
  select.innerHTML = `
        <option value="DEFAULT">Use Default</option>
        <option value="RANDOM_13">Random 1-3</option>
        <option value="RANDOM_34">Random 3-4</option>
        <option value="RANDOM_45">Random 4-5</option>
        <option value="ONE4_FULL5">One 4 Full 5</option>
        <option value="ONE5_FULL4">One 5 Full 4</option>
    `;
  select.addEventListener("change", hideActions);
  return select;
}

async function renderSubjects(subjects) {
  container.innerHTML = "";
  const config = await loadConfig();

  defaultStrategy.value = config.defaultStrategy;

  const uniqueSubjects = [...new Set(subjects.map((x) => x.subject))];

  uniqueSubjects.forEach((subject) => {
    const row = document.createElement("div");
    row.className = "subject-row";
    row.dataset.subject = subject;

    const name = document.createElement("div");
    name.className = "subject-name";
    name.textContent = subject;

    const select = createStrategySelect();
    select.value = config.subjects[subject] || "DEFAULT";

    row.appendChild(name);
    row.appendChild(select);
    container.appendChild(row);
  });
}

async function loadConfig() {
  const data = await chrome.storage.local.get("surveyConfig");
  const config = data.surveyConfig || {};
  return {
    defaultStrategy: config.defaultStrategy || "RANDOM_45",
    subjects: config.subjects || {},
  };
}

async function saveConfig(silent = false) {
  const config = {
    defaultStrategy: defaultStrategy.value,
    subjects: {},
  };

  document.querySelectorAll(".subject-row").forEach((row) => {
    const subject = row.dataset.subject;
    const strategy = row.querySelector("select").value;
    config.subjects[subject] = strategy;
  });

  await chrome.storage.local.set({
    surveyConfig: config,
  });

  if (!silent) {
    showActions();
    saveBtn.textContent = "Saved ✓";
    setTimeout(() => {
      saveBtn.textContent = "Save Config";
    }, 1500);
  }

  console.log("saved config", config);
}

async function triggerFill() {
  fillBtn.disabled = true;
  fillBtn.textContent = "Filling...";

  try {
    const config = await loadConfig();
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "FILL_SURVEY",
        config: config,
      },
      (response) => {
        fillBtn.disabled = false;
        fillBtn.textContent = "Fill Current Subject";

        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        if (response && response.success) {
          console.log("Filled successfully");
        }
      },
    );
  } catch (err) {
    console.error(err);
    fillBtn.disabled = false;
    fillBtn.textContent = "Fill Current Subject";
  }
}
