/**
 * Support Vimeo videos in tourstops
 * https://developer.vimeo.com/player/sdk/basics
 */
function handler(tour) {
  const el_videos = Array.from(tour.container[0].querySelectorAll(":scope iframe.embed-vimeo"));

  // No vimeo, stop here.
  if (el_videos.length === 0) return;

  // Add reference to tourstop from embedded iframe
  el_videos.forEach((el_video) => {
    el_video.el_tourstop = el_video.closest('.tour > .container');
    el_video.el_tourstop.classList.add('contains-vimeo');
  });

  return new Promise((resolve) => {
    if (window.Vimeo) {
      // Vimeo API already loaded, nothing to do
      resolve();
    } else {
      // Load Vimeo API into current document
      var tag = document.createElement('script');
      tag.src = "https://player.vimeo.com/api/player.js";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Poll until Vimeo is available. Doesn't seem to be an async option
      let count = 0;
      const intervalId = setInterval(() => {
        console.log("Waiting for Vimeo");
        if (window.Vimeo) {
          clearTimeout(intervalId);
          resolve();
        } else if (count++ > 100) {
          clearTimeout(intervalId);
          throw new Error("Timeout waiting for vimeo to load");
        }
      }, 100);
    }
  }).then(() => {
    // Create a new player object for every existing iframe & block progression when playing
    return el_videos.forEach((el_video) => {
      el_video.vimeoplayer = new Vimeo.Player(el_video);
      el_video.vimeoplayer.on('play', function (data) {
        const tourstop = this.element.el_tourstop.tourstop;
        const block_name = this.element.src;

        tourstop.block_add(block_name);
      });
      el_video.vimeoplayer.on('ended', function (data) {
        const tourstop = this.element.el_tourstop.tourstop;
        const block_name = this.element.src;
        
        tourstop.block_remove(block_name);
      });
    })
  }).then(() => {
    // Attach observers for any autoplaying video
    tour.tourstop_observer(
      ".contains-vimeo",
      ['tsstate-active_wait'],
      function (tour, el_ts) {
        // Start video playing,
        el_ts.querySelectorAll(":scope iframe.embed-vimeo").forEach((el_video) => {
          el_video.vimeoplayer.play();
        });
      },
      function (tour, el_ts) {
        // Leaving tourstop, stop any video & rewind
        el_ts.querySelectorAll(":scope iframe.embed-vimeo").forEach((el_video) => {
          el_video.vimeoplayer.pause();
          el_video.vimeoplayer.setCurrentTime(0);
        });
      },
    );
  });
}

export default handler;
