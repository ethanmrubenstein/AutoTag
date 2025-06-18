const muteButton = document.getElementById("mute-button");
const tagResponse = document.getElementById("tagResponse");

// Global Audio Manager
let globalAudio = null;
let isMuted = false;

function playSound(src) {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }

  globalAudio = new Audio(src);
  globalAudio.muted = isMuted;
  globalAudio.play();
}

// Mute Button
muteButton.addEventListener("click", () => {
  const wasActive = muteButton.classList.contains("active");

  muteButton.classList.toggle("active");
  muteButton.classList.toggle("fa-volume-high");
  muteButton.classList.toggle("fa-volume-xmark");

  if (wasActive) {
    muteButton.title = "Unmute Sounds";
    isMuted = true;
  } else {
    muteButton.title = "Mute Sounds";
    isMuted = false;
  }

  if (globalAudio) {
    globalAudio.muted = isMuted;
  }
});

function runTag(event) {
  playSound("../audio/CHIMES.WAV");
  alprData = JSON.parse(event.data);

  // Optional: display on page
  // document.getElementById("output").textContent = JSON.stringify(
  //   alprData,
  //   null,
  //   2
  // );

  // Set Tag Text
  document.getElementById("plateNumber").textContent =
    alprData?.plate.toUpperCase();

  // Set Tag Image
  const base64String = alprData?.plate_crop;
  document.getElementById(
    "plateImage"
  ).src = `data:image/jpeg;base64,${base64String}`;

  // Textarea Variables
  let style;
  if (alprData.content.vin_data.VehicleType === "PASSENGER CAR") {
    if (alprData.content.vin_data.Doors) {
      style = alprData.content.vin_data.Doors + "D";
    } else {
      style = "UNK";
    }
  } else {
    style = alprData.content.vin_data.VehicleType;
  }

  let trim;

  const trim1 = alprData.content.vin_data.Trim?.trim();
  const trim2 = alprData.content.vin_data.Trim2?.trim();

  if (trim1 && trim2) {
    trim = `${trim1} - ${trim2}`;
  } else if (trim1) {
    trim = trim1;
  } else if (trim2) {
    trim = trim2;
  } else {
    trim = "UNK";
  }

  // Set Textarea
  tagResponse.innerHTML = `--DMVR--
  DHSMV RECORD -
  ${alprData.content.plate}    ${alprData.content.vin} ${
    alprData.content.make
  } ${alprData.content.model}    ${style}    ${alprData.content.year}

  TRM: ${trim}    BDY: ${alprData.content.vin_data.BodyClass}    ENG: ${
    alprData.content.vin_data.EngineManufacturer
  } ${alprData.content.vin_data.DisplacementL}L ${
    alprData.content.vin_data.EngineConfiguration === "V-Shaped"
      ? "V"
      : alprData.content.vin_data.EngineConfiguration + " "
  }${alprData.content.vin_data.EngineCylinders} ${
    alprData.content.vin_data.EngineModel
  }
  MFR: ${alprData.content.vin_data.Manufacturer}
  `;
}

// Webhook
let alprData = null;

const source = new EventSource("https://autotag-5icr.onrender.com/events");

source.onmessage = (event) => {
  runTag(event);
};

source.onerror = (err) => {
  console.error("SSE error:", err);
};
