console.log('background.js loaded!!')
chrome.action.onClicked.addListener((tab) => {
    console.log('action clicked!!')
    chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['content.js'],
    })

    chrome.scripting.insertCSS({
        target: { tabId: tab.id! },
        files: ['content.css'],
    })

    const RULE = {
        id: 1,
        condition: {
            initiatorDomains: [chrome.runtime.id],
            resourceTypes: ['sub_frame'],
        },
        action: {
            type: 'modifyHeaders',
            responseHeaders: [
                { header: 'X-Frame-Options', operation: 'remove' },
                { header: 'Frame-Options', operation: 'remove' },
                // Uncomment the following line to suppress `frame-ancestors` error
                { header: 'Content-Security-Policy', operation: 'remove' },
            ],
        },
    }
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE.id],
        addRules: [RULE as any],
    })
})
