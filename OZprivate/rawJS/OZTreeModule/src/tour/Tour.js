import TourStopClass from './TourStop'
import tree_state from '../tree_state';
import { add_hook, remove_hook } from '../util';

let tour_id = 1
const Interaction_Action_Arr = ['mouse_down', 'mouse_wheel', 'touch_start', 'touch_move', 'touch_end']

class Tour {
  constructor(onezoom) {
    this.tour_id = tour_id++
    this.onezoom = onezoom // enabling access to controller
    this.curr_step = 0
    this.prev_step = null
    this.tourstop_array = []
    this.started = false
    this.name = null
    this.callback_timers = [] // To store any timers that are fired off by callbacks, so they can be cancelled if necessary

    this.wrapper_id = 'tour_wrapper';
    this.div_wrapper = document.getElementById(this.wrapper_id);
    if (!this.div_wrapper) {
      console.error(
        'Expected to have a tour container with id:' + this.wrapper_id + ', but none found'
      )
    }
  }

  /**
   * Give an example of a tour_settings object
   * @param {boolean} as_json return a JSON string rather than a javascript object
   * @return {(Object|String)} An example of the tour settings object
   */
  example(as_json = false) {
    // TODO:
  }


  /**
   * Create tour stops based on a settings object (which could be parsed from JSON)
   * All arguments are optional, although if tour_setting is empty, the tour is treated
   * as inactive.
   * The primary parameters that structure the tour are in the settings_object, including
   * details of the stops, paths to html templates, etc.
   *
   * @param {String} tour_setting A string specifying where to fetch the tour document from,
   *    or TextContent node containing a tour HTML string
   * @param {String} name A unique name for this tour for help in indentification. This
   *    name is added as a class to each tourstop. If null, the name is automatically set
   *    to tour_1, tour_2, etc.
   * @param {function} start_callback A function to run before the tour starts, defaults
   *    to onezoom.config.ui.closeAll().
   * @param {function} end_callback A function to run at the natural end of the tour 
   * @param {function} exit_callback A function to run at if the tour is exited prematurely
   * @param {String} interaction What to do when the user interacts with the onezoom
   *    instance, e.g. by moving the mouse on screen.
   *    - "block": disable interaction
   *    - "exit": interaction causes tour exit
   *    - "exit_after_confirmation": interaction causes tour exit, but user must confirm first
   *    - null: interaction permitted, tour pauses but can be resumed (default)
   * @param {function} interaction_callback Function to call when the user interacts with
   *    the onezoom instance, e.g. by moving the mouse on screen, e.g. to activate a resume 
   *    button if the tour is set to pause on interaction
   * @param {function} ready_callback Function to call when the tour is ready to go (in
   *    particular, we have the mappings from OTT-> onezoom IDs ready
   */
  setup_setting(tour_setting, name, start_callback, end_callback, exit_callback,
                interaction, interaction_callback, ready_callback) {
    this.name = name || "tour_" + tour_id
    if (!tour_setting) {return}
    this.tourstop_array = []
    this.curr_step = 0
    this.prev_step = null

    this.start_callback = start_callback !== undefined ? start_callback : onezoom.config.ui.closeAll()
    this.end_callback = end_callback
    this.exit_callback = exit_callback
    this.interaction = interaction
    this.interaction_callback = interaction_callback
    this.ready_callback = ready_callback
    this.interaction_hooks = {} // when we add interaction hooks, we store the ids here so we can remove them later

    this.tour_loaded = new Promise((resolve) => this.resolve_tour_loaded = resolve);

    if (tour_setting instanceof window.Text) {
      // HTML TextObject (i.e. the content of a script tag), render that as our tour
      this.load_tour_from_string(tour_setting.textContent);
    } else {
      // Assume URL, fetch and render
      return $.ajax({ url: tour_setting, dataType: "html", success: this.load_tour_from_string.bind(this) });
    }
  }

  /**
   * Add the tour HTML to our page and configure ourselves accordingly
   */
  load_tour_from_string(tour_html_string) {
    var old_loading_tour = window.loading_tour;
    window.loading_tour = this;
    let tour_div = $(tour_html_string);
    tour_div.appendTo(this.div_wrapper)
    window.loading_tour = old_loading_tour;

    this.tourstop_array = [].map.call(tour_div[0].querySelectorAll(':scope > .container'), (div_tourstop) => {
      let ts = new TourStopClass(this, $(div_tourstop));
      this.bind_template_ui_event(ts);
      return ts;
    });
    this.exit_confirm_popup = tour_div.children('.exit_confirm')
    this.exit_confirm_popup.hide();

    this.load_ott_id_conversion_map(this.ready_callback)
    this.resolve_tour_loaded()
    if (window.is_testing) console.log("Loaded tour")
  }

