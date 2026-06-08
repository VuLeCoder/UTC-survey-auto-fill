function extractSubjectName(text) {
  text = text.replace("(Chưa đánh giá)", "").trim();

  const idx = text.indexOf("(");

  if (idx === -1) {
    return text;
  }

  return text.substring(0, idx).trim();
}

function getSubjects() {
  const select = document.querySelector('select[name="lophocphan"]');

  if (!select) {
    return [];
  }

  return [...select.options].map((option) => ({
    value: option.value,

    fullName: option.textContent.trim(),

    subject: extractSubjectName(option.textContent),

    isUnrated: option.textContent.includes("(Chưa đánh giá)"),
  }));
}
