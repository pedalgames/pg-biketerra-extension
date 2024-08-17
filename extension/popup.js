// popup.js
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: () => document.body.innerText
      },
      (results) => {
        if (results && results[0]) {
          document.getElementById('content').innerText = results[0].result;
        }
      }
    );
  });
});