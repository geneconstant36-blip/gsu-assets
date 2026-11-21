/* GSU Reading Room - Listen 2.0 (Nov 21 2026). One shared upgrade for every Reading Room reader built on the older
   template (the ones with a "Tap Listen" door and a small Pause / Stop strip).
   WHY: the Chancellor, Nov 21 2026, on the 4th Grade Math reader: "I cannot turn the READ off. There is no button
   readily available to stop it... I cannot move the cursor to other text. It starts from the very first word."
   WHAT THIS DOES, without changing a word of any book:
   - a large bar that cannot be missed, with a gold STOP button. The Listen door itself also becomes "Stop reading".
   - reading starts at the first paragraph you can see on the screen, not at the top of the book. A small
     "Listen from here" button follows you down the page for that.
   - tap or click any paragraph and the reading moves there. Back and Next move one paragraph.
   - Pause really pauses (it stops the voice and keeps the place), on phones too. The Esc key stops.
   - long paragraphs are spoken a sentence at a time, so the browser does not cut the voice off.
   It replaces the older Listen code on the page by swapping the buttons for fresh copies. To undo: remove the
   <script src="/rr-listen-2.js"> line from the reader page. Stores nothing. Sends nothing. */
(function(){
'use strict';
var door=document.getElementById('rr-listen-btn'), bar=document.getElementById('rr-listen-bar');
if(!door||!bar||window.__rrListen2) return; window.__rrListen2=1;
var synth=window.speechSynthesis;
if(!synth||typeof SpeechSynthesisUtterance==='undefined') return;
try{ synth.cancel(); }catch(e){}
/* fresh copies: the older listeners are left behind on the old nodes */
var d2=door.cloneNode(true); door.parentNode.replaceChild(d2,door); door=d2;
var DOOR_HTML=door.innerHTML;
var st=document.createElement('style');
st.textContent=
'.rr-listen-bar.rrl2{display:none;position:fixed;left:20px;right:auto;bottom:20px;transform:none;width:auto;max-width:560px;z-index:2147483000;background:#000;border:2px solid #C9A84C;border-radius:10px;padding:12px 14px;box-shadow:0 8px 32px rgba(0,0,0,.8);font-family:Georgia,serif;flex-direction:column;align-items:stretch;gap:8px}'+
'.rr-listen-bar.rrl2.active{display:flex}'+
'.rrl2 .rrl2-s{color:#C9A84C;font-size:16px;line-height:1.35;margin:0}'+
'.rrl2 .rrl2-h{color:#F5F1E8;font-size:15px;line-height:1.35;margin:0}'+
'.rrl2 .rrl2-b{display:flex;gap:8px;flex-wrap:wrap}'+
'.rrl2 button{background:#000;border:1px solid #C9A84C;color:#C9A84C;border-radius:6px;padding:10px 14px;font-size:16px;font-family:Georgia,serif;cursor:pointer;letter-spacing:0}'+
'.rrl2 button:hover{background:rgba(201,168,76,.14)}'+
'.rrl2 button.rrl2-stop{background:#C9A84C;color:#000;font-weight:700;padding:10px 22px}'+
'.rrl2-on .rrl2-p{cursor:pointer}'+
'.rrl2-now{background:rgba(201,168,76,.18);outline:2px solid rgba(201,168,76,.55);outline-offset:4px;border-radius:2px}'+
'.rrl2-fab{display:none;position:fixed;left:20px;bottom:20px;z-index:2147482999;background:#000;border:2px solid #C9A84C;color:#C9A84C;border-radius:8px;padding:10px 16px;font-size:16px;font-family:Georgia,serif;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.8)}'+
'.rrl2-fab.show{display:block}'+
'@media (max-width:700px){.rrl2-fab{left:8px;bottom:84px}.rr-listen-bar.rrl2{left:8px;right:8px;bottom:84px;max-width:none}}';
document.head.appendChild(st);
bar.className='rr-listen-bar rrl2';
bar.innerHTML='<p class="rrl2-s" id="rrl2-status" role="status" aria-live="polite">Reading aloud</p>'+
 '<div class="rrl2-b"><button type="button" class="rrl2-stop" id="rrl2-stop">Stop</button><button type="button" id="rrl2-pause">Pause</button><button type="button" id="rrl2-back" aria-label="Back one paragraph">&#9664; Back</button><button type="button" id="rrl2-next" aria-label="Next paragraph">Next &#9654;</button></div>'+
 '<p class="rrl2-h">Tap any paragraph to move the reading there.</p>';
function $(id){return document.getElementById(id);}
/* a Listen button that follows you down the page, so the reading can start where you are */
var fab=document.createElement('button'); fab.type='button'; fab.className='rrl2-fab'; fab.id='rrl2-fab'; fab.innerHTML='&#9654; Listen from here'; document.body.appendChild(fab);
function fabShow(){ var r=door.getBoundingClientRect(); fab.classList.toggle('show',!active&&r.bottom<0); }
window.addEventListener('scroll',fabShow,{passive:true});
var paras=[], idx=0, chunks=[], ci=0, gen=0, active=false, paused=false;
function collect(){
 var all=document.querySelectorAll('.rr-chapter p, .rr-chapter li, .rr-chapter h2, .rr-chapter h3, .rr-chapter h4, .rr-chapter blockquote');
 paras=[];
 Array.prototype.forEach.call(all,function(el){
  if(!/[A-Za-z0-9]/.test(el.textContent)) return;
  if(el.querySelector('p,li,h2,h3,h4,blockquote')) return;          /* only the innermost block */
  if(el.offsetParent===null) return;                                  /* hidden */
  el.classList.add('rrl2-p'); paras.push(el);
 });
}
function firstOnScreen(){
 for(var i=0;i<paras.length;i++){ var r=paras[i].getBoundingClientRect(); if(r.bottom>90&&r.top<window.innerHeight) { if(r.top>=60||r.bottom>window.innerHeight*0.5) return i; } }
 for(var j=0;j<paras.length;j++){ if(paras[j].getBoundingClientRect().top>=0) return j; }
 return 0;
}
function split(t){
 t=t.replace(/\s+/g,' ').trim(); if(t.length<=220) return [t];
 var out=[], parts=t.match(/[^.!?]+[.!?]+["”’')]*\s*|[^.!?]+$/g)||[t], c='';
 parts.forEach(function(p){ if(c&&(c+p).length>220){ out.push(c.trim()); c=p; } else c+=p; });
 if(c.trim()) out.push(c.trim());
 var fin=[]; out.forEach(function(o){ while(o.length>240){ var cut=o.lastIndexOf(', ',220); if(cut<40) cut=o.lastIndexOf(' ',220); if(cut<40) cut=220; fin.push(o.slice(0,cut+1).trim()); o=o.slice(cut+1).trim(); } if(o) fin.push(o); });
 return fin;
}
function mark(el){
 Array.prototype.forEach.call(document.querySelectorAll('.rrl2-now,.rr-speaking'),function(x){ x.classList.remove('rrl2-now'); x.classList.remove('rr-speaking'); });
 if(el){ el.classList.add('rrl2-now'); var r=el.getBoundingClientRect(); if(r.top<90||r.bottom>window.innerHeight-170){ try{ el.scrollIntoView({behavior:'auto',block:'center'}); }catch(e){ el.scrollIntoView(); } } }
}
function say(t){ $('rrl2-status').textContent=t; }
function speakPara(){
 var g=gen;
 if(idx>=paras.length){ stop('That is the end of the book.'); return; }
 mark(paras[idx]); chunks=split(paras[idx].textContent); ci=0; say('Reading aloud'); speakChunk(g);
}
function speakChunk(g){
 if(g!==gen||!active||paused) return;
 if(ci>=chunks.length){ idx++; speakPara(); return; }
 var u=new SpeechSynthesisUtterance(chunks[ci]); u.rate=0.95;
 u.onend=function(){ if(g!==gen) return; ci++; speakChunk(g); };
 u.onerror=function(e){ if(g!==gen) return; if(e&&(e.error==='interrupted'||e.error==='canceled')) return; ci++; speakChunk(g); };
 synth.speak(u);
}
function start(at){
 collect(); if(!paras.length) return;
 gen++; synth.cancel(); active=true; paused=false;
 idx=(typeof at==='number')?at:firstOnScreen();
 bar.classList.add('active'); document.body.classList.add('rrl2-on');
 $('rrl2-pause').textContent='Pause'; door.innerHTML='&#9632; Stop reading'; fab.classList.remove('show');
 speakPara();
}
function stop(note){
 gen++; active=false; paused=false; synth.cancel(); mark(null);
 document.body.classList.remove('rrl2-on'); door.innerHTML=DOOR_HTML; fabShow();
 if(note){ say(note); setTimeout(function(){ if(!active) bar.classList.remove('active'); },2500); } else bar.classList.remove('active');
}
function pause(){
 if(!active) return;
 if(paused){ paused=false; gen++; $('rrl2-pause').textContent='Pause'; speakPara(); }
 else { paused=true; gen++; synth.cancel(); $('rrl2-pause').textContent='Keep reading'; say('Paused. Your place is kept.'); }
}
function jump(i){ if(!active) return; i=Math.max(0,Math.min(paras.length-1,i)); gen++; synth.cancel(); paused=false; $('rrl2-pause').textContent='Pause'; idx=i; speakPara(); }
door.addEventListener('click',function(e){ e.preventDefault(); if(active) stop(); else start(); });
fab.addEventListener('click',function(){ start(); });
$('rrl2-stop').addEventListener('click',function(){ stop(); });
$('rrl2-pause').addEventListener('click',pause);
$('rrl2-back').addEventListener('click',function(){ jump(idx-1); });
$('rrl2-next').addEventListener('click',function(){ jump(idx+1); });
document.addEventListener('click',function(e){
 if(!active) return; var t=e.target; if(!t||!t.closest) return;
 if(t.closest('a,button,.rr-listen-bar')) return;
 var p=t.closest('.rrl2-p'); if(!p) return;
 var i=paras.indexOf(p); if(i>=0) jump(i);
});
document.addEventListener('keydown',function(e){ if(active&&(e.key==='Escape'||e.key==='Esc')) stop(); });
window.addEventListener('beforeunload',function(){ try{ synth.cancel(); }catch(e){} });
window.addEventListener('pagehide',function(){ try{ synth.cancel(); }catch(e){} });
window.GSU_RR_LISTEN={start:start,stop:stop,state:function(){ return {active:active,paused:paused,idx:idx,total:paras.length}; }};
})();
