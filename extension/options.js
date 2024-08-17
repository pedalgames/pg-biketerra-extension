// options.js
document.addEventListener('DOMContentLoaded', () => {
  const websocketAddressInput = document.getElementById('websocketAddress');
  const saveButton = document.getElementById('save');

  // Load saved WebSocket address
  chrome.storage.sync.get(['websocketAddress'], (result) => {
    if (result.websocketAddress) {
      websocketAddressInput.value = result.websocketAddress;
    } else {
      websocketAddressInput.value = 'ws://localhost:8080';
    }
  });

  // Save WebSocket address
  saveButton.addEventListener('click', () => {
    const websocketAddress = websocketAddressInput.value;
    chrome.storage.sync.set({ websocketAddress }, () => {
      alert('WebSocket address saved!');
    });
  });
});