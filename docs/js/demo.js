document.addEventListener('DOMContentLoaded', () => {
  console.log('[LiteTouch Demo] Demo page initialized.');
});

window.triggerEfoCheck = function () {
  const companyInput = document.querySelector("input[name='company']");
  if (companyInput) {
    companyInput.value = "サンプル(株)";
    companyInput.focus();
    companyInput.blur();
  }
};

window.triggerGuideTour = function () {
  window.LiteTouchConfig = {
    domain: "",
    theme: { primaryColor: "#2563eb" },
    features: [
      {
        type: "guide",
        id: "guide-step1",
        selector: "#name-input",
        title: "ステップ1: お名前入力",
        content: "まずはこちらにお名前を入力してください。",
        showOverlay: true,
        nextButtonText: "次へ (会社名)"
      },
      {
        type: "guide",
        id: "guide-step2",
        selector: "#company-input",
        title: "ステップ2: 会社名入力",
        content: "次に会社名を入力します。(株)などの略称は自動的にEFOで検知されます。",
        showOverlay: true,
        nextButtonText: "完了"
      }
    ]
  };

  const script = document.createElement('script');
  script.src = "v1/guide.js";
  document.body.appendChild(script);
};

window.triggerAutoflow = function () {
  window.LiteTouchConfig = {
    domain: "",
    features: [
      {
        type: "auto_flow",
        id: "demo-autoflow",
        steps: [
          { selector: "#name-input", action: "input", value: "山田 太郎", delayMs: 100 },
          { selector: "#company-input", action: "input", value: "株式会社サンプル", delayMs: 300 },
          { selector: "#email-input", action: "input", value: "yamada@example.com", delayMs: 500 },
          { selector: "#agree-check", action: "click", delayMs: 700 }
        ]
      }
    ]
  };

  const script = document.createElement('script');
  script.src = "v1/autoflow.js";
  document.body.appendChild(script);
};
