// popup.js
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.session.get(["playerState"]).then((result) => {
    document.getElementById('content').innerText = result.playerState ?? '--';
  });
  chrome.storage.session.get(["socketStatus"]).then((result) => {
    document.getElementById('websocketStatus').innerText = result.socketStatus ?? '--';
  });
  chrome.storage.session.onChanged.addListener((changes) => {
    document.getElementById('content').innerText = changes.playerState.newValue ?? '--';
    document.getElementById('websocketStatus').innerText = changes.socketStatus.newValue ?? '--';
  });

  document.getElementById('toggleUI').addEventListener('click', () => {
    // console.log('toggleUI clicked');
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      let activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"action": "toggleUI"});
  });
  });
});

