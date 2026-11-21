/* GSU Open My Book 2.0.2 (Nov 21 2026). A reader for EPUB books, inside one GSU page.
   The book file is opened in the visitor's own browser and is never sent anywhere. No outside library.
   2.0.0, from the EPUB chat's handover "Six Tests and Your Turn" (approved by the Chancellor Nov 21 2026; he said "start"):
   1. Built to the six tests in Chapter 6 of his book Fractured Words, Fractured Worlds (GSU's own standard, from the book;
      not a rating, a certificate or proven science): FIXED PAGES of about 150 words that never split a paragraph, so a page
      always holds the same words; "Page 3 of 29" and a rail always in view; buttons that do not move; the voice STOPS at the
      end of each page; links out of the book wait in a list under the page; no scores.
   2. "Your turn": tap a sentence, read it aloud, the page listens (browser SpeechRecognition, only after the learner says
      yes, because the browser sends speech to its maker) and shows which words it heard. Tapping the words always works
      and always has the last word. No grade, no percent.
   Also: styles and the reader's markup now live in this file, so the page embed is short. Storage: gsu-omb-v1 (place is now
   {ch,pg}; mic choice in "mic"), IndexedDB gsu-omb (the My books shelf). The Android file chooser is not filtered.
   2.0.2: found on the Chancellor's phone with one of his older books: a chapter heading sat alone on a page and the
   voice stopped after it. A heading now always travels with the text that follows it, and a book whose text comes as one
   very long block (no paragraphs, or line breaks only) is cut into pages at line breaks, then at sentence ends.
   2.0.1: the site-wide Say It Back is switched off on this page only (it was adding a second button inside Your turn). */
