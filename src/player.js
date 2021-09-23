const isDRMEnabled = true;
const manifestUri = isDRMEnabled
  ? "../manifest/drm/dash.mpd"
  : "../manifest/nodrm/dash.mpd";

function initApp() {
  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error("Browser not supported!");
  }
}

async function initPlayer() {
  // Create a Player instance.
  const video = document.getElementById("video");
  const player = new shaka.Player(video);

  if (isDRMEnabled) {
    player.configure({
      drm: {
        clearKeys: {
          // 'key-id-in-hex': 'key-in-hex',
          a7e61c373e219033c21091fa607bf3b8: "76a6c65c5ea762046bd749a2e632ccbb",
        },
      },
    });
  }

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener("error", onErrorEvent);

  // Try to load a manifest.
  // This is an asynchronous process.
  try {
    await player.load(manifestUri);
    // This runs if the asynchronous load is successful.
    console.log("The video has now been loaded!");
  } catch (e) {
    // onError is executed if the asynchronous load fails.
    onError(e);
  }
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error("Error code", error.code, "object", error);
}

document.addEventListener("DOMContentLoaded", initApp);
