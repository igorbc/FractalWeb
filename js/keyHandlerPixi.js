// saves the state of Shift key
var keys = {
  key_backspace: 8,
  key_tab: 9,
  key_enter: 13,
  key_shift: 16,
  key_ctrl: 17,
  key_alt: 18,
  key_pause_break: 19,
  key_caps_lock: 20,
  key_escape: 27,
  key_page_up: 33,
  key_page_down: 34,
  key_end: 35,
  key_home: 36,
  key_left_arrow: 37,
  key_up_arrow: 38,
  key_right_arrow: 39,
  key_down_arrow: 40,
  key_insert: 45,
  key_delete: 46,
  key_0: 48,
  key_1: 49,
  key_2: 50,
  key_3: 51,
  key_4: 52,
  key_5: 53,
  key_6: 54,
  key_7: 55,
  key_8: 56,
  key_9: 57,
  key_a: 65,
  key_b: 66,
  key_c: 67,
  key_d: 68,
  key_e: 69,
  key_f: 70,
  key_g: 71,
  key_h: 72,
  key_i: 73,
  key_j: 74,
  key_k: 75,
  key_l: 76,
  key_m: 77,
  key_n: 78,
  key_o: 79,
  key_p: 80,
  key_q: 81,
  key_r: 82,
  key_s: 83,
  key_t: 84,
  key_u: 85,
  key_v: 86,
  key_w: 87,
  key_x: 88,
  key_y: 89,
  key_z: 90,
  key_left_window_key: 91,
  key_right_window_key: 92,
  key_select_key: 93,
  key_numpad_0: 96,
  key_numpad_1: 97,
  key_numpad_2: 98,
  key_numpad_3: 99,
  key_numpad_4: 100,
  key_numpad_5: 101,
  key_numpad_6: 102,
  key_numpad_7: 103,
  key_numpad_8: 104,
  key_numpad_9: 105,
  key_multiply: 106,
  key_add: 107,
  key_subtract: 109,
  key_decimal_point: 110,
  key_divide: 111,
  key_f1: 112,
  key_f2: 113,
  key_f3: 114,
  key_f4: 115,
  key_f5: 116,
  key_f6: 117,
  key_f7: 118,
  key_f8: 119,
  key_f9: 120,
  key_f10: 121,
  key_f11: 122,
  key_f12: 123,
  key_num_lock: 144,
  key_scroll_lock: 145,
  key_semi_colon: 186,
  key_equal_sign: 187,
  key_comma: 188,
  key_dash: 189,
  key_period: 190,
  key_forward_slash: 191,
  key_grave_accent: 192,
  key_open_bracket: 219,
  key_back_slash: 220,
  key_close_braket: 221,
  key_single_quote: 222,
}

function setupKeyHandlerPixi(){
  document.onkeydown = handleKeysPixi;
}

function handleKeysPixi(e){
  console.log("key pressed");
  e = e || window.event;

  if (e.keyCode == keys.key_up_arrow) {
    // up arrow
    console.log("up");
    myFractalPixi.incrementOffsetY();
  }
  else if (e.keyCode == keys.key_down_arrow) {
    // down arrow
    console.log("down");
    myFractalPixi.decrementOffsetY();
  }
  else if (e.keyCode == keys.key_left_arrow) {
    // left arrow
    console.log("left");
    myFractalPixi.decrementOffsetX();
  }
  else if (e.keyCode == keys.key_right_arrow) {
    // right arrow
    console.log("right");
    myFractalPixi.incrementOffsetX();
  }
  else if (e.keyCode == keys.key_x) {
    // x
    myFractalPixi.zoom += 0.0001;
    console.log("x");
  }
  else if (e.keyCode == keys.key_z) {
    // z
    myFractalPixi.decrementScale();
    console.log("z");
  }
}
