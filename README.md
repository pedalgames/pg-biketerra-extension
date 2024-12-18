# Chrome extension for Biketerra x Pedal Games support



## How to install




To install the Chrome extension, follow these steps:

1. **Prepare the Extension Directory**:
   - Ensure all files (`manifest.json`, `content.js`, `background.js`, `popup.html`, `popup.js`, `options.html`, `options.js`, and the `icons` folder) in the source `extension` folder are put in a single folder
   - single folder on your harddisk, e.g., `BiketerraContentReader.

2. **Open Chrome Extensions Page**:
   - Open Google Chrome.
   - Navigate to [`chrome://extensions/`].

3. **Enable Developer Mode**:
   - In the top right corner, toggle the switch to enable "Developer mode".

4. **Load Unpacked Extension**:
   - Click on the "Load unpacked" button.
   - Select the directory where your extension files are located ([`BiketerraContentReader`]).

5. **Verify the Extension**:
   - Ensure the extension appears in the list with no errors.
   - If there are errors, click on "Errors" to see the details and fix them accordingly.

6. **Test the Extension**:
   - Open a new tab and navigate to [`biketerra.com`].
   - Open the extension popup by clicking on the extension icon in the Chrome toolbar.
   - Verify that the content is being read and displayed correctly.
   - Go to the extension options page by right-clicking the extension icon and selecting "Options".
   - Set the WebSocket address and save it.

### Additional Tips

- **WebSocket Server**:
  - Ensure you have a WebSocket server running at the address you set in the options page to receive the broadcasted messages.
  - The default address and port for the WebSocket server in Pedal Games is ``localhost:49998``.