  add_canvas_interaction_callbacks() {
    let fn;

    /** 
     * Add hooks called when the user interacts with the onezoom canvas
     */
    if (this.interaction_hooks.length) {return} // hooks already added: don't add again

    if (this.interaction == null) {
      /**
       * Default behaviour: pause tour on interaction
       */
      fn = () => this.user_pause()
    } else if (this.interaction === 'exit') {
      /**
       * Exit tour after interaction
       */
      fn = () => this.user_exit()
    } else if (this.interaction === 'exit_after_confirmation') {
      /**
       * Exit tour after interaction & confirmation
       */
      fn = () => { this.user_pause() ; this.exit_confirm_popup.show() }
    } else if (this.interaction === 'block') {
      /**
       * Block: Stop any other interaction happening
       * (NB: any custom interaction will happen first)
       */
      fn = () => false
    } else if (this.interaction === 'block_on_flight') {
      /**
       * Block during flight, otherwise pause tour
       */
      fn = () => {
          if (tree_state.flying) return false;
          this.user_pause()
      }
    } else {
      throw new Error("Unknown value of interaction setting: " + this.interaction)
    }

    if (window.is_testing) console.log("Adding canvas hooks")
    Interaction_Action_Arr.forEach(action_name => {
        if (typeof this.interaction_callback === 'function') {
            // Add the user's interaction callback as well
            this.interaction_hooks[action_name + '_custom'] = add_hook(action_name, this.interaction_callback)
        }
        this.interaction_hooks[action_name] = add_hook(action_name, fn)
    })
  }

  remove_canvas_interaction_callbacks() {
    for (let action_name in this.interaction_hooks) {
      remove_hook(action_name, this.interaction_hooks[action_name])
    }
  }

  /**
   * Start tour
   */
  start() {
    if (this.tourstop_array.length == 0) {
        alert("This tour has no tourstops")
        return
    }
    // Make sure we only start when the tour has loaded
    return this.tour_loaded.then(() => {
      // Reset, should also set curr_step to 0
      this.clear()
      //Enable tour style
      $('#tour_style_' + this.tour_id).removeAttr('disabled')
      $('#tour_exit_confirm_style_' + this.tour_id).removeAttr('disabled')
    
      this.started = true
      this.add_canvas_interaction_callbacks()
      this.rough_initial_loc = this.onezoom.utils.largest_visible_node()
      if (window.is_testing) console.log("Tour `" + this.name + "` started")
      if (typeof this.start_callback === 'function') {
        this.start_callback()
      }

      // RUN!
      this.curr_stop().play_from_start('forward')
    })
  }

  /**
   * Clear tour
   */
  clear() {
    if (this.curr_stop()) {
      this.curr_stop().exit()
    }
    if (this.prev_stop()) this.prev_stop().exit()
    //disable tour stylesheet
    $('#tour_style_' + this.tour_id).attr('disabled', 'disabled')
    $('#tour_exit_confirm_style_' + this.tour_id).attr('disabled', 'disabled')

    //should have option to remove DOM objects here. See https://github.com/OneZoom/OZtree/issues/199

    //hide tour
    this.started = false
    this.curr_step = 0
    this.prev_step = null
    this.remove_canvas_interaction_callbacks()
  }


  /**
   * Go to the next tour stop immediately
   */  
  goto_next() {
    if (!this.started) {
      return
    }
    this.curr_stop().exit()   
    if (this.curr_step === this.tourstop_array.length - 1) {
      // end of tour, exit gracefully
      if (typeof this.end_callback === 'function') {
          this.end_callback()
      }
      this.clear()
      return
    }
    this.prev_step = this.curr_step++
    this.curr_stop().play_from_start('forward')
  }

  /**
   * Go to previous tour stop
   */
  goto_prev() {
    if (!this.started) {
      return
    }
    if (this.curr_stop()) {
      this.curr_stop().exit()
    }

    if (this.curr_step > 0) {
      this.prev_step = this.curr_step--
    }

    this.curr_stop().play_from_start('backward')
  }

