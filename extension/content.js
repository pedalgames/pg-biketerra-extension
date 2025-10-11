// content.js
function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({ action: "elementChanged", data });
}

const SIM = false;

if (SIM) {
  setInterval(() => {
    sendMessageToBackground({
      datatype: "power",
      value: 150 + Math.floor(Math.random() * 10),
      unit: "W",
    });
    sendMessageToBackground({
      datatype: "hr",
      value: 130 + Math.floor(Math.random() * 10),
      unit: "bpm",
    });
  }, 1_000);
}

const TEST = true;

if (TEST) {
  let page = window.location.href;

  setInterval(() => {
    console.log("alive at " + page + " (showing " + window.location.href + ")");
  }, 2_000);
}

function observeChanges() {
  // console.log("observeChanges");
  // console.log(document.querySelectorAll(".stat-value, .hud-stat"));
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // if (mutation.type === 'childList' || mutation.type === 'attributes') {
      if (mutation.type === "characterData") {
        // if ((mutation.target.parentNode.className !== 'debug') && mutation.target?.classList?.contains('stat-value')) {
        // if ((mutation.target.parentNode.className !== 'debug')) {
        if (mutation.target.parentNode?.classList?.contains("stat-value") || mutation.target.parentNode?.classList?.contains("hud-stat")) {
          // console.log(mutation);
          // let value = mutation.target.innerText;
          let value = mutation.target.nodeValue;

          let unit = "";
          let datatype = "";

          let unitNode = mutation.target.parentNode?.nextElementSibling;
          let unitHTML = unitNode?.innerHTML ?? "";
          console.log("unitHTML:", unitHTML);

          if (unitNode?.classList?.contains('ico-hr') || unitHTML.includes("ico-hr")) {
            datatype = "hr";
            unit = "bpm";
          }

          if (unitNode?.classList?.contains('ico-cadence') || unitHTML.includes("ico-cadence")) {
            datatype = "cadence";
            unit = "rpm";
          }

          if (unitNode?.classList?.contains('ico-power') || unitHTML.includes("ico-power")) {
            datatype = "power";
            unit = "W";
          }

          if (unitHTML.includes("kph")) {
            datatype = "speed";
            unit = "kmh";
          }

          if (unitHTML.includes("mph")) {
            datatype = "speed";
            unit = "mph";
          }

          if (unitHTML == "km") {
            datatype = "distance";
            unit = "km";
          }

          if (unitHTML == "mi") {
            datatype = "distance";
            unit = "mi";
          }

          if (unitHTML == "m") {
            datatype = "elevation";
            unit = "m";
          }

          if (unitHTML == "ft") {
            datatype = "elevation";
            unit = "ft";
          }

          // if (unitHTML.includes("%")) {
          //   datatype = "gradient";
          //   unit = "%";
          // }

          if (TEST) {
            console.log(datatype, value, unit);
          }

          sendMessageToBackground({
            datatype: datatype,
            value: value,
            unit: unit,
          });
        } else if (mutation.target.parentNode?.classList?.contains("stat-circle-value")) {
          console.log(mutation);
          // let value = mutation.target.innerText;
          let value = mutation.target.nodeValue;

          let unit = "";
          let datatype = "";
          
          if (mutation.target.parentNode.closest('stat-circle')?.classList?.contains("stat-grade")) {
            datatype = "gradient";
            unit = "%";
          } else if (mutation.target.parentNode.closest('stat-circle')?.classList?.contains("stat-draft")) {
            datatype = "draft";
            unit = "W";
          }

          console.log(datatype, value, unit);
          if (datatype != "") {
            sendMessageToBackground({
              datatype: datatype,
              value: value,
              unit: unit,
            });
          }
        } else if (mutation.target.parentNode?.classList?.contains("activity-timer-time")) {
          // console.log(mutation);
          let timerText = mutation.target.nodeValue;

          // timerText has format 'mm:ss' or 'h:mm:ss'
          // normalize the timer text to always have hours, minutes and seconds
          if (timerText.length === 5) {
            timerText = '00:' + timerText;
          }

          let [hours, minutes, seconds] = timerText.split(":").map((x) => parseInt(x));
          // console.log(hours, minutes, seconds);
          let value = hours * 3600 + minutes * 60 + seconds;

          datatype = "time";
          unit = "s";


          // console.log(datatype, value, unit);
          sendMessageToBackground({
            datatype: datatype,
            value: value,
            unit: unit,
          });
        }
      }
    });
  });

  const config = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
  };

  observer.observe(document, config);
}

function toggleUI() {
  // console.log("toggleUI");
  let hudLeft = document.querySelector('#app .hud-left');
  let hudBottom = document.querySelector('#app .hud-bottom');
  let hudRight = document.querySelector('#app .hud-right');
  if (hudLeft) hudLeft.style.display = hudLeft.style.display === 'none' ? '' : 'none';
  if (hudBottom) hudBottom.style.display = hudBottom.style.display === 'none' ? '' : 'none';
  if (hudRight) hudRight.style.display = hudRight.style.display === 'none' ? '' : 'none';
}


// listen for message 'toggleUI' from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log("onMessage in content.js", request);
  if (request.action === "toggleUI") {
    toggleUI();
  }
});


// console.log("content.js");
// console.log(document.querySelectorAll(".stat-value"));

// detect when the page is fully loaded and then start observing changes
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  observeChanges();
});
