/*
 * The phone in the hero: AKnght2Write's writing screen acting out one turn of the loop:
 * a paragraph break, a line of dialogue, a spoken correction, and the chapter read back.
 *
 * The markup it starts from is already the finished page. With no JavaScript, in a browser
 * too old for any of this, or for somebody who has asked for less motion, the phone is a
 * still picture of that page and nothing is missing from it.
 */
(function () {
  'use strict';

  var demo = document.querySelector('[data-demo]');
  if (!demo || typeof demo.animate !== 'function' || !('IntersectionObserver' in window)) return;

  function part(name) {
    return demo.querySelector('[data-' + name + ']');
  }

  var screen = part('screen');
  var status = part('status');
  var statusText = part('status-text');
  var queue = part('queue');
  var meterBar = part('meter-bar');
  var meterCount = part('meter-count');
  var readback = part('readback');
  var readbackCount = part('readback-count');
  var playIcon = part('play');
  var page = part('page');
  var p1 = part('p1');
  var p2 = part('p2');
  var s1 = part('s1');
  var s2 = part('s2');
  var swap = part('swap');
  var caret = part('caret');
  var btnDictate = part('btn-dictate');
  var btnPara = part('btn-para');
  var btnCommand = part('btn-command');
  var undo = part('undo');
  var say = part('say');
  var sayLabel = part('say-label');
  var sayWords = part('say-words');
  var toggle = part('toggle');
  var toggleText = part('toggle-text');

  var DAILY_GOAL = 1667;
  var LINE = ['“We', 'should', 'go', 'now,”', 'said', 'Amyra.'];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var userPaused = reduceMotion.matches;
  var offscreen = false;
  var started = false;

  function paused() {
    return userPaused || offscreen || document.hidden;
  }

  /*
   * Time that only passes while the demo is playing, so a pause can fall anywhere.
   *
   * A timer rather than animation frames: a browser that is drawing the page slowly, or
   * not at all, hands out very few frames without calling the page hidden, and a clock
   * counted in frames then runs at a crawl. The cap is for the opposite case: one tick
   * arriving a minute late must not swallow a minute of the scene.
   */
  function sleep(ms) {
    return new Promise(function (resolve) {
      var left = ms;
      var last = performance.now();
      function tick() {
        var now = performance.now();
        if (!paused()) left -= Math.min(now - last, 250);
        last = now;
        if (left <= 0) resolve();
        else setTimeout(tick, paused() ? 200 : 30);
      }
      tick();
    });
  }

  /* ---- The parts of the screen ---- */

  function setStatus(state, text) {
    status.setAttribute('data-state', state);
    statusText.textContent = text;
  }

  function setQueue(on) {
    if (on) queue.setAttribute('data-on', '');
    else queue.removeAttribute('data-on');
  }

  function setMeter(words) {
    meterCount.textContent = words + ' / ' + DAILY_GOAL;
    meterBar.style.width = ((words / DAILY_GOAL) * 100).toFixed(2) + '%';
  }

  function setUndo(text) {
    undo.textContent = text || 'Nothing to undo';
    if (text) undo.setAttribute('data-live', '');
    else undo.removeAttribute('data-live');
  }

  function hold(button, down) {
    if (down) button.setAttribute('data-down', '');
    else button.removeAttribute('data-down');
  }

  function hush() {
    say.setAttribute('data-idle', '');
  }

  /* What is said aloud, spelled out a letter at a time, since a page cannot be heard. */
  async function speak(kind, label, words) {
    say.setAttribute('data-kind', kind);
    say.removeAttribute('data-idle');
    sayLabel.textContent = label;
    sayWords.textContent = '';
    for (var i = 1; i <= words.length; i++) {
      sayWords.textContent = words.slice(0, i);
      await sleep(words.charAt(i - 1) === ' ' ? 80 : 40);
    }
  }

  function show(kind, label, words) {
    say.setAttribute('data-kind', kind);
    say.removeAttribute('data-idle');
    sayLabel.textContent = label;
    sayWords.textContent = words;
  }

  /* ---- Rata-ta-ta-ta ---- */

  function within(rect) {
    var frame = screen.getBoundingClientRect();
    return { x: rect.left - frame.left + rect.width / 2, y: rect.top - frame.top + rect.height / 2 };
  }

  function at(point, scale) {
    return 'translate(' + point.x + 'px, ' + point.y + 'px) scale(' + scale + ')';
  }

  /*
   * One dot to one word. The word takes its space from the start and is uncovered when
   * its dot lands, so the paragraph never moves once it has been laid out.
   *
   * The app's own rule applies here too: an arrival that is cut short must never leave
   * prose that exists and cannot be seen. A browser that stops drawing stops its
   * animations without ever finishing them, so every word is also uncovered by the clock,
   * whether or not its dot got there.
   */
  function fire(word, from, delay) {
    var to = within(word.getBoundingClientRect());
    var dot = document.createElement('i');
    dot.className = 'volley-dot';
    screen.appendChild(dot);
    var flight = dot.animate(
      [
        { transform: at(from, 0.5), opacity: 0 },
        { opacity: 1, offset: 0.2 },
        { transform: at(to, 1), opacity: 1 }
      ],
      { duration: 440, delay: delay, easing: 'cubic-bezier(0.3, 0, 0.2, 1)', fill: 'both' }
    );
    var arrived = new Promise(function (resolve) {
      flight.onfinish = function () {
        resolve(true);
      };
    });
    return Promise.race([arrived, sleep(delay + 1600)]).then(function (flew) {
      dot.remove();
      word.removeAttribute('data-hidden');
      if (!flew) return;
      var ring = document.createElement('i');
      ring.className = 'volley-ring';
      screen.appendChild(ring);
      ring.animate(
        [
          { transform: at(to, 0.3), opacity: 0.85 },
          { transform: at(to, 1), opacity: 0 }
        ],
        { duration: 380, easing: 'ease-out', fill: 'both' }
      );
      setTimeout(function () {
        ring.remove();
      }, 900);
    });
  }

  /* ---- The page, before and after ---- */

  function rewind() {
    setStatus('ready', 'Ready');
    setQueue(false);
    setMeter(212);
    setUndo('');
    hush();
    swap.textContent = 'water';
    swap.removeAttribute('data-on');
    s1.removeAttribute('data-reading');
    s2.removeAttribute('data-reading');
    s2.textContent = '';
    p2.hidden = true;
    p1.appendChild(caret);
    readback.removeAttribute('data-on');
    playIcon.removeAttribute('data-on');
    hold(btnDictate, false);
    hold(btnPara, false);
    hold(btnCommand, false);
  }

  function finished() {
    rewind();
    swap.textContent = 'river';
    s2.textContent = LINE.join(' ');
    p2.hidden = false;
    p2.appendChild(caret);
    setMeter(218);
    setUndo('Undo replace');
    show('dictate', 'Hold Dictate and say', 'we should go now said Amyra');
    page.style.opacity = '';
  }

  /* ---- One turn of the loop ---- */

  async function newParagraph() {
    hold(btnPara, true);
    await sleep(280);
    hold(btnPara, false);
    p2.hidden = false;
    p2.appendChild(caret);
    setUndo('Undo new paragraph');
    await sleep(900);
  }

  async function dictate() {
    hold(btnDictate, true);
    setStatus('dictating', 'Dictating');
    await speak('dictate', 'Hold Dictate and say', 'we should go now said Amyra');
    await sleep(500);
    hold(btnDictate, false);
    setStatus('ready', 'Ready');
    setQueue(true);
    await sleep(600);
    hush();
    await sleep(700);

    var words = LINE.map(function (text, i) {
      var word = document.createElement('span');
      word.className = 'w';
      word.setAttribute('data-hidden', '');
      word.textContent = text;
      if (i) s2.appendChild(document.createTextNode(' '));
      s2.appendChild(word);
      return word;
    });
    var muzzle = btnDictate.getBoundingClientRect();
    var from = within({ left: muzzle.left, top: muzzle.top, width: muzzle.width, height: 0 });
    await Promise.all(
      words.map(function (word, i) {
        return fire(word, from, i * 95);
      })
    );
    setQueue(false);
    setMeter(212 + LINE.length);
    setUndo('Undo dictation');
    await sleep(1500);
  }

  async function command() {
    hold(btnCommand, true);
    setStatus('command', 'Listening for a command');
    await speak('command', 'Hold Command and say', 'replace water with river');
    await sleep(500);
    hold(btnCommand, false);
    setStatus('ready', 'Ready');
    setQueue(true);
    await sleep(600);
    hush();
    await sleep(600);
    swap.setAttribute('data-on', '');
    await sleep(450);
    swap.textContent = 'river';
    setQueue(false);
    setUndo('Undo replace');
    await sleep(1000);
    swap.removeAttribute('data-on');
    await sleep(900);
  }

  async function readBack() {
    playIcon.setAttribute('data-on', '');
    readback.setAttribute('data-on', '');
    var sentences = [s1, s2];
    for (var i = 0; i < sentences.length; i++) {
      readbackCount.textContent = i + 1 + ' of ' + sentences.length;
      sentences[i].setAttribute('data-reading', '');
      show('readback', 'It reads the chapter back', sentences[i].textContent);
      await sleep(2300);
      sentences[i].removeAttribute('data-reading');
    }
    readback.removeAttribute('data-on');
    playIcon.removeAttribute('data-on');
    hush();
    await sleep(1600);
  }

  async function play() {
    started = true;
    try {
      await sleep(1300);
      for (;;) {
        page.style.opacity = '0';
        await sleep(420);
        rewind();
        page.style.opacity = '';
        await sleep(1100);
        await newParagraph();
        await dictate();
        await command();
        await readBack();
      }
    } catch (error) {
      /* Whatever went wrong, leave the finished page standing rather than half a scene. */
      finished();
    }
  }

  /* ---- Pause and play ---- */

  function paint() {
    if (userPaused) toggle.setAttribute('data-paused', '');
    else toggle.removeAttribute('data-paused');
    toggleText.textContent = userPaused ? 'Play the demo' : 'Pause the demo';
  }

  toggle.addEventListener('click', function () {
    userPaused = !userPaused;
    paint();
    if (!userPaused && !started) play();
  });

  new IntersectionObserver(
    function (entries) {
      offscreen = !entries[entries.length - 1].isIntersecting;
    },
    { threshold: 0.15 }
  ).observe(screen);

  paint();
  if (!userPaused) play();
})();
