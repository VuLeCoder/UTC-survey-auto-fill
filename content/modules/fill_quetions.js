const fillQuestionsModule = () => {
  // === === === === === ===
  // private:
  // === === === === === ===
  const QUESTION_SELECTOR = 'input[type="radio"]';
  const BTN_SUBMIT_SELECTOR = "#btnupdate";
  const COURSE_SELECTOR = 'select[name="lophocphan"]';
  const DELAY_SUBMIT = 800;

  function setCourseSurvey(courseId) {
    const courseSelector = document.querySelector(COURSE_SELECTOR);
    if (!courseSelector) {
      console.error("Khong thay select hoc phan");
      return;
    }

    courseSelector.selectedIndex = courseId;
    courseSelector.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function getQuestionGroups() {
    const questions = {};
    document.querySelectorAll(QUESTION_SELECTOR).forEach((radio) => {
      if (!questions[radio.name]) {
        questions[radio.name] = [];
      }
      questions[radio.name].push(radio);
    });
    return questions;
  }

  async function fillQuestions(strategyModule, strategy) {
    const questionGroups = getQuestionGroups();
    const questions = Object.keys(questionGroups);
    if (!questions.length) {
      console.error("Khong co cau hoi nao");
      return;
    }

    const answers = strategyModule.generateAnswers(strategy, questions.length);
    questions.forEach((question, index) => {
      const ans = answers[index];

      const radio = questionGroups[question].find(
        (r) => Number(r.value) === ans,
      );
      if (radio) {
        radio.checked = true;

        radio.dispatchEvent(
          new Event("change", {
            bubbles: true,
          }),
        );
      }
    });

    setTimeout(submit, DELAY_SUBMIT);
  }

  function submit() {
    const btn = document.querySelector(BTN_SUBMIT_SELECTOR);
    btn?.click();
  }

  // === === === === === ===
  // public
  // === === === === === ===
  return {
    async autofillQuestions(courseId, strategy) {
      setCourseSurvey(courseId);

      const strategyModule = window.UTC_Vuz.registry.modules.strategy;
      if (!strategyModule?.generateAnswers) {
        console.error("Strategy module not ready");
        return;
      }

      await fillQuestions(strategyModule, strategy);
    },
  };
};

window.UTC.register("modules", "fillQuestions", fillQuestionsModule());
