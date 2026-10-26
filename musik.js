/* ===== MUSIK LATAR =====
   Ada file mp3  -> playlist diacak (shuffle), lagu berikutnya otomatis saat satu lagu selesai.
   Tidak ada mp3 -> musik lo-fi dibuat otomatis di browser. */
(function(){
  var $=function(s){return document.querySelector(s)},mb=$('#mus'),mt=$('#mt'),vol=$('#vol'),nx=$('#nxt'),toast=$('#toast'),
      want=true,c=null,master=null,nzb=null,timer=null,next=0,step=0,el=null,tt=0,BPM=84,V=60,
      LIST=window.PLAYLIST||[],order=[],pos=-1,last=-1,errs=0;
  try{if(localStorage.getItem('musik')==='off')want=false;var sv=localStorage.getItem('musikvol');if(sv!==null)V=+sv}catch(e){}
  vol.value=V;
  if(LIST.length)nx.hidden=false;
  function say(t){toast.textContent=t;toast.classList.remove('off');clearTimeout(tt);tt=setTimeout(function(){toast.classList.add('off')},2600)}
  function ui(){mb.setAttribute('aria-pressed',want);mt.textContent=want?'Musik: nyala':'Musik: mati'}

  /* --- playlist shuffle (Fisher-Yates) --- */
  function shuffle(){
    var i,j,t;order=LIST.map(function(_,n){return n});
    for(i=order.length-1;i>0;i--){j=Math.floor(Math.random()*(i+1));t=order[i];order[i]=order[j];order[j]=t}
    /* jangan ulang lagu yang sama persis di pergantian putaran */
    if(order.length>1&&order[0]===last){t=order[0];order[0]=order[order.length-1];order[order.length-1]=t}
    pos=-1;
  }
  function nextTrack(){
    if(!LIST.length||!el)return;
    pos++;if(pos>=order.length){shuffle();pos=0}
    last=order[pos];
    el.src=LIST[last].src;
    el.play().catch(function(){});
    say('\u266A '+LIST[last].name);
  }

  function mf(n){return 440*Math.pow(2,(n-69)/12)}
  var CH=[{r:45,n:[57,60,64,67]},{r:41,n:[53,57,60,64]},{r:38,n:[53,57,60,65]},{r:40,n:[56,59,62,64]}],
      ARP=[0,-1,2,-1,3,-1,2,-1,1,-1,3,-1,2,3,-1,-1];
  function voice(type,f,t,dur,vl,lp){
    var o=c.createOscillator(),g=c.createGain(),out=o;
    o.type=type;o.frequency.value=f;
    if(lp){var fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl);out=fl}
    out.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vl,t+.02);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);g.connect(master);o.start(t);o.stop(t+dur+.05);
  }
  function kick(t){var o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(140,t);
    o.frequency.exponentialRampToValueAtTime(42,t+.16);g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+.25)}
  function hiss(t,dur,type,fr,vl){
    var s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
    s.buffer=nzb;f.type=type;f.frequency.value=fr;
    g.gain.setValueAtTime(vl,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.02);
  }
  function play(s,t){
    var bar=Math.floor(step/16)%4,ch=CH[bar],sec=60/BPM/4;
    if(s===0||s===7||s===10)kick(t);
    if(s===4||s===12)hiss(t,.14,'bandpass',1800,.22);
    if(s%2===0)hiss(t,.04,'highpass',7500,s%4===0?.1:.06);
    if(s===14)hiss(t,.12,'highpass',6500,.07);
    if(s===0||s===6||s===10||s===14)voice('triangle',mf(ch.r+(s===6?7:0)),t,sec*3.5,.34,600);
    if(s===0)ch.n.forEach(function(n){voice('sawtooth',mf(n),t,sec*15,.028,1100)});
    var a=ARP[s];if(a>=0)voice('sine',mf(ch.n[a]+12),t,sec*2.6,.1);
    if(s===8&&bar%2===1)voice('triangle',mf(ch.n[3]+24),t,sec*5,.06);
  }
  function sched(){
    var sec=60/BPM/4;
    while(next<c.currentTime+.2){play(step%16,next+(step%2?sec*.14:0));next+=sec;step++}
  }
  function level(){var g=V/100*.55;if(master)master.gain.setTargetAtTime(g,c.currentTime,.08);if(el)el.volume=V/100}
  function start(){
    try{
      if(LIST.length){
        if(!el){
          el=new Audio();el.preload='auto';
          el.addEventListener('ended',nextTrack);
          el.addEventListener('playing',function(){errs=0});
          el.addEventListener('error',function(){if(++errs<=LIST.length)nextTrack();else say('Lagu tidak bisa diputar')});
          shuffle();level();nextTrack();return;
        }
        level();el.play().catch(function(){});return;
      }
      if(!c){
        c=new (window.AudioContext||window.webkitAudioContext)();
        var comp=c.createDynamicsCompressor();master=c.createGain();master.gain.value=.0001;
        master.connect(comp);comp.connect(c.destination);
        var n=c.sampleRate;nzb=c.createBuffer(1,n,n);var d=nzb.getChannelData(0);for(var i=0;i<n;i++)d[i]=Math.random()*2-1;
      }
      if(c.state==='suspended')c.resume();
      if(!timer){next=c.currentTime+.08;timer=setInterval(sched,25)}
      level();
    }catch(e){}
  }
  function stop(){
    if(el)el.pause();
    if(timer){clearInterval(timer);timer=null}
    if(master)master.gain.setTargetAtTime(.0001,c.currentTime,.05);
  }
  function toggle(){want=!want;try{localStorage.setItem('musik',want?'on':'off')}catch(e){}
    ui();if(want){start();if(!LIST.length)say('Musik nyala')}else{stop();say('Musik mati')}}
  mb.addEventListener('click',function(e){e.stopPropagation();toggle()});
  nx.addEventListener('click',function(e){e.stopPropagation();if(!want){want=true;ui()}if(el)nextTrack();else start()});
  vol.addEventListener('input',function(){V=+vol.value;try{localStorage.setItem('musikvol',V)}catch(e){}level()});
  document.addEventListener('keydown',function(e){if(e.key==='m'||e.key==='M')toggle()});
  /* iOS hanya membuka audio pada touchend/click, jadi dicoba pada tiap interaksi sampai berbunyi */
  function running(){return (timer&&c&&c.state==='running')||(el&&!el.paused)}
  function first(){if(!want||running())return;start()}
  ['click','touchend','keydown'].forEach(function(n){document.addEventListener(n,first,true)});
  document.addEventListener('visibilitychange',function(){
    if(!want)return;
    if(document.hidden){if(c)c.suspend();if(el)el.pause()}else{if(c)c.resume();if(el)el.play().catch(function(){})}});
  ui();
  if(want)say(LIST.length?'Ketuk di mana saja untuk memulai musik  \u00B7  M = nyala/mati':'Ketuk di mana saja untuk memulai musik  \u00B7  M = nyala/mati');
})();
