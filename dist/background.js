console.log("background.js loaded!!");chrome.action.onClicked.addListener(e=>{console.log("action clicked!!"),chrome.scripting.executeScript({target:{tabId:e.id},files:["content.js"]}),chrome.scripting.insertCSS({target:{tabId:e.id},files:["content.css"]})});
//# sourceMappingURL=background.js.map