(function(){
'use strict';
var root=document.getElementById('omb'); if(!root) return;
/* The site-wide Say It Back (1.3.0) looks for a Listen control and adds its own button; here it landed inside the
   Your turn box. This page has its own read-back, so the site-wide one is switched off ON THIS PAGE ONLY, by the
   same flag it uses to avoid loading twice. Nothing in its file is changed. To bring it back here, delete this line. */
window.__gsuSB=1;
function $(id){return document.getElementById(id);}
var KEY='gsu-omb-v1', td=new TextDecoder('utf-8');
var book=null, cur=0, size=20, urls=[];
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
function save(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
var mem=load(); if(mem.size>=16&&mem.size<=34) size=mem.size;
function msg(t,bad){var m=$('omb-msg'); m.textContent=t||''; m.className='omb-msg'+(bad?' bad':'');}

/* ---------- unzip ---------- */
function readZip(buf){
 var dv=new DataView(buf), n=buf.byteLength, i=n-22, eo=-1;
 for(;i>=0&&i>n-66000;i--){ if(dv.getUint32(i,true)===0x06054b50){eo=i;break;} }
 if(eo<0) throw new Error('not a zip');
 var count=dv.getUint16(eo+10,true), off=dv.getUint32(eo+16,true), files={};
 for(var k=0;k<count;k++){
  if(dv.getUint32(off,true)!==0x02014b50) break;
  var method=dv.getUint16(off+10,true), csize=dv.getUint32(off+20,true), nl=dv.getUint16(off+28,true),
      el=dv.getUint16(off+30,true), cl=dv.getUint16(off+32,true), lo=dv.getUint32(off+42,true);
  var name=td.decode(new Uint8Array(buf,off+46,nl));
  files[name]={method:method,csize:csize,lo:lo};
  off+=46+nl+el+cl;
 }
 return {buf:buf,files:files,dv:dv};
}
function entry(z,name){
 var f=z.files[name];
 if(!f){ var low=name.toLowerCase(); for(var k in z.files){ if(k.toLowerCase()===low){f=z.files[k];break;} } }
 if(!f) return Promise.reject(new Error('missing '+name));
 var nl=z.dv.getUint16(f.lo+26,true), el=z.dv.getUint16(f.lo+28,true), start=f.lo+30+nl+el;
 var raw=new Uint8Array(z.buf,start,f.csize);
 if(f.method===0) return Promise.resolve(raw);
 if(f.method!==8) return Promise.reject(new Error('unsupported compression'));
 if(typeof DecompressionStream==='undefined') return Promise.reject(new Error('old browser'));
 var ds=new DecompressionStream('deflate-raw');
 return new Response(new Blob([raw]).stream().pipeThrough(ds)).arrayBuffer().then(function(b){return new Uint8Array(b);});
}
function text(z,name){return entry(z,name).then(function(u){return td.decode(u);});}
function join(base,rel){
 rel=String(rel||'').split('#')[0]; if(!rel) return base;
 try{ return decodeURIComponent(new URL(rel,'http://b/'+base).pathname.slice(1)); }catch(e){ return rel; }
}
function xml(s){ return new DOMParser().parseFromString(s,'application/xml'); }
function tags(doc,name){ return Array.prototype.slice.call(doc.getElementsByTagNameNS('*',name)); }

/* ---------- open a book ---------- */
function openFile(file){
 if(!file) return;
 stopTalk(); msg('Opening your book…');
 var rd=new FileReader();
 rd.onerror=function(){msg('That file could not be read. Please try again.',true);};
 rd.onload=function(){ openBuf(rd.result,{name:file.name||'book.epub',size:file.size},false); };
 rd.readAsArrayBuffer(file);
}
function openBuf(buf,file,fromShelf){
 stopTalk(); msg('Opening your book…');
 {
  var z; try{ z=readZip(buf); }catch(e){ msg('That does not look like an EPUB book. This reader opens files that end in .epub.',true); return; }
  text(z,'META-INF/container.xml').then(function(c){
   var rf=tags(xml(c),'rootfile')[0]; if(!rf) throw new Error('no rootfile');
   var opfPath=rf.getAttribute('full-path');
   return text(z,opfPath).then(function(o){ return build(z,opfPath,xml(o),file); });
  }).then(function(b){
   urls.forEach(function(u){URL.revokeObjectURL(u);}); urls=[];
   book=b; show();
   if(fromShelf) touch(b.id); else keep(b,buf,file);
  }).catch(function(e){
   msg(String(e&&e.message)==='old browser'?'This browser is too old to open the book here. Please update it, or try another browser.':
    'This file could not be opened as an EPUB book. Workbooks and puzzle books are sold as PDF and are not for this reader.',true);
  });
 }
}
function build(z,opfPath,opf,file){
 var man={}, byHref={};
 tags(opf,'item').forEach(function(it){
  var o={id:it.getAttribute('id'),href:join(opfPath,it.getAttribute('href')),type:it.getAttribute('media-type')||'',props:it.getAttribute('properties')||''};
  man[o.id]=o; byHref[o.href]=o;
 });
 var spine=[];
 tags(opf,'itemref').forEach(function(r){ var it=man[r.getAttribute('idref')]; if(it&&r.getAttribute('linear')!=='no') spine.push(it.href); });
 if(!spine.length) throw new Error('empty book');
 var t=tags(opf,'title')[0], title=(t&&t.textContent.trim())||file.name.replace(/\.epub$/i,'');
 var cover=null;
 for(var id in man){ if(/cover-image/.test(man[id].props)) cover=man[id].href; }
 if(!cover){ tags(opf,'meta').forEach(function(m){ if(m.getAttribute('name')==='cover'&&man[m.getAttribute('content')]) cover=man[m.getAttribute('content')].href; }); }
 var b={z:z,spine:spine,title:title,cover:cover,byHref:byHref,toc:[],id:title+'|'+file.size};
 var lg=tags(opf,'language')[0]; b.lang=(lg&&lg.textContent.trim())||'';
 var nav=null, ncx=null;
 for(var i2 in man){ if(/\bnav\b/.test(man[i2].props)) nav=man[i2].href; if(/ncx/.test(man[i2].type)) ncx=man[i2].href; }
 function fallback(){ b.plain=true; b.toc=spine.map(function(h,i){return {label:'Part '+(i+1),href:h,frag:''};}); return b; }
 function fromNav(s){
  var d=new DOMParser().parseFromString(s,'text/html'), navs=d.querySelectorAll('nav'), pick=navs[0];
  Array.prototype.forEach.call(navs,function(n){ if(/toc/.test(n.getAttribute('epub:type')||n.getAttribute('role')||'')) pick=n; });
  if(pick) Array.prototype.forEach.call(pick.querySelectorAll('a[href]'),function(a){
   var h=a.getAttribute('href'), lab=a.textContent.replace(/\s+/g,' ').trim();
   if(lab) b.toc.push({label:lab,href:join(nav,h),frag:(h.split('#')[1]||'')});
  });
 }
 function fromNcx(s){
  tags(xml(s),'navPoint').forEach(function(p){
   var l=tags(p,'text')[0], c=tags(p,'content')[0]; if(!l||!c) return;
   var h=c.getAttribute('src'); b.toc.push({label:l.textContent.replace(/\s+/g,' ').trim(),href:join(ncx,h),frag:(h.split('#')[1]||'')});
  });
 }
 var p=nav?text(z,nav).then(fromNav):(ncx?text(z,ncx).then(fromNcx):Promise.resolve());
 return p.catch(function(){}).then(function(){
  b.toc=b.toc.filter(function(x){return spine.indexOf(x.href)>=0;});
  return b.toc.length?b:fallback();
 });
}
function blobUrl(href){
 var it=book.byHref[href], type=(it&&it.type)||'';
 return entry(book.z,href).then(function(u){ var url=URL.createObjectURL(new Blob([u],{type:type})); urls.push(url); return url; });
}


/* ---------- page furniture: styles and the reader's own markup ---------- */
var CSS=[
'.omb .drop{border:2px dashed rgba(201,168,76,.6);border-radius:14px;padding:30px 20px;text-align:center;margin:0 0 14px;background:#000}',
'.omb .drop.over{border-style:solid;background:rgba(201,168,76,.12)}',
'.omb .big{display:inline-block;background:#C9A84C;color:#000;border-radius:8px;padding:16px 30px;font-size:22px;cursor:pointer;font-family:Georgia,serif}',
'.omb .drop input{position:absolute;left:-9999px}',
'.omb .drop .hint{font-size:16px;color:rgba(245,241,232,.75);margin:14px 0 0}',
'.omb .omb-msg{min-height:1.7em;text-align:center;color:#C9A84C;font-size:17px;margin:0 0 10px}',
'.omb .omb-msg.bad{color:#e08a7a}',
'.omb .reader{display:none}.omb.open .reader{display:block}.omb.open .start-only,.omb.open #omb-start-slot{display:none}',
'.omb .shelf{margin:0 0 20px}.omb .shelf h2{font-weight:400;color:#C9A84C;font-size:23px;margin:0 0 8px;line-height:1.3}',
'.omb .shelf .note{font-size:16px;color:rgba(245,241,232,.75);margin:0 0 12px}',
'.omb #omb-shelf-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:18px}',
'.omb #omb-shelf-list li{text-align:center}',
'.omb .sb{display:block;width:100%;background:#000;border:1px solid rgba(201,168,76,.5);border-radius:8px;padding:10px;cursor:pointer;color:#F5F1E8;font-family:Georgia,serif}',
'.omb .sb:hover{border-color:#C9A84C;background:rgba(201,168,76,.1)}',
'.omb .sb img{width:100%;height:auto;display:block;border-radius:3px;margin:0 0 8px}',
'.omb .sb .nocover{display:flex;align-items:center;justify-content:center;aspect-ratio:2/3;border:1px solid rgba(201,168,76,.4);border-radius:3px;margin:0 0 8px;padding:8px;font-size:16px;color:#C9A84C}',
'.omb .sb .st{display:block;font-size:16px;line-height:1.3;margin:0 0 8px}',
'.omb .sb .sr{display:block;background:#C9A84C;color:#000;border-radius:6px;padding:8px;font-size:18px}',
'.omb .rm{margin:8px 0 0;font-size:15px}.omb .rm span{display:block;margin:0 0 6px}',
'.omb .btn{background:#000;color:#C9A84C;border:1px solid #C9A84C;border-radius:6px;padding:10px 14px;font-size:16px;font-family:Georgia,serif;cursor:pointer}',
'.omb .btn:hover:not(:disabled){background:rgba(201,168,76,.14)}.omb .btn:disabled{opacity:.4;cursor:default}',
'.omb .btn.gold{background:#C9A84C;color:#000}.omb .btn.sm{font-size:15px;padding:6px 12px;margin:0 3px 6px}',
'.omb .head{display:flex;gap:18px;align-items:flex-start;margin:10px 0 18px;flex-wrap:wrap}',
'.omb #omb-cover img{width:120px;height:auto;border:1px solid rgba(201,168,76,.5);border-radius:4px;display:block}',
'.omb .head h2{font-weight:400;color:#C9A84C;font-size:26px;line-height:1.25;margin:0 0 8px}',
'.omb details{border:1px solid rgba(201,168,76,.4);border-radius:10px;padding:12px 16px;margin:0 0 16px}',
'.omb summary{cursor:pointer;color:#C9A84C;font-size:18px}',
'.omb #omb-toc{margin:10px 0 0;padding-left:1.4em}',
'.omb #omb-toc button{background:none;border:0;color:#F5F1E8;font:inherit;font-size:17px;text-align:left;cursor:pointer;padding:4px 0}',
'.omb #omb-toc button:hover,.omb #omb-toc button.here{color:#C9A84C}',
'.omb .strip{position:sticky;top:0;z-index:5;background:#000;border-top:1px solid rgba(201,168,76,.35);padding:8px 0 0;text-align:center}',
'.omb .strip .where{display:block;font-size:16px;color:#C9A84C;line-height:1.3;padding:0 8px}',
'.omb .strip .pg{display:block;font-family:Arial,sans-serif;font-size:14px;letter-spacing:.06em;color:#F5F1E8;padding:2px 0 6px}',
'.omb .rail{height:4px;background:rgba(201,168,76,.25)}.omb .rail i{display:block;height:4px;width:0;background:#C9A84C}',
'.omb .btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:12px 0;margin:0 0 6px;border-bottom:1px solid rgba(201,168,76,.35)}',
'@media (max-width:600px){.omb .btns{display:grid;grid-template-columns:1fr 1.5fr 1fr}.omb .btns .btn{padding:10px 6px}}',
'.omb .turn{position:sticky;z-index:4;background:#000;border:2px solid #C9A84C;border-radius:10px;padding:12px 14px;margin:8px 0 14px}',
'.omb .turn .tl{font-size:16px;color:#C9A84C;margin:0 0 6px}',
'.omb .turn .tw{font-size:22px;line-height:1.7;margin:0 0 8px}',
'.omb .turn .tw span.w{cursor:pointer;border-radius:3px;padding:0 1px}',
'.omb .turn .tw span.w.ok{color:#8FD694}',
'.omb .turn .tw span.w.miss{color:#C9A84C;text-decoration:underline dotted;text-underline-offset:5px}',
'.omb .turn .ts{font-size:16px;margin:0 0 8px;min-height:1.6em}',
'.omb .turn .ta{display:flex;gap:8px;flex-wrap:wrap}',
'.omb .turn .ask p{font-size:16px;margin:0 0 8px}',
'.omb #omb-page{font-size:20px;line-height:1.8;overflow-wrap:break-word;min-height:12em;padding:6px 0 0}',
'.omb #omb-page h1,.omb #omb-page h2,.omb #omb-page h3,.omb #omb-page h4{font-weight:400;color:#C9A84C;line-height:1.3;margin:.6em 0 .5em;text-align:left;font-size:1.5em}',
'.omb #omb-page h3,.omb #omb-page h4{font-size:1.2em}',
'.omb #omb-page p,.omb #omb-page li{font-size:1em;margin:0 0 1em}',
'.omb #omb-page img,.omb #omb-page svg{max-width:100%;height:auto;display:block;margin:1em auto}',
'.omb #omb-page table{border-collapse:collapse;font-size:.85em}.omb #omb-page .omb-tw{overflow-x:auto;max-width:100%;margin:0 0 1em}',
'.omb #omb-page td,.omb #omb-page th{border:1px solid rgba(245,241,232,.3);padding:6px 8px}',
'.omb #omb-page .omb-s{cursor:pointer}',
'.omb #omb-page .omb-s.omb-pick{outline:2px solid #C9A84C;outline-offset:2px;border-radius:2px}',
'.omb #omb-page .omb-s.omb-say{background:rgba(201,168,76,.22)}',
'.omb #omb-page .omb-xl{text-decoration:underline dotted;text-underline-offset:4px}',
'.omb .links{border-top:1px solid rgba(201,168,76,.35);margin:18px 0 0;padding:12px 0 0;font-size:16px}.omb .links p{font-size:16px;margin:0 0 6px}.omb .links li{font-size:16px;margin:0 0 4px}',
'.omb .foot{display:flex;gap:10px;justify-content:space-between;margin:24px 0 0}'
].join('\n');
(function(){ var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); })();
$('omb-start-slot').innerHTML='<div class="shelf" id="omb-shelf" hidden><h2>My books on this <span class="omb-dev">device</span></h2><p class="note">Tap a cover to read. These copies are kept on this <span class="omb-dev">device</span> only.</p><ul id="omb-shelf-list"></ul></div>'+
 '<div class="drop" id="omb-drop"><label class="big" for="omb-file">Open my book</label><input type="file" id="omb-file" accept=".epub,application/epub+zip"><p class="hint">Tap the button and choose your book file. On a computer you can also drag the file onto this box.</p></div>';
$('omb-reader-slot').innerHTML='<p class="omb-msg" id="omb-msg" role="status" aria-live="polite"></p><div class="reader">'+
 '<div class="head"><div id="omb-cover"></div><div><h2 id="omb-title"></h2><button type="button" class="btn" id="omb-other">Close this book &middot; My books</button></div></div>'+
 '<details><summary>Contents</summary><ol id="omb-toc"></ol></details>'+
 '<div class="strip" id="omb-bar"><span class="where" id="omb-where"></span><span class="pg" id="omb-pg"></span><div class="rail" aria-hidden="true"><i id="omb-rail"></i></div></div>'+
 '<div class="btns"><button type="button" class="btn" id="omb-prev">&#9664; Back</button><button type="button" class="btn gold" id="omb-say">Read it to me</button><button type="button" class="btn" id="omb-next">Next &#9654;</button><button type="button" class="btn" id="omb-turn">Your turn</button><button type="button" class="btn" id="omb-smaller" aria-label="Smaller words">A&minus;</button><button type="button" class="btn" id="omb-larger" aria-label="Bigger words">A+</button></div>'+
 '<div class="turn" id="omb-turn-box" hidden><p class="tl" id="omb-turn-lead"></p><div class="ask" id="omb-turn-ask" hidden><p>To listen, your browser sends your voice to the company that makes the browser. That company turns your voice into words. GSU does not receive it.</p><p>Or you can tap each word yourself. Then nothing is sent anywhere.</p><div class="ta"><button type="button" class="btn gold" id="omb-turn-yes">Listen to me</button><button type="button" class="btn" id="omb-turn-tap">I will tap the words</button></div></div>'+
 '<div id="omb-turn-main"><p class="tw" id="omb-turn-words"></p><p class="ts" id="omb-turn-status" role="status" aria-live="polite"></p><div class="ta"><button type="button" class="btn gold" id="omb-turn-done">I am done</button><button type="button" class="btn" id="omb-turn-again">Try again</button><button type="button" class="btn" id="omb-turn-nexts">Next sentence</button><button type="button" class="btn" id="omb-turn-mode"></button><button type="button" class="btn" id="omb-turn-close">Close</button></div></div></div>'+
 '<div id="omb-page"></div><div class="links" id="omb-links" hidden></div>'+
 '<div class="foot"><button type="button" class="btn" id="omb-prev2">&#9664; Back</button><button type="button" class="btn" id="omb-next2">Next &#9654;</button></div></div>';
if(/Android/i.test(navigator.userAgent)) $('omb-file').removeAttribute('accept');

/* ---------- show a book ---------- */
var chap={i:-1,pages:[]}, pg=0, sents=[], pick=-1, sid=0;
function show(){
 msg('');
 root.classList.add('open');
 $('omb-title').textContent=book.title;
 var cv=$('omb-cover'); cv.innerHTML='';
 if(book.cover) blobUrl(book.cover).then(function(u){ var im=document.createElement('img'); im.src=u; im.alt='Cover of '+book.title; cv.appendChild(im); }).catch(function(){});
 var ol=$('omb-toc'); ol.innerHTML='';
 book.toc.forEach(function(x){
  var li=document.createElement('li'), a=document.createElement('button'); a.type='button'; a.textContent=x.label;
  a.addEventListener('click',function(){ go(book.spine.indexOf(x.href),x.frag,0,true); });
  li.appendChild(a); ol.appendChild(li);
 });
 chap={i:-1,pages:[]};
 var m=load(), place=(m.books||{})[book.id];
 if(place&&place.ch<book.spine.length&&(place.ch>0||place.pg>0)){ go(place.ch,'',place.pg||0); msg('Welcome back. You are where you left off.'); }
 else go(0,'',0);
 try{ if(typeof window.GSU_TOOL_USED==='function') window.GSU_TOOL_USED('Open My Book'); }catch(e){}
}
var DROP='script,style,link,iframe,object,embed,form,input,button,select,textarea,meta,base,audio,video,noscript';
var BLK='p,h1,h2,h3,h4,h5,h6,ul,ol,dl,table,blockquote,figure,pre,div,section,article';
function flatten(node,out){
 Array.prototype.slice.call(node.childNodes).forEach(function(c){
  if(c.nodeType===3){ if(c.textContent.trim()){ var p=document.createElement('p'); p.textContent=c.textContent; out.push(p); } return; }
  if(c.nodeType!==1||c.localName==='hr') return;
  if(c.className!=='omb-tw'&&/^(div|section|article|main|header|footer|aside)$/.test(c.localName)&&c.querySelector(BLK)) flatten(c,out);
  else if(c.textContent.trim()||c.localName==='img'||c.localName==='svg'||c.querySelector('img,svg,image')) out.push(c);
 });
}
function wc(u){ var t=u.textContent.trim(); return (t?t.split(/\s+/).length:0)+((u.localName==='img'||u.localName==='svg'||u.querySelector('img,svg'))?60:0); }
/* Fixed pages: about 150 words to a page, never splitting a paragraph, so a page always holds the same words. */
function isHead(u){ return /^h[1-6]$/.test(u.localName); }
/* A block far longer than a page (older books: a whole chapter in one block) is cut at line breaks, then at sentence ends. */
function splitBig(u){
 if(wc(u)<=260||/^(table|ul|ol|dl|pre|figure)$/.test(u.localName)||u.className==='omb-tw'||u.querySelector('img,svg,table,ul,ol')) return [u];
 var segs=[], cur=document.createElement('p');
 Array.prototype.slice.call(u.childNodes).forEach(function(n){
  if(n.nodeType===1&&n.localName==='br'){ if(cur.textContent.trim()) segs.push(cur); cur=document.createElement('p'); }
  else cur.appendChild(n);
 });
 if(cur.textContent.trim()) segs.push(cur);
 var out=[];
 segs.forEach(function(p){
  if(wc(p)<=260){ out.push(p); return; }
  var T=p.textContent.replace(/\s+/g,' ').trim(), ends=sentEnds(T), a=0, start=0;
  for(var e=0;e<ends.length;e++){
   var piece=T.slice(start,ends[e]);
   if(piece.split(' ').length>=120||e===ends.length-1){ var q=document.createElement('p'); q.textContent=piece.trim(); if(q.textContent) out.push(q); start=ends[e]; }
  }
 });
 var fin=[]; out.forEach(function(p){
  if(wc(p)<=320){ fin.push(p); return; }
  var w=p.textContent.split(/\s+/); for(var i=0;i<w.length;i+=150){ var q=document.createElement('p'); q.textContent=w.slice(i,i+150).join(' '); fin.push(q); }
 });
 return fin.length?fin:[u];
}
function paginate(units0){
 var units=[]; units0.forEach(function(u){ splitBig(u).forEach(function(x){ units.push(x); }); });
 var P=[], c=[], n=0;
 function close(){
  /* a heading never ends a page: it goes with the text after it */
  var carry=[]; while(c.length&&isHead(c[c.length-1])) carry.unshift(c.pop());
  if(c.length) P.push(c);
  c=carry; n=0; carry.forEach(function(h){ n+=wc(h); });
 }
 units.forEach(function(u){ var w=wc(u); if(c.length&&n+w>190&&!c.every(isHead)) close(); c.push(u); n+=w; if(n>=150&&!isHead(u)) close(); });
 if(c.length) P.push(c);
 if(!P.length) P.push([]);
 return P;
}
function loadChap(i){
 if(chap.i===i) return Promise.resolve(chap);
 var href=book.spine[i];
 return text(book.z,href).then(function(s){
  var d=new DOMParser().parseFromString(s,'application/xhtml+xml');
  if(d.getElementsByTagName('parsererror').length||!d.body) d=new DOMParser().parseFromString(s,'text/html');
  var body=document.importNode(d.body||d.documentElement,true);
  Array.prototype.forEach.call(body.querySelectorAll(DROP),function(n){n.remove();});
  Array.prototype.forEach.call(body.querySelectorAll('*'),function(n){
   Array.prototype.slice.call(n.attributes).forEach(function(a){
    var nm=a.name.toLowerCase();
    if(nm.indexOf('on')===0||nm==='style'||nm==='class'||nm==='srcset') n.removeAttribute(a.name);
    else if(/^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
   });
   var tag=n.localName;
   if(tag==='img'||tag==='image'){
    var src=n.getAttribute('src')||n.getAttribute('href')||n.getAttributeNS('http://www.w3.org/1999/xlink','href')||'';
    n.removeAttribute('src');
    if(src&&!/^(https?:|data:)/i.test(src)){
     blobUrl(join(href,src)).then(function(u){
      if(tag==='img') n.setAttribute('src',u); else { n.setAttribute('href',u); n.setAttributeNS('http://www.w3.org/1999/xlink','href',u); }
     }).catch(function(){ if(tag==='img') n.setAttribute('alt',(n.getAttribute('alt')||'Picture')+' (not found in the book file)'); });
    }
   }
   if(tag==='a'&&n.hasAttribute('href')){
    var h=n.getAttribute('href');
    if(/^(https?:|mailto:)/i.test(h)){
     /* Test 1: no link leads away from the text. The words stay; the link waits in a list under the page. */
     var sp=document.createElement('span'); sp.className='omb-xl'; sp.setAttribute('data-href',h);
     while(n.firstChild) sp.appendChild(n.firstChild); n.parentNode.replaceChild(sp,n);
    } else {
     var tgt=join(href,h), fr=h.split('#')[1]||'', idx=book.spine.indexOf(tgt);
     n.setAttribute('href','#');
     n.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); if(idx>=0) go(idx,fr,0,true); else if(fr) go(cur,fr,0,true); });
    }
   }
  });
  Array.prototype.forEach.call(body.querySelectorAll('table'),function(t){ var w=document.createElement('div'); w.className='omb-tw'; w.setAttribute('tabindex','0'); t.parentNode.insertBefore(w,t); w.appendChild(t); });
  var units=[]; flatten(body,units);
  chap={i:i,pages:paginate(units)};
  return chap;
 });
}
/* Sentences: every sentence on the page becomes something you can tap. */
var ABBR={dr:1,mr:1,mrs:1,ms:1,st:1,vs:1,etc:1,no:1,fig:1,jr:1,sr:1,prof:1,gen:1,col:1,lt:1,sgt:1,rev:1,inc:1,ltd:1,co:1,pp:1,vol:1,ed:1,eg:1,ie:1};
function sentEnds(T){
 var out=[], re=/[.!?]+["”’')\]]*\s+/g, m;
 while((m=re.exec(T))){
  var end=m.index+m[0].length, nextc=T.charAt(end);
  if(!nextc) break;
  if(!/[A-Z0-9"“‘'(\[]/.test(nextc)) continue;
  if(T.charAt(m.index)==='.'){
   var w=(T.slice(Math.max(0,m.index-12),m.index).match(/([A-Za-z.]+)$/)||['',''])[1].replace(/\./g,'').toLowerCase();
   if(w.length===1||ABBR[w]) continue;
  }
  out.push(end);
 }
 out.push(T.length); return out;
}
function wrapUnit(u){
 if(u._omb) return; u._omb=1;
 var tw=document.createTreeWalker(u,NodeFilter.SHOW_TEXT,null), n, groups=[], last=null;
 while((n=tw.nextNode())){
  var b=n.parentNode.closest?n.parentNode.closest('p,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,dd,dt,td,th,caption,pre,div'):null; if(!b||!u.contains(b)) b=u;
  if(!last||last.b!==b){ last={b:b,nodes:[]}; groups.push(last); }
  last.nodes.push(n);
 }
 groups.forEach(function(g){
  var T='', offs=[]; g.nodes.forEach(function(x){ offs.push(T.length); T+=x.textContent; });
  if(!T.trim()) return;
  var ends=sentEnds(T), base=sid; sid+=ends.length;
  g.nodes.forEach(function(x,k){
   var a=offs[k], z=a+x.textContent.length, frag=document.createDocumentFragment(), pos=a;
   for(var e=0;e<ends.length&&pos<z;e++){
    if(ends[e]<=pos) continue;
    var stop=Math.min(ends[e],z), piece=T.slice(pos,stop);
    if(piece.trim()){ var sp=document.createElement('span'); sp.className='omb-s'; sp.setAttribute('data-s',base+e); sp.textContent=piece; frag.appendChild(sp); }
    else frag.appendChild(document.createTextNode(piece));
    pos=stop;
   }
   x.parentNode.replaceChild(frag,x);
  });
 });
}
function go(i,frag,want,jump){
 if(!book||i<0||i>=book.spine.length) return;
 stopTalk(); closeTurn();
 var page=$('omb-page');
 loadChap(i).then(function(c){
  cur=i;
  var k=0, n=c.pages.length, el=null;
  if(frag){ var q='[id="'+String(frag).replace(/"/g,'')+'"]'; for(var a=0;a<n&&!el;a++){ for(var b=0;b<c.pages[a].length;b++){ var u=c.pages[a][b]; if(u.id===frag||u.querySelector(q)){ k=a; el=(u.id===frag)?u:u.querySelector(q); break; } } } }
  else if(want==='last') k=n-1;
  else k=Math.max(0,Math.min(n-1,want||0));
  pg=k;
  page.innerHTML='';
  c.pages[k].forEach(function(u){ wrapUnit(u); page.appendChild(u); });
  var seen={}; sents=[];
  Array.prototype.forEach.call(page.querySelectorAll('.omb-s'),function(sp){
   sp.classList.remove('omb-pick'); sp.classList.remove('omb-say');
   var id=sp.getAttribute('data-s'); if(!seen[id]){ seen[id]={id:id,spans:[],text:''}; sents.push(seen[id]); }
   seen[id].spans.push(sp); seen[id].text+=sp.textContent;
  });
  sents.forEach(function(s){ s.text=s.text.replace(/\s+/g,' ').trim(); });
  pick=-1;
  var lk=$('omb-links'), xs=page.querySelectorAll('.omb-xl'); lk.innerHTML=''; lk.hidden=!xs.length;
  if(xs.length){ var lp=document.createElement('p'); lp.textContent='Links on this page. Each one opens in a new tab, so your place is kept.'; var ul=document.createElement('ul');
   Array.prototype.forEach.call(xs,function(x){ var li=document.createElement('li'), a=document.createElement('a'); a.href=x.getAttribute('data-href'); a.target='_blank'; a.rel='noopener'; a.textContent=x.textContent.trim()||x.getAttribute('data-href'); li.appendChild(a); ul.appendChild(li); });
   lk.appendChild(lp); lk.appendChild(ul); }
  $('omb-where').textContent=chapName(i);
  $('omb-pg').textContent='Page '+(k+1)+' of '+n;
  $('omb-rail').style.width=Math.round(100*(k+1)/n)+'%';
  var first=(i===0&&k===0), lastp=(i===book.spine.length-1&&k===n-1);
  $('omb-prev').disabled=first; $('omb-prev2').disabled=first; $('omb-next').disabled=lastp; $('omb-next2').disabled=lastp;
  Array.prototype.forEach.call($('omb-toc').querySelectorAll('button'),function(b2,x){ b2.classList.toggle('here',book.spine.indexOf(book.toc[x].href)===i); });
  remember();
  if(jump){ if(el&&frag&&frag!=='top') el.scrollIntoView(); else scrollToBar(); }
 }).catch(function(){ page.textContent='This part of the book could not be shown.'; });
}
function scrollToBar(){ var b=$('omb-bar'), t=parseInt(b.style.top,10)||0, r=b.getBoundingClientRect(); window.scrollTo(0,window.scrollY+r.top-t); }
function step(d){
 if(!book) return; var n=chap.pages.length;
 if(d>0){ if(pg<n-1) go(cur,'',pg+1,true); else if(cur<book.spine.length-1) go(cur+1,'',0,true); }
 else { if(pg>0) go(cur,'',pg-1,true); else if(cur>0) go(cur-1,'','last',true); }
}
function chapName(i){
 var n=book.spine.length;
 if(book.plain) return 'Part '+(i+1)+' of '+n;
 var best='', bi=-1;
 book.toc.forEach(function(x){ var k=book.spine.indexOf(x.href); if(k<=i&&k>bi){ bi=k; best=x.label; } });
 if(!best) return i===0?'Cover':'The front pages';
 return best.length>70?best.slice(0,67)+'…':best;
}
function remember(){
 if(!book) return; var m=load(); m.books=m.books||{}; m.books[book.id]={ch:cur,pg:pg,t:Date.now()}; m.size=size;
 var ids=Object.keys(m.books); if(ids.length>24){ ids.sort(function(a,b){return m.books[a].t-m.books[b].t;}); delete m.books[ids[0]]; }
 save(m);
}
function setSize(s){ size=Math.max(16,Math.min(34,s)); $('omb-page').style.fontSize=size+'px'; var m=load(); m.size=size; save(m); }
setSize(size);
$('omb-smaller').addEventListener('click',function(){setSize(size-2);});
$('omb-larger').addEventListener('click',function(){setSize(size+2);});

/* ---------- choose a sentence ---------- */
function choose(k,quiet){
 sents.forEach(function(s,j){ s.spans.forEach(function(sp){ sp.classList.toggle('omb-pick',j===k); }); });
 pick=k;
 if(!quiet&&turnOn) loadTurn();
}
$('omb-page').addEventListener('click',function(e){
 var t=e.target; if(!t||!t.closest) return; if(t.closest('a')) return;
 var sp=t.closest('.omb-s'); if(!sp) return;
 var id=sp.getAttribute('data-s');
 for(var j=0;j<sents.length;j++){ if(sents[j].id===id){ if(talking) stopTalk(); choose(j); break; } }
});

/* ---------- read aloud: one sentence at a time, and it stops at the end of the page ---------- */
var synth=window.speechSynthesis, qi=0, chunks=[], ci=0, gen=0, talking=false;
function split(t){
 if(t.length<=220) return [t];
 var out=[], parts=t.split(/(?:,|;|:|—)\s+/), c='';
 parts.forEach(function(p){ if(c&&(c+', '+p).length>214){ out.push(c); c=p; } else c=c?c+', '+p:p; });
 if(c) out.push(c);
 var fin=[]; out.forEach(function(o){ while(o.length>240){ var cut=o.lastIndexOf(' ',220); if(cut<40) cut=220; fin.push(o.slice(0,cut)); o=o.slice(cut+1); } fin.push(o); });
 return fin;
}
function markSay(k){ sents.forEach(function(s,j){ s.spans.forEach(function(sp){ sp.classList.toggle('omb-say',j===k); }); }); }
function speakS(){
 var g=gen;
 while(qi<sents.length&&!/[A-Za-z0-9]/.test(sents[qi].text)) qi++;
 if(qi>=sents.length){ talking=false; gen++; markSay(-1); choose(-1,true); $('omb-say').textContent='Read it to me'; msg('That is the end of this page. Turn the page when you are ready.'); return; }
 choose(qi,true); markSay(qi); chunks=split(sents[qi].text); ci=0; speakC(g);
}
function speakC(g){
 if(g!==gen) return;
 if(ci>=chunks.length){ qi++; speakS(); return; }
 var u=new SpeechSynthesisUtterance(chunks[ci]); u.rate=0.95; if(book&&book.lang) u.lang=book.lang;
 u.onend=function(){ if(g!==gen) return; ci++; speakC(g); };
 u.onerror=function(e){ if(g!==gen) return; if(e&&(e.error==='interrupted'||e.error==='canceled')) return; ci++; speakC(g); };
 synth.speak(u);
}
function stopTalk(){ gen++; if(talking){ talking=false; markSay(-1); } if(synth) synth.cancel(); var b=$('omb-say'); if(b) b.textContent='Read it to me'; }
$('omb-say').addEventListener('click',function(){
 if(talking){ stopTalk(); return; }
 if(!synth||typeof SpeechSynthesisUtterance==='undefined'){ msg('This browser cannot read aloud. You can still read the page yourself.',true); return; }
 if(!sents.length){ msg('There are no words on this page to read aloud.'); return; }
 closeTurn(); msg(''); synth.cancel(); gen++; talking=true; qi=pick>=0?pick:0; $('omb-say').textContent='Stop reading'; speakS();
});
window.addEventListener('beforeunload',function(){ if(synth) synth.cancel(); });

/* ---------- your turn: the learner reads a sentence back; the page listens, or the learner taps the words ---------- */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=null, tw=[], turnOn=false, tmode='', listening=false;
function norm(w){ return String(w).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9']/g,'').replace(/^'+|'+$/g,''); }
function near(a,b){
 if(a===b) return true;
 if(a.length<5||b.length<5||Math.abs(a.length-b.length)>1) return false;
 var i=0,j=0,d=0;
 while(i<a.length&&j<b.length){ if(a.charAt(i)===b.charAt(j)){ i++; j++; } else { if(++d>1) return false; if(a.length>b.length) i++; else if(b.length>a.length) j++; else { i++; j++; } } }
 return d+(a.length-i)+(b.length-j)<=1;
}
/* Walk the sentence in order. Each heard word may match any of the next four words, so one skipped word does not derail the rest. */
function matchWords(target,heardText){
 var got=target.map(function(){return false;}), p=0;
 String(heardText).split(/\s+/).map(norm).filter(Boolean).forEach(function(h){
  for(var j=p;j<Math.min(target.length,p+4);j++){ if(near(h,target[j])){ got[j]=true; p=j+1; break; } }
 });
 return got;
}
function counts(){ var n=0; tw.forEach(function(w){ if(w.ok) n++; }); return [n,tw.length]; }
function paint(final){ tw.forEach(function(w){ w.el.className='w'+(w.ok?' ok':(final?' miss':'')); }); }
function loadTurn(){
 stopRec();
 if(pick<0||!sents[pick]) choose(firstReal(),true);
 var s=sents[pick], box=$('omb-turn-words'); box.innerHTML=''; tw=[];
 if(!s){ $('omb-turn-status').textContent='There is no sentence on this page to read.'; return; }
 s.text.split(/\s+/).forEach(function(tok,k){
  if(k) box.appendChild(document.createTextNode(' '));
  var n=norm(tok);
  if(!n){ box.appendChild(document.createTextNode(tok)); return; }
  var sp=document.createElement('span'); sp.className='w'; sp.textContent=tok; box.appendChild(sp);
  var w={n:n,el:sp,ok:false}; tw.push(w);
  sp.addEventListener('click',function(){ w.ok=!w.ok; paint(false); if(!listening) tell(); });
 });
 $('omb-turn-lead').textContent='Your turn. Read this sentence out loud.';
 begin();
}
function firstReal(){ for(var j=0;j<sents.length;j++){ if(/[A-Za-z0-9]/.test(sents[j].text)) return j; } return -1; }
function tell(){ var c=counts(); $('omb-turn-status').textContent=(tmode==='listen'?'The page heard ':'You marked ')+c[0]+' of '+c[1]+' words.'; }
function begin(){
 var m=load(), ask=$('omb-turn-ask'), main=$('omb-turn-main'), mb=$('omb-turn-mode');
 tw.forEach(function(w){ w.ok=false; }); paint(false);
 if(SR&&!m.mic){ ask.hidden=false; main.hidden=true; return; }
 ask.hidden=true; main.hidden=false;
 mb.hidden=!SR; 
 if(SR&&m.mic==='yes'){ mb.textContent='Tap the words instead'; listen(); }
 else { mb.textContent='Listen to me instead'; tapMode(''); }
}
function tapMode(why){ stopRec(); tmode='tap'; $('omb-turn-status').textContent=(why||'')+'Tap each word as you read it out loud.'; }
function listen(){
 tmode='listen';
 try{
  rec=new SR(); rec.lang=(book&&book.lang&&!/^en/i.test(book.lang))?book.lang:'en-US'; rec.interimResults=true; rec.continuous=true;
  var mine=rec;
  rec.onresult=function(e){
   if(rec!==mine) return; var s='';
   for(var i=0;i<e.results.length;i++) s+=' '+e.results[i][0].transcript;
   var got=matchWords(tw.map(function(w){return w.n;}),s);
   tw.forEach(function(w,k){ if(got[k]) w.ok=true; }); paint(false);
   var c=counts(); if(c[0]===c[1]) finish();
  };
  rec.onerror=function(e){
   if(rec!==mine) return; var er=e&&e.error;
   if(er==='not-allowed'||er==='service-not-allowed'||er==='audio-capture'){ rec=null; listening=false; tapMode('The microphone is not on. '); }
   else if(er==='network'||er==='language-not-supported'){ rec=null; listening=false; tapMode('The page cannot listen right now. '); }
  };
  rec.onend=function(){ if(rec!==mine) return; if(listening){ listening=false; rec=null; var c=counts(); if(c[0]<c[1]) $('omb-turn-status').textContent='The page stopped listening. It heard '+c[0]+' of '+c[1]+' words. Press Try again, or tap a word you read to mark it yourself.'; } };
  rec.start(); listening=true;
  $('omb-turn-status').textContent='The page is listening. Read the sentence out loud.';
 }catch(err){ rec=null; listening=false; tapMode('The page cannot listen in this browser. '); }
}
function stopRec(){ listening=false; if(rec){ var r=rec; rec=null; try{ r.onresult=null; r.onend=null; r.onerror=null; r.stop(); }catch(e){} } }
function finish(){
 stopRec(); var c=counts(), st=$('omb-turn-status'); paint(true);
 if(tmode==='listen') st.textContent=(c[0]===c[1])?'The page heard all '+c[1]+' words.':'The page heard '+c[0]+' of '+c[1]+' words. Try the gold words again, or tap a word you read to mark it yourself.';
 else st.textContent=(c[0]===c[1])?'You marked all '+c[1]+' words.':'You marked '+c[0]+' of '+c[1]+' words. Read the gold words again when you are ready.';
}
function closeTurn(){ if(!turnOn) return; stopRec(); turnOn=false; $('omb-turn-box').hidden=true; }
$('omb-turn').addEventListener('click',function(){
 if(turnOn){ closeTurn(); return; }
 if(!book) return; stopTalk(); msg('');
 if(firstReal()<0){ msg('There is no sentence on this page to read aloud.'); return; }
 turnOn=true; var bx=$('omb-turn-box'); bx.hidden=false; navTop(); loadTurn();
});
$('omb-turn-yes').addEventListener('click',function(){ var m=load(); m.mic='yes'; save(m); begin(); });
$('omb-turn-tap').addEventListener('click',function(){ var m=load(); m.mic='tap'; save(m); begin(); });
$('omb-turn-mode').addEventListener('click',function(){ var m=load(); m.mic=(m.mic==='yes')?'tap':'yes'; save(m); begin(); });
$('omb-turn-done').addEventListener('click',finish);
$('omb-turn-again').addEventListener('click',begin);
$('omb-turn-nexts').addEventListener('click',function(){ var j=pick+1; while(j<sents.length&&!/[A-Za-z0-9]/.test(sents[j].text)) j++; if(j>=sents.length){ stopRec(); $('omb-turn-status').textContent='That was the last sentence on this page. Turn the page when you are ready.'; return; } choose(j,true); loadTurn(); var sp=sents[j].spans[0]; if(sp&&sp.scrollIntoView) sp.scrollIntoView({block:'center'}); });
$('omb-turn-close').addEventListener('click',closeTurn);


/* ---------- my books: a shelf kept in this browser only ---------- */
var DBN='gsu-omb', MAXB=20, db=null, shelfUrls=[];
var DEV=/iPad|Tablet/i.test(navigator.userAgent)?'tablet':(/Mobi|Android|iPhone/i.test(navigator.userAgent)?'phone':'computer');
Array.prototype.forEach.call(root.querySelectorAll('.omb-dev'),function(e){ e.textContent=DEV; });
function openDb(){
 return new Promise(function(res){
  if(db) return res(db); if(!window.indexedDB) return res(null);
  try{
   var rq=indexedDB.open(DBN,1);
   rq.onupgradeneeded=function(){ var d=rq.result; if(!d.objectStoreNames.contains('meta')) d.createObjectStore('meta',{keyPath:'id'}); if(!d.objectStoreNames.contains('files')) d.createObjectStore('files'); };
   rq.onsuccess=function(){ db=rq.result; res(db); }; rq.onerror=function(){res(null);}; rq.onblocked=function(){res(null);};
  }catch(e){ res(null); }
 });
}
function tx(stores,mode,fn){
 return openDb().then(function(d){
  if(!d) throw new Error('no shelf');
  return new Promise(function(res,rej){
   var t=d.transaction(stores,mode), out;
   t.oncomplete=function(){ res(out&&out.result); }; t.onerror=function(){ rej(t.error||new Error('shelf')); }; t.onabort=function(){ rej(t.error||new Error('shelf')); };
   out=fn(t);
  });
 });
}
function listShelf(){ return tx(['meta'],'readonly',function(t){ return t.objectStore('meta').getAll(); }).then(function(a){ a=a||[]; a.sort(function(x,y){return y.t-x.t;}); return a; }).catch(function(){ return []; }); }
function keep(b,buf,file){
 var coverP=b.cover?entry(b.z,b.cover).then(function(u){ return {buf:u.buffer.slice(u.byteOffset,u.byteOffset+u.byteLength),type:(b.byHref[b.cover]&&b.byHref[b.cover].type)||'image/jpeg'}; }).catch(function(){return null;}):Promise.resolve(null);
 return Promise.all([coverP,listShelf()]).then(function(r){
  var have=r[1].some(function(x){return x.id===b.id;});
  if(!have&&r[1].length>=MAXB){ msg('Your shelf is full. Take a book off the shelf to keep this one. The book is still open.'); return; }
  var meta={id:b.id,title:b.title,name:file.name,size:file.size,t:Date.now(),cover:r[0]&&r[0].buf,ctype:r[0]&&r[0].type};
  return tx(['meta','files'],'readwrite',function(t){ t.objectStore('files').put(buf,b.id); return t.objectStore('meta').put(meta); }).then(function(){
   try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}
   if(!have&&book&&book.id===b.id&&!$('omb-msg').textContent) msg('This book is now on your shelf on this '+DEV+'. Next time, '+(DEV==='computer'?'click':'tap')+' its cover.');
  });
 }).catch(function(){ if(book&&book.id===b.id) msg('This book is open, but it could not be kept on your shelf. Open it from the file next time.'); });
}
function touch(id){ tx(['meta'],'readwrite',function(t){ var st=t.objectStore('meta'), g=st.get(id); g.onsuccess=function(){ if(g.result){ g.result.t=Date.now(); st.put(g.result); } }; return g; }).catch(function(){}); }
function removeBook(id){ return tx(['meta','files'],'readwrite',function(t){ t.objectStore('files').delete(id); return t.objectStore('meta').delete(id); }).then(function(){ var m=load(); if(m.books&&m.books[id]){ delete m.books[id]; save(m); } }).catch(function(){}); }
function openShelf(id){
 msg('Opening your book…');
 tx(['meta','files'],'readonly',function(t){ var o={}, a=t.objectStore('files').get(id), c=t.objectStore('meta').get(id); a.onsuccess=function(){o.buf=a.result;}; c.onsuccess=function(){o.meta=c.result;}; return {get result(){return o;}}; })
 .then(function(o){ if(!o||!o.buf||!o.meta) throw new Error('gone'); openBuf(o.buf,{name:o.meta.name,size:o.meta.size},true); })
 .catch(function(){ msg('That book is no longer on the shelf. Open it from the file.',true); drawShelf(); });
}
function drawShelf(){
 var box=$('omb-shelf'), list=$('omb-shelf-list'); if(!box||!list) return Promise.resolve(0);
 return listShelf().then(function(a){
  shelfUrls.forEach(function(u){URL.revokeObjectURL(u);}); shelfUrls=[]; list.innerHTML='';
  box.hidden=!a.length;
  a.forEach(function(x){
   var li=document.createElement('li'), op=document.createElement('button'); op.type='button'; op.className='sb';
   if(x.cover){ var im=document.createElement('img'), u=URL.createObjectURL(new Blob([x.cover],{type:x.ctype||'image/jpeg'})); shelfUrls.push(u); im.src=u; im.alt=''; op.appendChild(im); }
   else { var ph=document.createElement('span'); ph.className='nocover'; ph.textContent=x.title; op.appendChild(ph); }
   var tt=document.createElement('span'); tt.className='st'; tt.textContent=x.title; op.appendChild(tt);
   var rd=document.createElement('span'); rd.className='sr'; rd.textContent='Read'; op.appendChild(rd);
   op.addEventListener('click',function(){ openShelf(x.id); });
   var rm=document.createElement('div'); rm.className='rm';
   function ask(){ rm.innerHTML=''; var b1=document.createElement('button'); b1.type='button'; b1.className='btn sm'; b1.textContent='Remove'; b1.setAttribute('aria-label','Remove '+x.title+' from this shelf'); b1.addEventListener('click',sure); rm.appendChild(b1); }
   function sure(){ rm.innerHTML=''; var q=document.createElement('span'); q.textContent='Take it off this shelf?'; var y=document.createElement('button'); y.type='button'; y.className='btn sm gold'; y.textContent='Yes, remove'; var n=document.createElement('button'); n.type='button'; n.className='btn sm'; n.textContent='Keep it';
    y.addEventListener('click',function(){ removeBook(x.id).then(drawShelf); }); n.addEventListener('click',ask); rm.appendChild(q); rm.appendChild(y); rm.appendChild(n); }
   ask(); li.appendChild(op); li.appendChild(rm); list.appendChild(li);
  });
  return a.length;
 });
}
drawShelf();

/* ---------- controls ---------- */
$('omb-prev').addEventListener('click',function(){step(-1);}); $('omb-next').addEventListener('click',function(){step(1);});
$('omb-prev2').addEventListener('click',function(){step(-1);}); $('omb-next2').addEventListener('click',function(){step(1);});
var inp=$('omb-file');
inp.addEventListener('change',function(){ openFile(inp.files&&inp.files[0]); inp.value=''; });
$('omb-other').addEventListener('click',function(){ closeBook(); });
function closeBook(){ stopTalk(); closeTurn(); book=null; chap={i:-1,pages:[]}; sents=[]; urls.forEach(function(u){URL.revokeObjectURL(u);}); urls=[]; root.classList.remove('open'); msg(''); $('omb-page').innerHTML=''; drawShelf(); root.scrollIntoView(); }
var drop=$('omb-drop');
['dragenter','dragover'].forEach(function(ev){ drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over');}); });
['dragleave','drop'].forEach(function(ev){ drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over');}); });
drop.addEventListener('drop',function(e){ var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]; openFile(f); });
function navTop(){ var t=0; try{ var n=document.querySelector('nav.gn'); if(n){ var ps=getComputedStyle(n).position; if(ps==='fixed'||ps==='sticky'){ t=Math.max(0,Math.round(n.getBoundingClientRect().bottom)); if(t>window.innerHeight*0.45) t=0; } } }catch(e){} var b=$('omb-bar'); b.style.top=t+'px'; $('omb-turn-box').style.top=(t+b.offsetHeight+4)+'px'; }
navTop(); window.addEventListener('resize',navTop); setTimeout(navTop,1500);
window.GSU_OMB={open:openFile,close:closeBook,shelf:listShelf,match:function(sentence,heard){ var t=String(sentence).split(/\s+/).map(norm).filter(Boolean), g=matchWords(t,heard), n=0; g.forEach(function(x){ if(x) n++; }); return [n,t.length]; },
 state:function(){ return {open:!!book,where:$('omb-where').textContent,part:cur,parts:book?book.spine.length:0,page:pg,pages:chap.pages.length,sentences:sents.length,pick:pick,size:size,talking:talking,turn:turnOn,mode:tmode,title:book&&book.title,toc:book?book.toc.length:0}; }};

})();
