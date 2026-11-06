/* Fully Launched / Command Deck: boot reveals, Chicago clock, hero video. */
(function(){
  'use strict';
  var root = document.documentElement;
  window.__flCmd = true; // tells the <head> failsafe that this script ran
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Boot-up reveals ------------------------------------------------ */
  var items = document.querySelectorAll('[data-boot]');
  if(root.classList.contains('boot') && 'IntersectionObserver' in window){
    // Stagger siblings that share a grid so cards power on in sequence.
    document.querySelectorAll('.grid').forEach(function(g){
      Array.prototype.forEach.call(g.children, function(el, i){
        if(el.hasAttribute('data-boot')) el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's');
      });
    });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    items.forEach(function(el){ io.observe(el); });
  } else {
    root.classList.remove('boot');
  }

  /* ---- Chicago local time readout ------------------------------------ */
  var clk = document.querySelector('[data-clock]');
  if(clk && window.Intl){
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-US', {hour:'2-digit', minute:'2-digit', hour12:false, timeZone:'America/Chicago'}); } catch(e){}
    var tick = function(){ if(fmt) clk.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  /* ---- Hero video ------------------------------------------------------
     The source lives in data-src so reduced-motion and Save-Data visitors
     never download it; they keep the poster still. Looping uses a short
     fade-out / seek / fade-in rather than the native `loop` attribute,
     which hard-cuts back to frame 1 (same approach as the main site).    */
  var video = document.querySelector('.viewport video[data-src]');
  var saveData = navigator.connection && navigator.connection.saveData;
  if(video && !reduce && !saveData){
    video.muted = true;
    video.src = video.getAttribute('data-src');
    var FADE = 400, LEAD = 0.6, looping = false;
    var play = function(){ var p = video.play(); if(p && p.catch) p.catch(function(){}); };
    var restart = function(fade){
      if(looping) return;
      looping = true;
      var finish = function(){
        video.currentTime = 0; play();
        if(fade) video.style.opacity = '1';
        looping = false;
      };
      if(fade){ video.style.opacity = '0'; setTimeout(finish, FADE); } else { finish(); }
    };
    video.addEventListener('timeupdate', function(){
      if(!looping && isFinite(video.duration) && video.currentTime >= video.duration - LEAD) restart(true);
    });
    video.addEventListener('ended', function(){ if(!looping && video.ended) restart(false); });
    video.addEventListener('canplay', play, {once:true});
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && video.paused) play(); });
    play();
  }
})();
