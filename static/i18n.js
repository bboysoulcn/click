(() => {
  // Translation dictionaries
  const translations = {
    en: {
      title: "click - Appreciation Button Demo",
      main_title: "♥️ click",
      subtitle: "Privacy-focused appreciation buttons for your website",
      try_it: "Try it out!",
      try_desc: "Click the buttons below to see click in action. Your choice is saved locally - refresh the page to see the count persist.",
      heart_default: "Heart (default)",
      thumbs_up: "Thumbs Up",
      upvote: "Upvote",
      custom_emoji: "Custom Emoji",
      multiple_buttons: "Multiple Buttons",
      multiple_desc: "Use different slugs to track different pages or sections:",
      page_1: "Page 1",
      page_2: "Page 2",
      page_3: "Page 3",
      features: "Features",
      privacy_first: "Privacy First",
      privacy_desc: "No user tracking, no IPs stored, no cookies.",
      lightweight: "Lightweight",
      lightweight_desc: "Pure vanilla JavaScript, minimal footprint.",
      accessible: "Accessible",
      accessible_desc: "Full keyboard navigation and screen reader support.",
      customizable: "Customizable",
      customizable_desc: "Built-in icons and emoji support, easy styling.",
      self_hosted: "Self-Hosted",
      self_hosted_desc: "Complete control over your data.",
      rate_limited: "Rate Limited",
      rate_limited_desc: "Protection against abuse built-in.",
      quick_start: "Quick Start",
      add_script: "1. Add the script to your page:",
      add_button: "2. Add a button:",
      add_style: "3. Style it (optional):",
      thats_it: "That's it! The button will automatically display with a heart icon and show the current count.",
      customization: "Customization",
      use_icons: "Use different icons:",

      inspired_by: "Inspired by welpo/click"
    },
    zh: {
      title: "click - 点赞按钮演示",
      main_title: "♥️ click",
      subtitle: "注重隐私的网站点赞按钮",
      try_it: "试试看！",
      try_desc: "点击下面的按钮体验点赞功能。你的选择会本地保存 - 刷新页面可以看到计数持久化。",
      heart_default: "心形（默认）",
      thumbs_up: "点赞",
      upvote: "投票",
      custom_emoji: "自定义表情",
      multiple_buttons: "多个按钮",
      multiple_desc: "使用不同的slug来跟踪不同的页面或部分：",
      page_1: "页面1",
      page_2: "页面2",
      page_3: "页面3",
      features: "特性",
      privacy_first: "隐私优先",
      privacy_desc: "不追踪用户，不存储IP，不使用cookies。",
      lightweight: "轻量级",
      lightweight_desc: "纯原生JavaScript，最小化占用。",
      accessible: "无障碍访问",
      accessible_desc: "完整的键盘导航和屏幕阅读器支持。",
      customizable: "可定制",
      customizable_desc: "内置图标和表情符号支持，轻松样式化。",
      self_hosted: "自托管",
      self_hosted_desc: "完全控制你的数据。",
      rate_limited: "速率限制",
      rate_limited_desc: "内置防滥用保护。",
      quick_start: "快速开始",
      add_script: "1. 在页面中添加脚本：",
      add_button: "2. 添加按钮：",
      add_style: "3. 添加样式（可选）：",
      thats_it: "就是这样！按钮会自动显示心形图标和当前计数。",
      customization: "自定义",
      use_icons: "使用不同的图标：",

      inspired_by: "灵感来源 welpo/click"
    }
  };

  // Get current language from localStorage or default to English
  let currentLang = localStorage.getItem('click-language') || 'en';

  // Update button text based on current language
  function updateLanguageButton() {
    const button = document.querySelector('.language-toggle');
    if (button) {
      button.textContent = currentLang === 'en' ? '中文' : 'EN';
    }
  }

  // Translate all elements with data-i18n attributes
  function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[currentLang] && translations[currentLang][key]) {
        if (element.tagName === 'TITLE') {
          document.title = translations[currentLang][key];
        } else {
          element.textContent = translations[currentLang][key];
        }
      }
    });

    // Update document language
    document.documentElement.lang = currentLang;
    updateLanguageButton();
  }

  // Toggle language function
  window.toggleLanguage = function() {
    console.log('Language toggle clicked, current:', currentLang);
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    localStorage.setItem('click-language', currentLang);
    translatePage();
    console.log('Language switched to:', currentLang);
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing i18n with language:', currentLang);
    translatePage();
  });

  // Also update button text initially
  updateLanguageButton();
})();
