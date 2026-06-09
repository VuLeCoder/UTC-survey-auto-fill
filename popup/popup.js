async function sendMessage(action, data = {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { success: false, error: "No active tab" };

  try {
    return await chrome.tabs.sendMessage(tab.id, { action, ...data });
  } catch (error) {
    console.error("Message error:", error);
    return { success: false, error: error.message };
  }
}

const state = {
  isValidPage: false,
  loaded: false,
  saved: false,
  changed: false,
  courses: [],
  config: {
    defaultStrategy: null,
    courseStrategies: {},
  },
};

function renderPageStatus(isValid) {
  const statusSection = document.getElementById("status-section");
  const appSection = document.getElementById("app-section");

  if (!isValid) {
    statusSection.hidden = false;
    appSection.hidden = true;

    document.getElementById("status-message").innerText =
      "Không đúng trang sis.utc";

    document.getElementById("status-action-btn").innerText = "Mở trang đúng";
    return;
  }

  statusSection.hidden = true;
  appSection.hidden = false;
}

document.addEventListener("DOMContentLoaded", async () => {
  const response = await sendMessage("CHECK_PAGE");
  state.isValidPage = response.isSupported;
  renderPageStatus(state.isValidPage);
});

document.getElementById("load-btn").addEventListener("click", async () => {
  const response = await sendMessage("GET_COURSES");
  state.courses = response.courses || [];
  state.loaded = true;

  renderCourses(state.courses);

  document.getElementById("config-section").hidden = false;
  document.getElementById("load-btn").hidden = true; // Ẩn nút load sau khi bấm
});

function simplifyCourseName(name) {
  // Loại bỏ phần trong ngoặc đơn, ví dụ: "Tên môn (N01, ...)" -> "Tên môn"
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

function renderCourses(courses) {
  const container = document.getElementById("courses-container");
  container.innerHTML = "";

  // Nhóm các môn học theo tên đã rút gọn
  const uniqueNames = [...new Set(courses.map((c) => simplifyCourseName(c.displayName)))];

  uniqueNames.forEach((baseName) => {
    const row = document.createElement("div");
    row.className = "course-row";

    const name = document.createElement("div");
    name.className = "course-name";
    name.innerText = baseName;

    const select = document.createElement("select");
    select.className = "course-strategy";

    select.innerHTML = `
      <option value="DEFAULT">Default</option>
      <option value="RANDOM_13">Random 1-3</option>
      <option value="RANDOM_45">Random 4-5</option>
      <option value="FULL5_ONE4">Full 5, one 4</option>
    `;

    select.addEventListener("change", (e) => {
      const selectedStrategy = e.target.value;
      
      // Áp dụng strategy cho tất cả các môn có cùng baseName
      courses.forEach(course => {
        if (simplifyCourseName(course.displayName) === baseName) {
          state.config.courseStrategies[course.displayName] = {
            strategy: selectedStrategy,
          };
        }
      });
      
      onConfigChange();
    });

    row.appendChild(name);
    row.appendChild(select);

    container.appendChild(row);
  });
}

document.getElementById("default-strategy").addEventListener("change", (e) => {
  onConfigChange();
});

document.getElementById("save-btn").addEventListener("click", () => {
  state.config.defaultStrategy =
    document.getElementById("default-strategy").value;

  state.saved = true;

  document.getElementById("action-section").hidden = false;
});

function showStartButton() {
  document.getElementById("action-section").hidden = false;
}

function hideStartButton() {
  document.getElementById("action-section").hidden = true;
}

function onConfigChange() {
  state.changed = true;
  hideStartButton();
}

document.getElementById("start-btn").addEventListener("click", async () => {
  await sendMessage("START_AUTO_FILL", {
    config: state.config,
  });
});
