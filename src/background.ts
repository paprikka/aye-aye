console.log("background.js loaded!!");
chrome.action.onClicked.addListener((tab) => {
  console.log("action clicked!!");
  chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    files: ["content.js"],
  });

  chrome.scripting.insertCSS({
    target: { tabId: tab.id! },
    files: ["content.css"],
  });
});
