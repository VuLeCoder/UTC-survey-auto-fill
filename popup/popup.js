const container = document.getElementById("subjects-container");
const configSection = document.getElementById("config-section");
const defaultStrategy = document.getElementById("default-strategy");

const loadBtn = document.getElementById("load-btn");
const saveBtn = document.getElementById("save-btn");

loadBtn.addEventListener("click", loadSubjects);
saveBtn.addEventListener("click", saveConfig);

window.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get("surveyConfig");

  if (!data.surveyConfig) {
    return;
  }

  loadSubjects();
});

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

        await renderSubjects(response.subjects);

        loadBtn.style.display = "none";

        configSection.hidden = false;
      },
    );
  } catch (err) {
    console.error(err);

    loadBtn.disabled = false;

    loadBtn.textContent = "Load Subjects";
  }
}

function createStrategySelect() {
  const select = document.createElement("select");

  select.className = "subject-strategy";

  select.innerHTML = `
        <option value="DEFAULT">
            Use Default
        </option>

        <option value="RANDOM_13">
            Random 1-3
        </option>

        <option value="RANDOM_34">
            Random 3-4
        </option>

        <option value="RANDOM_45">
            Random 4-5
        </option>

        <option value="ONE4_FULL5">
            One 4 Full 5
        </option>

        <option value="ONE5_FULL4">
            One 5 Full 4
        </option>
    `;

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

  return (
    data.surveyConfig || {
      defaultStrategy: "RANDOM_45",

      subjects: {},
    }
  );
}

async function saveConfig() {
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

  saveBtn.textContent = "Saved ✓";

  setTimeout(() => {
    saveBtn.textContent = "Save Config";
  }, 1500);

  console.log("saved config", config);
}
