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
  time: 0,
  packetInfo: {
    format: 'playerState_v1',
    source: 'biketerra',
    seqNo: 0,
}
};


// define a flag to control sending the playerState object using websocket

let sendPlayerStateUpdates = false;


// define a timeout to reset the sendPlayerStateUpdates flag to false after a period of inactivity

const DEFAULT_INACTIVITY_TIMEOUT = 30; // 30 seconds of inactivity
let inactivityTimeoutSetting = DEFAULT_INACTIVITY_TIMEOUT;
// get the inactivity timeout from the options page
chrome.storage.sync.get(["inactivityTimeoutSetting"], (result) => {
  inactivityTimeoutSetting = 1000 * (result.inactivityTimeoutSetting ?? DEFAULT_INACTIVITY_TIMEOUT);
});

let playerStateTimeout;
resetPlayerStateTimeout()


// define a interval to send the playerState object using websocket 
// every half second (500ms) if sendPlayerStateUpdates is true

const DEFAULT_SEND_INTERVAL = 500; // 500ms

let sendIntervalSetting;
// get the send interval from the options page
chrome.storage.sync.get(["sendIntervalSetting"], (result) => {
  sendIntervalSetting = result.sendIntervalSetting ?? DEFAULT_SEND_INTERVAL;
});

setInterval(() => {
  if (sendPlayerStateUpdates) {

    let data = JSON.stringify(playerState);

    chrome.storage.session.set({ playerState: data }).then(() => {
      // console.log("Value was set: ", data);
    });

    playerState.packetInfo.seqNo++;
    // console.log('seqNo', playerState.packetInfo.seqNo);
    sendData(data);
  }
}, send);


// listen for messages from the content script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // console.log("onMessage in background.js", message);

  if (message.action === 'elementChanged') {

    // console.log('elementChanged', message.data);

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
        playerState.speed = 1000 * 1000 * (parseFloat(message.data.value) ?? 0);  // mm/s
        break;

      case 'distance':
        playerState.distance = 1000 * parseFloat(message.data.value) ?? 0; // m
        break;

      case 'elevation':
        playerState.climbing = parseFloat(message.data.value) ?? 0; // m
        break;
        
      case 'gradient':
        playerState.gradient = parseFloat(message.data.value) ?? 0; // %
        break;
        
      case 'time':
        playerState.time = parseInt(message.data.value) ?? 0; // s
        break;
        
      default:
        break;
    }

    // console.log(playerState);

  }
});


// Function to reset the inactivity timer
function resetPlayerStateTimeout() {
  // console.log('resetPlayerStateTimeout');
  if (playerStateTimeout) {
    clearTimeout(playerStateTimeout);
  }
  playerStateTimeout = setTimeout(setSendPlayerStateUpdatesFalse, inactivityTimeoutSetting ?? DEFAULT_INACTIVITY_TIMEOUT);
}

function setSendPlayerStateUpdatesFalse() {
  sendPlayerStateUpdates = false;
} 

function setStatus(status, notificationId = null) {
  chrome.storage.session.set({ socketStatus: status }).then(() => {
    // console.log("Value was set: ", data);
  });
  if (notificationId) {
    chrome.notifications.create(
      notificationId,
      {
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Error",
        message:
          status,
      },
      notificationCallback
    );
  }
  console.log(
    status
  );
}

let inactivityTimeout;
const INACTIVITY_PERIOD = 30000; // 30 seconds of inactivity

// Function to open the WebSocket connection
function openSocket() {
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    chrome.storage.sync.get(["websocketAddress"], (result) => {
      const address = result.websocketAddress;
      if (!address) {
        // setStatus("WebSocket address not set. Please set it in the options page.", "biketerra.extension.notification.ws-address-error");
        setStatus("WebSocket address not set. Please set it in the options page.");
        return;
      }

      socket = new WebSocket(address);

      socket.onopen = () => {
        // console.log("WebSocket connection opened");
        setStatus("WebSocket connection opened");
    
        resetInactivityTimer();
        
      };

      socket.onclose = () => {
        // console.log("WebSocket connection closed");
      };

      socket.onerror = (error) => {
        // console.log(error);
        // setStatus("WebSocket error: " + error, "biketerra.extension.notification.ws-other-error");
        setStatus("WebSocket error");
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


// ---

function notificationCallback() {
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message);
  } else {
    // 
  }
}