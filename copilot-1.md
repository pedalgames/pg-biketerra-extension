### Plan

1. **Create the Manifest File**: Define the extension's metadata and permissions.
2. **Create the Content Script**: Write a script to read content from `biketerra.com` and subscribe to changes in elements with class [`hud`](command:_github.copilot.openSymbolFromReferences?%5B%22hud%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A71%2C%22character%22%3A30%7D%7D%5D%5D "Go to definition") or [`info`](command:_github.copilot.openSymbolFromReferences?%5B%22info%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A71%2C%22character%22%3A36%7D%7D%5D%5D "Go to definition").
3. **Create the Background Script**: Handle broadcasting changes using WebSocket.
4. **Create the Popup HTML and JS**: Provide a user interface for the extension.
5. **Create the Options HTML and JS**: Allow the user to set the WebSocket address, defaulting to [`ws://localhost:8080`](command:_github.copilot.openSymbolFromReferences?%5B%22ws%3A%2F%2Flocalhost%3A8080%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A85%2C%22character%22%3A50%7D%7D%5D%5D "Go to definition").

### Step-by-Step

1. **manifest.json**: Define the extension's metadata and permissions.
2. **content.js**: Script to read content from `biketerra.com` and subscribe to changes.
3. **background.js**: Handle broadcasting changes using WebSocket.
4. **popup.html**: HTML for the popup interface.
5. **popup.js**: JavaScript for the popup interface.
6. **options.html**: HTML for the options page.
7. **options.js**: JavaScript for the options page.

### Code

#### manifest.json
```json
{
  "manifest_version": 3,
  "name": "BikeTerra Content Reader",
  "version": "1.0",
  "description": "Reads content from biketerra.com and broadcasts changes using WebSocket",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["*://*.biketerra.com/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "options_page": "options.html"
}
```

#### content.js
```javascript
// content.js
function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({ action: 'elementChanged', data });
}

function observeChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        sendMessageToBackground(mutation.target.innerText);
      }
    });
  });

  const config = { attributes: true, childList: true, subtree: true };

  document.querySelectorAll('.hud, .info').forEach((element) => {
    observer.observe(element, config);
  });
}

document.addEventListener('DOMContentLoaded', observeChanges);
```

#### background.js
```javascript
// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'elementChanged') {
    chrome.storage.sync.get(['websocketAddress'], (result) => {
      const address = result.websocketAddress;
      if (!address) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'WebSocket Error',
          message: 'WebSocket address not set. Please set it in the options page.'
        });
        return;
      }
      const data = message.data;
      const socket = new WebSocket(address);

      socket.onopen = () => {
        socket.send(data);
        socket.close();
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error: ', error);
      };
    });
  }
});
```

#### popup.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>BikeTerra Content Reader</title>
  <script src="popup.js"></script>
</head>
<body>
  <h1>BikeTerra Content Reader</h1>
  <div id="content"></div>
</body>
</html>
```

#### popup.js
```javascript
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
```

#### options.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>Extension Options</title>
  <script src="options.js"></script>
</head>
<body>
  <h1>Extension Options</h1>
  <label for="websocketAddress">WebSocket Address:</label>
  <input type="text" id="websocketAddress" placeholder="ws://localhost:8080" />
  <button id="save">Save</button>
</body>
</html>
```

#### options.js
```javascript
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
```

### Icons
- Create icons of sizes 16x16, 48x48, and 128x128 and place them in an `icons` directory.

### Directory Structure
```
BikeTerraContentReader/
├── manifest.json
├── content.js
├── background.js
├── popup.html
├── popup.js
├── options.html
├── options.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

This setup will create a Chrome extension that reads content from `biketerra.com`, subscribes to changes in elements with class [`hud`](command:_github.copilot.openSymbolFromReferences?%5B%22hud%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A71%2C%22character%22%3A30%7D%7D%5D%5D "Go to definition") or [`info`](command:_github.copilot.openSymbolFromReferences?%5B%22info%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A71%2C%22character%22%3A36%7D%7D%5D%5D "Go to definition"), and broadcasts the changes using WebSocket. The WebSocket address is a mandatory user setting, defaulting to [`ws://localhost:8080`](command:_github.copilot.openSymbolFromReferences?%5B%22ws%3A%2F%2Flocalhost%3A8080%22%2C%5B%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22z%3A%5C%5Csrc%5C%5Cbiketerra-extension%5C%5Ccopilot-1.md%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fz%253A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22path%22%3A%22%2FZ%3A%2Fsrc%2Fbiketerra-extension%2Fcopilot-1.md%22%2C%22scheme%22%3A%22file%22%7D%2C%22pos%22%3A%7B%22line%22%3A85%2C%22character%22%3A50%7D%7D%5D%5D "Go to definition") in the options page. If the WebSocket address is not set, the extension will not broadcast and will show an error message to the user.