  /**
   * Fetch ott -> id conversion map
   */
  load_ott_id_conversion_map(ready_callback) {
    const ott_id_set = new Set()
    this.tourstop_array.forEach(tourstop => {
      if (tourstop.setting.ott && !isNaN(tourstop.setting.ott)) {
          ott_id_set.add(tourstop.setting.ott)
      }
    })
    const ott_id_array = []
    for (let ott_id of ott_id_set.values()) {
      ott_id_array.push({ OTT: ott_id })
    }

    this.onezoom.utils.process_taxon_list(
      JSON.stringify(ott_id_array),
      null, null,
      ready_callback
    )
  }

  curr_stop() {
    // Converting negative numbers to positive allows back & forth looping
    return this.tourstop_array[Math.abs(this.curr_step)]
  }

  prev_stop() {
    return this.tourstop_array[Math.abs(this.prev_step)]
  }

  /**
   * Clear callback timers
   */
  clear_callback_timers() {
    this.callback_timers.forEach((timer) => clearTimeout(timer))
    this.callback_timers = []
  }

  /**
   * Play tour - initiated by user
   */
  user_play() {
    if (this.started) {
      this.user_resume()
    } else {
      this.start()
    }
  }

  /**
   * Pause tour
   */
  user_pause() {
    if (this.started && this.curr_stop()) {
      if (window.is_testing) console.log("User paused")
      this.remove_canvas_interaction_callbacks() // Don't trigger any more pauses
      this.curr_stop().pause()
    }
  }

  /**
   * Resume paused tour stop
   */
  user_resume() {
    if (this.started && this.curr_stop()) {
      if (window.is_testing) console.log("User resumed")
      this.add_canvas_interaction_callbacks() // Allow interactions to trigger pauses again
      this.curr_stop().resume()
    }
  }

  /**
   * Exit tour
   */
  user_exit() {
    this.clear()
    if (typeof this.exit_callback === 'function') {
      this.exit_callback()
    }
  }

  /**
   * Activate next tour stop. If transition is running, go to end of the
   * current transition, otherwise go to next stop. Refer to Tours Timeline picture
   * and accompany table for details
   */
  user_forward() {
    let tourstop = this.curr_stop()
    this.clear_callback_timers()
    clearTimeout(this.goto_next_timer)
    
    if (!this.started) {
        user_play()
    }
    if (!tourstop) {
        console.log("Error: no current tourstop")
        return
    }
    tourstop.skip()
  }

  user_backward() {
    this.goto_prev()
  }

  /**
   * Bind previous, next, pause, play, exit button event
   */
  bind_template_ui_event(tourstop) {
    tourstop.container.find('.tour_forward').click(() => {
      this.user_forward()
    })

    tourstop.container.find('.tour_backward').click(() => {
      this.user_backward()
    })

    tourstop.container.find('.tour_play').click(() => {
      this.user_play()
    })

    tourstop.container.find('.tour_pause').click(() => {
      this.user_pause()
    })

    tourstop.container.find('.tour_resume').click(() => {
      this.user_resume()
    })

    tourstop.container.find('.tour_exit').click(() => {
      this.user_exit()
    })
  }

  /**
   * Bind exit or hide exit confirm events on the buttons of exit confirm popup
   */
  bind_exit_confirm_event() {
    this.exit_confirm_popup.find('.exit_confirm').click(() => {
      this.user_exit()
      this.exit_confirm_popup.hide()
    })
    this.exit_confirm_popup.find('.exit_cancel').click(() => {
      this.user_resume()
      this.exit_confirm_popup.hide()
    })
  }

  /**
   * Generate a mutation observer listening for (class_to_notify) being
   * added / removed
   */
  tourstop_observer(target_el, class_to_notify, add_fn, remove_fn) {
    const active_re = new RegExp(class_to_notify.map((s) => '(?:^| )' + s + '(?:$| )').join("|"))

    const mo = new MutationObserver((mutationList, observer) => {
      for(const mutation of mutationList) {
        const cur_active = !!mutation.target.className.match(active_re)
        const old_active = !!mutation.oldValue.match(active_re)

        if (cur_active && !old_active && add_fn) {
          add_fn(this, mutation.target)
        } else if (!cur_active && old_active && remove_fn) {
          remove_fn(this, mutation.target)
        }
      }
    })
    mo.observe(target_el, { attributes: true, attributeOldValue: true, attributeFilter: ['class'] })
    return mo
  }
}

export default Tour
