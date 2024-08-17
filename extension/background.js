// background.js


let socket;


// define a playerState object to store the data
let playerState = {
  power: 0,
  heartrate: 0,
  cadence: 0,
  speed: 0,
  distance: 0,
  climbing: 0,
  packetInfo: {
    source: 'biketerra',
    seqNo: 0,
}
};


// define a flag to control sending the playerState object using websocket

let sendPlayerStateUpdates = false;

// define a timeout to reset the sendPlayerStateUpdates flag to false after a period of inactivity

let playerStateTimeout;
const PLAYERSTATE_TIMEOUT = 30000; // 30 seconds of inactivity
resetPlayerStateTimeout()

// define a interval to send the playerState object using websocket 
// every half second (500ms) if sendPlayerStateUpdates is true

setInterval(() => {
  if (sendPlayerStateUpdates) {
    playerState.packetInfo.seqNo++;
    console.log('seqNo', playerState.packetInfo.seqNo);
    // sendData(JSON.stringify(playerState));
  }
}, 500);


// listen for messages from the content script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'elementChanged') {

    console.log('elementChanged', message.data);

    resetPlayerStateTimeout();
    sendPlayerStateUpdates = true;

    switch (message.data.datatype) {
      case 'power':
        playerState.power = parseInt(message.data.value) ?? 0;
        break;
    
      case 'hr':
        playerState.heartrate = parseInt(message.data.value) ?? 0;
        break;

      case 'cadence':
        playerState.cadence = parseInt(message.data.value) ?? 0;
        break;  

      case 'speed':
        playerState.speed = parseFloat(message.data.value) ?? 0;
        break;

      case 'distance':
        playerState.distance = parseFloat(message.data.value) ?? 0;
        break;

      case 'elevation':
        playerState.climbing = parseFloat(message.data.value) ?? 0;
        break;
        
      default:
        break;
    }

    console.log(playerState);

  }
});


// Function to reset the inactivity timer
function resetPlayerStateTimeout() {
  console.log('resetPlayerStateTimeout');
  if (playerStateTimeout) {
    clearTimeout(playerStateTimeout);
  }
  playerStateTimeout = setTimeout(setSendPlayerStateUpdatesFalse, PLAYERSTATE_TIMEOUT);
}

function setSendPlayerStateUpdatesFalse() {
  sendPlayerStateUpdates = false;
} 

let inactivityTimeout;
const INACTIVITY_PERIOD = 30000; // 30 seconds of inactivity

// Function to open the WebSocket connection
function openSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    chrome.storage.sync.get(["websocketAddress"], (result) => {
      const address = result.websocketAddress;
      if (!address) {
        chrome.notifications.create(
          "biketerra.extension.notification.ws-address-error",
          {
            type: "basic",
            // iconUrl: "icons/icon48.png",
            title: "WebSocket Error",
            message:
              "WebSocket address not set. Please set it in the options page.",
          },
          notificationCallback
        );
        console.log(
          "WebSocket address not set. Please set it in the options page."
        );
        return;
      }

      socket = new WebSocket(address);

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        resetInactivityTimer();
        
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      socket.onerror = (error) => {
        chrome.notifications.create(
          "biketerra.extension.notification.ws-other-error",
          {
            type: "basic",
            // iconUrl: "icons/icon48.png",
            title: "WebSocket Error",
            message: error.message,
          },
          notificationCallback
        );
        console.error("WebSocket Error: ", error);
      };
    });
  }
}

// Function to send data and reset the inactivity timer
function sendData(data) {
  openSocket();


  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(data);
    resetInactivityTimer();
  } 
  // otherwise the data is lost and will never be sent


  // else {
  //   socket.onopen = () => {
  //     socket.send(data);
  //     resetInactivityTimer();
  //   };
  // }
}

// Function to reset the inactivity timer
function resetInactivityTimer() {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  inactivityTimeout = setTimeout(closeSocket, INACTIVITY_PERIOD);
}

// Function to close the WebSocket connection after inactivity period
function closeSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }

  // also stop sending data
  sendPlayerStateUpdates = false;
}


// chrome.notifications.create(
//   'biketerra.extension.notification.sample-notification',
//   {
//     type: 'basic',
//     iconUrl: 'icons/icon48.png',
//     title: 'Sample notification',
//     message: 'Just a test'
//   }
// );



// ---

function notificationCallback() {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message);
  } else {
    // 
  }
}