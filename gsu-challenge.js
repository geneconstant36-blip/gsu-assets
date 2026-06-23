/* ============================================================
   GSU CHALLENGE ENGINE  ·  gsu-challenge.js
   ROUTING: host on GitHub (gsu-assets root) →
     https://read.globalsovereignuniversity.org/gsu-challenge.js
   Reads window.GSU_BANKS (from gsu-book-banks.js) and renders a Challenge
   into every <div class="gsu-challenge" data-book="SLUG"></div> on the page.
   No dependencies. Add a book = add an entry to gsu-book-banks.js.
   ============================================================ */
(function(){
  var GENO="https://cdn.prod.website-files.com/690a4028667a2e2c27b665d0/69768f7aaae58ca85c3ce25e_Geno%20head-round.png";
  var CSS=
  ".gsu-challenge{--gold:#C9A84C;--cream:#F5F1E8;--teal:#1A8B7F;--miss:#b35140;font-family:Georgia,'Times New Roman',serif;display:block;max-width:720px;margin:0 auto}"+
  ".gsu-challenge *{box-sizing:border-box}"+
  ".gch-card{background:#0b0b0b;border:1px solid #241f12;border-radius:16px;padding:26px 24px;color:var(--cream)}"+
  ".gch-geno{display:flex;gap:12px;align-items:flex-start;background:rgba(201,168,76,.07);border:1px solid #2b2412;border-radius:12px;padding:13px 15px;margin:16px 0 0}"+
  ".gch-geno img{width:40px;height:40px;border-radius:50%;flex:0 0 40px;background:#1a1404}"+
  ".gch-geno p{font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.5;color:#d8d0bd;margin:0}.gch-geno b{color:var(--gold)}"+
  ".gch-btn{font-family:Arial,Helvetica,sans-serif;font-weight:800;font-size:15px;background:var(--gold);color:#1a1404;border:none;border-radius:10px;padding:14px 28px;cursor:pointer;transition:.15s;text-decoration:none;display:inline-block}"+
  ".gch-btn:hover{background:#E5C97B}.gch-btn.alt{background:transparent;color:var(--gold);border:1px solid var(--gold)}.gch-btn.alt:hover{background:rgba(201,168,76,.12)}"+
  ".gch-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}"+
  ".gch-prog{font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:.04em;color:#8f8975;text-transform:uppercase;margin-bottom:8px;display:flex;justify-content:space-between}"+
  ".gch-bar{height:6px;background:#241f12;border-radius:4px;overflow:hidden;margin-bottom:22px}.gch-bar i{display:block;height:100%;background:var(--gold);transition:width .3s}"+
  ".gch-q{font-size:1.32rem;line-height:1.35;margin:0 0 20px;color:var(--cream)}"+
  ".gch-opts{display:flex;flex-direction:column;gap:11px}"+
  ".gch-opt{font-family:Arial,Helvetica,sans-serif;text-align:left;font-size:15px;line-height:1.4;color:var(--cream);background:#121009;border:1px solid #312a18;border-radius:11px;padding:15px 17px;cursor:pointer;transition:.12s;width:100%}"+
  ".gch-opt:hover:not([disabled]){border-color:var(--gold)}.gch-opt[disabled]{cursor:default}"+
  ".gch-opt.correct{border-color:var(--teal);background:rgba(26,139,127,.16);color:#9fe6d8}"+
  ".gch-opt.wrong{border-color:var(--miss);background:rgba(179,81,64,.14);color:#e8b3a8}"+
  ".gch-tag{font-family:Arial,Helvetica,sans-serif;font-weight:800;font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-left:8px}"+
  ".gch-kick{font-family:Arial,Helvetica,sans-serif;letter-spacing:.16em;text-transform:uppercase;font-size:11px;font-weight:700;color:var(--gold);margin-bottom:10px}"+
  ".gch-badge{font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:14px;color:#1a1404;background:var(--gold);display:inline-block;padding:9px 20px;border-radius:30px;margin:6px 0 16px}"+
  ".gch-score{font-size:3rem;color:var(--gold);line-height:1;margin:6px 0;font-family:Georgia,serif}";

  function injectCSS(){ if(document.getElementById('gsu-ch-css'))return; var s=document.createElement('style'); s.id='gsu-ch-css'; s.textContent=CSS; (document.head||document.documentElement).appendChild(s); }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function gb(t){return '<div class="gch-geno"><img src="'+GENO+'" alt="GENO"><p><b>GENO:</b> '+t+'</p></div>';}
  function openGeno(){try{window.dispatchEvent(new CustomEvent('geno:open'))}catch(e){}}

  function mount(el){
    var slug=el.getAttribute('data-book');
    var BANK=(window.GSU_BANKS||{})[slug];
    if(!BANK||!BANK.questions||!BANK.questions.length){ el.innerHTML='<div class="gch-card"><p class="gch-q" style="margin:0">The Challenge for this book is coming soon.</p></div>'; return; }
    var idx=0,score=0,Q=null,locked=false;
    function intro(){ locked=false; el.innerHTML='<div class="gch-card">'+gb(esc(BANK.genoOpen||"Take your time \u2014 I\u2019ll explain the why behind every answer."))+'<div class="gch-row"><button class="gch-btn" data-a="start">Begin the Challenge</button></div></div>'; }
    function question(){ locked=false; Q=BANK.questions[idx]; var n=BANK.questions.length,pct=Math.round(idx/n*100); var h='<div class="gch-card"><div class="gch-prog"><span>Question '+(idx+1)+' of '+n+'</span><span>'+score+' correct</span></div><div class="gch-bar"><i style="width:'+pct+'%"></i></div><p class="gch-q">'+esc(Q.q)+'</p><div class="gch-opts">'; for(var i=0;i<Q.o.length;i++){h+='<button class="gch-opt" data-a="opt" data-i="'+i+'">'+esc(Q.o[i])+'</button>';} h+='</div><div data-af></div></div>'; el.innerHTML=h; }
    function choose(i){ if(locked)return; locked=true; var ok=(i===Q.a); if(ok)score++; var opts=el.querySelectorAll('.gch-opt'); for(var j=0;j<opts.length;j++){ opts[j].setAttribute('disabled','1'); if(j===Q.a){opts[j].className='gch-opt correct';opts[j].innerHTML+=' <span class="gch-tag">\u2713 Correct</span>';} else if(j===i){opts[j].className='gch-opt wrong';opts[j].innerHTML+=' <span class="gch-tag">Your pick</span>';} } var last=(idx===BANK.questions.length-1); el.querySelector('[data-af]').innerHTML=gb((ok?'<b style="color:#9fe6d8">Right.</b> ':'')+esc(Q.e))+'<div class="gch-row"><button class="gch-btn" data-a="next">'+(last?'See my result':'Next question')+'</button></div>'; }
    function result(){ var n=BANK.questions.length,pct=Math.round(score/n*100),bd=null; for(var i=0;i<BANK.badges.length;i++){ if(pct>=BANK.badges[i].min){bd=BANK.badges[i];break;} } if(!bd)bd=BANK.badges[BANK.badges.length-1]; var read=BANK.bookUrl?'<a class="gch-btn alt" href="'+BANK.bookUrl+'">Read the book</a>':''; el.innerHTML='<div class="gch-card" style="text-align:center"><div class="gch-kick" style="text-align:center">Challenge complete</div><div class="gch-score">'+score+'/'+n+'</div><div class="gch-badge">'+esc(bd.name)+'</div><p class="gch-q" style="text-align:center;font-size:1.1rem;color:#d8d0bd">'+esc(bd.line)+'</p>'+gb('Want the full story behind any of these? I\u2019ve read the whole book \u2014 just ask me.')+'<div class="gch-row" style="justify-content:center"><button class="gch-btn" data-a="again">Play again</button><button class="gch-btn alt" data-a="geno">Ask GENO about this book</button>'+read+'</div></div>'; }
    el.addEventListener('click',function(e){ var b=e.target.closest?e.target.closest('[data-a]'):null; if(!b||!el.contains(b))return; var a=b.getAttribute('data-a'); if(a==='start'){idx=0;score=0;question();} else if(a==='opt'){choose(parseInt(b.getAttribute('data-i'),10));} else if(a==='next'){idx++;(idx>=BANK.questions.length)?result():question();} else if(a==='again'){idx=0;score=0;question();} else if(a==='geno'){openGeno();} });
    intro();
  }
  function init(){ injectCSS(); var els=document.querySelectorAll('.gsu-challenge[data-book]'); for(var i=0;i<els.length;i++){ if(!els[i].__gsu){els[i].__gsu=1; mount(els[i]);} } }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);} else {init();}
  window.GSU_renderChallenges=init;
})();
