/**
 * Bind button events based on CSS classes, pause tree when hidden
 *
 * This handler enables behavioural CSS classes to control the tour, for example:
 *
 *     <div class="tour">
 *       <div class="container" data-ott="770315">
 *         ... Tour stop HTML ...
 *         <div class='footer'>
 *           <span class='button tour_backward'>← {{=T('Previous')}}</span>
 *           <span class='button tour_resume'>{{=T('Resume tutorial')}}</span>
 *           <span class='button tour_exit'>{{=T('Exit tutorial')}}</span>
 *           <span class='button tour_forward'>{{=T('Skip')}} →</span>
 *         </div>
 *       </div>
 *     </div>
 *
 * On clicking ``tour_backward`` / ``tour_forward``, the tour will go backwards/forwards.
 * On clicking ``tour_exit``, the tour will close.
 *
 * When the tour is paused (e.g. as a result of user interaction) the ``tour_resume`` button will be visible,
 * clicking it will resume the tour.
 *
 * Note that these buttons have to be added to every tourstop. A template include,
 * ``{{ include "tour/tourstop/footer.html" }}`` exists to make this easier.
 *
 * When the document is on a hidden tab, a block will be added to tourstops, so we do not advance from the current tourstop.
 */
function handler(tour) {
  const document = tour.container[0].ownerDocument;

  tour.container.click((e) => {
    var target = $(e.target).closest('.tour_forward,.tour_backward,.tour_play,.tour_pause,.tour_resume,.tour_exit,.exit_confirm,.exit_cancel');

    if (target.length === 0) return;
    if (target.hasClass('tour_forward')) return tour.user_forward()
    if (target.hasClass('tour_backward')) return tour.user_backward()
    if (target.hasClass('tour_play')) return tour.user_play()
    if (target.hasClass('tour_pause')) return tour.user_pause()
    if (target.hasClass('tour_resume')) return tour.user_resume()
    if (target.hasClass('tour_exit')) return tour.user_exit()
    if (target.hasClass('exit_confirm')) {
      tour.exit_confirm_popup.hide()
      return tour.user_exit()
    }
    if (target.hasClass('exit_cancel')) {
      tour.exit_confirm_popup.hide()
      return tour.user_resume()
    }
  })

  // Resize tourstop containers when grabbed by handles
  var downInit = null;
  const onMouseMove = (event) => {
    if (!downInit) return;
    var y = event.touches ? event.touches[0].screenY : event.screenY;
    downInit.tourstop.style.height = Math.max(downInit.offset - y, 50) + 'px';
  };
  const onMouseUp = (event) => {
    if (event.touches) {
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      document.removeEventListener('touchcancel', onMouseUp);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    if (downInit.tourstop.offsetHeight < 50) {
      tour.user_exit();
    }
    downInit = null;
  };
  const onMouseDown = (event) => {
    if (event.target.classList.contains('handle')) {
      var container = event.target.closest('.container');
      var y = event.touches ? event.touches[0].screenY : event.screenY;
      downInit = {target: event.target, tourstop: container, offset: container.offsetHeight + y};

      if (event.touches) {
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
        document.addEventListener('touchcancel', onMouseUp);
      } else {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }
  };
  tour.container[0].addEventListener('mousedown', onMouseDown);
  tour.container[0].addEventListener('touchstart', onMouseDown);
  tour.tourstop_observer('*', '*', (tour, tourstop, el_ts) => {
    // Reset tourstop height after any state change
    el_ts.style.height = '';
  });

  // Listen to document level visibility (read: inactive tab), translate to tourstop blocks
  const onVisibilityChange = (e) => {
    tour.tourstop_array.forEach((ts) => {
      ts.block_toggle('hiddentab', document.visibilityState !== 'visible');
    });
  };
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

export default handler;
