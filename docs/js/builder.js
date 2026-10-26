function encodeConfig(configObj) {
  const jsonString = JSON.stringify(configObj);
  return btoa(
    encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode('0x' + p1);
    })
  );
}

function generateScriptTag(selectedModule, configObj, repoPath) {
  const encodedCfg = encodeConfig(configObj);
  const baseUrl = repoPath || "https://cdn.jsdelivr.net/gh/your-account/litetouch@main/docs/v1/";
  const fileName = selectedModule ? `${selectedModule}.js` : "all.js";

  return `<script src="${baseUrl}${fileName}" data-cfg="${encodedCfg}" defer></script>`;
}

window.updateGeneratedTag = function () {
  const selectedModule = document.getElementById('selectedModule').value;
  const domain = document.getElementById('domainInput').value.trim();
  const primaryColor = document.getElementById('primaryColorInput').value;
  const customCss = document.getElementById('customCssInput').value;
  const repoPath = document.getElementById('repoPathInput').value.trim();

  let features = [];

  if (selectedModule === 'all' || selectedModule === 'guide') {
    features.push({
      type: "guide",
      id: "guide-demo",
      selector: "#submit-btn",
      title: "送信ガイド",
      content: "入力内容を確認し、ここをクリックしてください。",
      showOverlay: true,
      nextButtonText: "次へ",
      prevButtonText: "戻る"
    });
  }

  if (selectedModule === 'all' || selectedModule === 'efo') {
    features.push({
      type: "efo",
      id: "efo-demo",
      selector: "input[name='company']",
      triggerEvent: "blur",
      ruleType: "preset",
      presetKey: "no_abbreviation",
      errorMessage: {
        title: "(株)などの略称は禁止です！",
        content: "・〇〇株式会社\n・株式会社〇〇\nといった形式で入力してください。"
      }
    });
  }

  if (selectedModule === 'all' || selectedModule === 'menu') {
    features.push({
      type: "quick_menu",
      id: "menu-demo",
      title: "ヘルプ＆クイックポータル",
      categories: [
        {
          categoryName: "手続き",
          items: [
            { label: "新規登録はこちら", url: "#register" },
            { label: "よくある質問 (FAQ)", url: "#faq" }
          ]
        }
      ]
    });
  }

  if (selectedModule === 'all' || selectedModule === 'autoflow') {
    features.push({
      type: "auto_flow",
      id: "flow-demo",
      steps: [
        { selector: "#username", action: "input", value: "テスト太郎", delayMs: 100 },
        { selector: "#agree-check", action: "click", delayMs: 200 }
      ]
    });
  }

  const configObj = {
    version: "1.0.0",
    domain: domain,
    theme: {
      primaryColor: primaryColor,
      customCss: customCss
    },
    ga4: {
      enabled: true,
      events: {
        widget_view: true,
        widget_error: true,
        quick_menu_open: true,
        auto_flow_execute: true
      }
    },
    features: features
  };

  const scriptTag = generateScriptTag(selectedModule, configObj, repoPath);
  document.getElementById('outputScriptTag').textContent = scriptTag;
  document.getElementById('outputJsonConfig').textContent = JSON.stringify(configObj, null, 2);
};

window.copyScriptTag = function () {
  const tagText = document.getElementById('outputScriptTag').textContent;
  navigator.clipboard.writeText(tagText).then(() => {
    alert('埋め込みタグをクリップボードにコピーしました！');
  }).catch((err) => {
    alert('コピーに失敗しました: ' + err);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.updateGeneratedTag();
});
