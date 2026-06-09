window.UTC_Vuz = window.UTC_Vuz || {};

window.UTC_Vuz.bootstrap = async function () {
  console.log("[UTC] bootstrap start");

  const isSurveyPage =
    location.href.includes("/survey/") ||
    !!document.querySelector('input[type="radio"]') ||
    !!document.querySelector('select[name="lophocphan"]');

  if (!isSurveyPage) {
    console.log("[Bootstrap] Not survey page → skip");
    return false;
  }

  await new Promise((r) => setTimeout(r, 300));

  const autofillSurvey = window.UTC_Vuz.registry.modules.autofillSurvey;
  if (autofillSurvey) {
    await autofillSurvey.autoFill();
  }

  console.log("[UTC] bootstrap done");
  return true;
};
