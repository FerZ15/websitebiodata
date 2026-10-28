(function(){
  var $=function(s){return document.querySelector(s)},
      PAGE=document.body.getAttribute('data-page')||'home',HOME=PAGE==='home',
      its=[].slice.call(document.querySelectorAll('.it')),
      slabs=[].slice.call(document.querySelectorAll('.slab')),
      home=$('#home'),view=$('#view'),iris=$('#iris'),lbl=$('#lbl'),lbl2=$('#lbl2'),desc=$('#desc'),
      names=['profil','proyek','keahlian','kesan','kontak'],
      titles=['Profil','Proyek','Keahlian','Kesan & Pesan','Kontak'],
      descs=['Lihat profil saya','Lihat tugas dan proyek kuliah','Lihat kemampuan saya','Baca kesan dan pesan saya','Ajak saya bekerja sama'],
      me=names.indexOf(PAGE),calm=false,sel=Math.max(me,0),busy=false,on=true,ctx=null,nz=null,wheelAt=0;

  /* penyimpanan sementara antarhalaman (sessionStorage): menu terpilih + penanda transisi */
  function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);if(v===null)sessionStorage.removeItem(k);else sessionStorage.setItem(k,v)}catch(e){}return null}
  if(HOME){var s0=+ss('sel');if(s0>0&&s0<names.length)sel=s0}

  var anm=$('#anm');
  function SHORT(){return window.matchMedia&&matchMedia('(max-width:480px)').matches}
  function setAnim(){document.documentElement.classList.toggle('noanim',calm);anm.setAttribute('aria-pressed',!calm);anm.textContent=SHORT()?'Animasi':(calm?'Animasi: mati':'Animasi: nyala');if(window.Air)Air.setCalm(calm)}
  try{if(localStorage.getItem('anim')==='off')calm=true}catch(e){}
  setAnim();
  if(calm)document.documentElement.classList.remove('tr');
  anm.addEventListener('click',function(){calm=!calm;setAnim();try{localStorage.setItem('anim',calm?'off':'on')}catch(e){}sOk()});

  var d=new Date(),hr=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  $('#tgl').textContent=(d.getMonth()+1)+'/'+d.getDate();$('#hari').textContent=hr[d.getDay()];

  /* ===== EFEK SUARA (Web Audio) ===== */
  function ac(){
    ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')ctx.resume();
    return ctx;
  }
  function tone(f1,f2,dur,type,vol,delay){
    if(!on)return;
    try{
      var c=ac(),t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();
      o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
      g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur);
    }catch(e){}
  }
  function noise(dur,f1,f2,vol,delay,q,type){
    if(!on)return;
    try{
      var c=ac();
      if(!nz){var n=c.sampleRate,bf=c.createBuffer(1,n,c.sampleRate),ch=bf.getChannelData(0);
        for(var i=0;i<n;i++)ch[i]=Math.random()*2-1;nz=bf}
      var t=c.currentTime+(delay||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
      s.buffer=nz;f.type=type||'bandpass';f.Q.value=q||1;
      f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+dur);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+dur*.35);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      s.connect(f);f.connect(g);g.connect(c.destination);s.start(t);s.stop(t+dur+.02);
    }catch(e){}
  }
  function sMove(){noise(.03,3500,4800,.05,0,.8,'highpass');tone(320,640,.09,'triangle',.09)}
  function sOk(){tone(150,90,.16,'sine',.1);tone(525,700,.12,'triangle',.08);tone(700,1050,.18,'triangle',.07,.07)}
  function sOpen(){noise(.55,250,3200,.24,0,1.2);tone(150,90,.14,'sine',.1);
    tone(130,45,.32,'sine',.22,.42);tone(525,1050,.2,'triangle',.07,.46)}
  function sClose(){noise(.55,3200,250,.22,0,1.2);tone(700,350,.16,'triangle',.08);
    tone(520,260,.18,'triangle',.07,.12);tone(110,45,.3,'sine',.2,.4)}
  function sSwitch(up){noise(.36,up?400:2600,up?2600:400,.17,0,1.5);
    tone(up?480:720,up?720:480,.1,'triangle',.08);tone(up?720:480,up?960:360,.1,'triangle',.07,.07);tone(120,60,.2,'sine',.12,.3)}
  /* suara rana kamera saat foto dibuka, dan klik halus saat ditutup */
  function sFoto(){noise(.05,5200,2600,.22,0,.8,'highpass');tone(1900,950,.05,'square',.035);
    noise(.08,3600,1700,.2,.09,.8,'highpass');tone(650,300,.09,'triangle',.08,.09);tone(1200,1800,.12,'sine',.05,.2)}
  function sFotoTutup(){tone(520,260,.1,'triangle',.07);noise(.08,2600,900,.1,0,1,'bandpass')}
  if(SHORT())$('#snd').textContent='Suara';
  $('#snd').addEventListener('click',function(){on=!on;this.setAttribute('aria-pressed',on);this.textContent=SHORT()?'Suara':(on?'Suara: nyala':'Suara: mati');sOk()});
  /* "blub" halus saat mengetuk area kosong (bareng riak di air.js) */
  function sBlub(){tone(420,980,.07,'sine',.06);tone(300,700,.05,'sine',.04,.04)}
  document.addEventListener('pointerdown',function(e){if(!e.target.closest('button,a,input,#lb'))sBlub()},{passive:true});

  /* ===== MENU SEPERTI RODA (beranda) ===== */
  var heroImgs=[].slice.call(document.querySelectorAll('.hero img'));
  function layout(){
    if(!HOME)return;
    heroImgs.forEach(function(im,i){im.classList.toggle('on',i===sel%heroImgs.length)});
    its.forEach(function(b,i){var k=i-sel;
      b.style.setProperty('--d',k);b.style.setProperty('--ad',Math.abs(k));
      b.setAttribute('aria-current',i===sel);});
    home.style.setProperty('--sel',sel);
    desc.textContent=descs[sel];ss('sel',sel);
  }
  function itemPos(){var r=its[sel].getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}
  function pick(n){
    sel=(n+its.length)%its.length;layout();sMove();
    setTimeout(function(){if(window.Air&&!calm){var p=itemPos();Air.burst(p[0],p[1],10)}},90);
  }

  /* ===== TRANSISI (sama seperti sebelumnya, kini lintas halaman) ===== */
  var OFFL='translateX(-190vw) skewX(-16deg)',ON='translateX(0) skewX(-16deg)',OFFR='translateX(190vw) skewX(-16deg)',
      DUR=400,GAP=55;
  /* iris = lingkaran navy yang di-scale (jalur GPU, jauh lebih mulus daripada animasi clip-path) */
  /* "percikan air" ala menu P3R: tiga lingkaran bertumpuk (putih -> cyan -> navy) dengan jeda singkat,
     jadi tepi lingkaran yang membesar/menyusut tampak berlapis seperti riak air */
  var ic=document.createElement('span'),icc=document.createElement('span'),icw=document.createElement('span');
  ic.id='ic';icc.id='icc';icw.id='icw';
  iris.insertBefore(ic,iris.firstChild);iris.insertBefore(icc,ic);iris.insertBefore(icw,icc);
  function irisGo(grow,x,y){
    var W=innerWidth,H=innerHeight,D=2*Math.hypot(Math.max(x,W-x),Math.max(y,H-y))+8,
        o={duration:500,easing:'cubic-bezier(.6,0,.25,1)',fill:'both'},
        kf=grow?[{transform:'scale(0)'},{transform:'scale(1)'}]:[{transform:'scale(1)'},{transform:'scale(0)'}],
        L=grow?[icw,icc,ic]:[ic,icc,icw];                      /* urutan: yang pertama bergerak -> terakhir */
    L.forEach(function(el){el.style.width=el.style.height=D+'px';el.style.left=(x-D/2)+'px';el.style.top=(y-D/2)+'px'});
    lbl.animate(grow?[{opacity:0},{opacity:0,offset:.55},{opacity:1}]:[{opacity:1},{opacity:1,offset:.4},{opacity:0}],
      {duration:600,easing:o.easing,fill:'forwards'});
    var last;
    L.forEach(function(el,i){var a=el.animate(kf,{duration:o.duration,easing:o.easing,fill:'both',delay:i*70});if(i===2)last=a});
    return last;                                               /* animasi yang selesai paling akhir */
  }
  function cancelAll(el){el.getAnimations().forEach(function(a){a.cancel()})}
  function sweepIn(dir){
    return Promise.all(slabs.map(function(el,i){
      cancelAll(el);
      return el.animate([{transform:dir>0?OFFL:OFFR},{transform:ON}],
        {duration:DUR,delay:i*GAP,easing:'cubic-bezier(.2,.9,.25,1)',fill:'both'}).finished;
    }));
  }
  function sweepOut(dir){
    return Promise.all(slabs.map(function(el,i){
      cancelAll(el);
      return el.animate([{transform:ON},{transform:dir>0?OFFR:OFFL}],
        {duration:DUR+80,delay:(slabs.length-1-i)*GAP,easing:'cubic-bezier(.65,0,.3,1)',fill:'both'}).finished;
    }));
  }
  function holdSlabs(){slabs.forEach(function(el){cancelAll(el);el.style.transform=ON})}
  function clean(){
    cancelAll(iris);cancelAll(ic);cancelAll(icc);cancelAll(icw);cancelAll(lbl);
    slabs.forEach(function(el){cancelAll(el);el.style.transform=''});
    busy=false;
  }
  function circle(r,x,y){return 'circle('+r+' at '+x+'px '+y+'px)'}

  /* KELUAR dari halaman: separuh pertama transisi, lalu pindah ke file HTML tujuan.
     open   = iris membesar dari menu yang dipilih     (beranda -> halaman)
     switch = slab menyapu                              (halaman -> halaman, tombol L/R)
     close  = slab menyapu, di beranda iris menyusut    (halaman -> beranda) */
  function leave(kind,x,y,text,target,dir){
    function nav(){ss('tr',kind);ss('trd',dir||0);ss('trt',text);location.href=target}
    if(calm||!iris.animate){location.href=target;return}
    busy=true;lbl.textContent=text;lbl2.textContent=text;
    var p=kind==='open'
      ?irisGo(true,x,y).finished
      :sweepIn(dir);
    p.catch(function(){}).then(nav);
    setTimeout(function(){if(busy){ss('tr',null);clean()}},6000);   /* jaga-jaga kalau navigasi gagal */
  }
  /* MASUK ke halaman: layar masih tertutup slab (kelas .tr dari <head>), lalu dibuka */
  function arrive(){
    var k=ss('tr'),dd=+ss('trd')||0,t=ss('trt')||names[Math.max(me,0)];
    ss('tr',null);
    if(!k||calm||!iris.animate){document.documentElement.classList.remove('tr');return null}
    busy=true;lbl.textContent=t;lbl2.textContent=t;holdSlabs();
    document.documentElement.classList.remove('tr');
    return {k:k,d:dd};
  }

  function showPanel(){
    [].slice.call(document.querySelectorAll('#view .st')).forEach(function(e,k){e.style.setProperty('--i',k)});
    view.classList.remove('enter');void view.offsetWidth;view.classList.add('enter');
    view.scrollTop=0;
  }
  function setUI(){
    var kA=$('#kA'),kB=$('#kB');
    kA.hidden=!(HOME||PAGE==='proyek');
    kB.hidden=HOME;
    $('#kAt').textContent=HOME?'Buka':'Pilih';
  }
  function openV(i){
    if(busy)return;
    sel=i;layout();sOpen();ss('sel',i);
    var p=itemPos();
    if(window.Air&&!calm)Air.burst(p[0],p[1],14,6);
    /* menu yang dipilih "menghentak" sebentar sebelum lingkaran air membesar dari titik itu */
    if(!calm&&its[i].animate)its[i].animate([{scale:1.3},{scale:1.5,offset:.4},{scale:1.3}],{duration:260,easing:'cubic-bezier(.2,1,.3,1)'});
    leave('open',p[0],p[1],names[i],names[i]+'.html');
  }
  function go(step){
    if(busy||HOME)return;
    var n=(me+step+names.length)%names.length;
    sSwitch(step>0);ss('sel',n);
    leave('switch',0,0,names[n],names[n]+'.html',-step);
  }
  function back(){
    if(busy||HOME)return;
    sClose();
    leave('close',0,0,'menu','index.html',-1);
  }

  its.forEach(function(b,i){b.addEventListener('click',function(e){
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;   /* tab baru tetap normal */
    e.preventDefault();openV(i)})});
  $('#kA').addEventListener('click',function(){if(HOME)openV(sel);else if(PAGE==='proyek')pickRow(curRow()+1)});
  $('#kB').addEventListener('click',back);
  if($('#tL')){$('#tL').addEventListener('click',function(){go(-1)});$('#tR').addEventListener('click',function(){go(1)})}

  var rows=[].slice.call(document.querySelectorAll('.row'));
  function curRow(){return rows.findIndex(function(r){return r.classList.contains('on')})}
  function pickRow(n){
    n=(n+rows.length)%rows.length;
    rows.forEach(function(r,k){r.classList.toggle('on',k===n)});
    $('#pd').textContent=rows[n].dataset.t;sMove();
  }
  rows.forEach(function(r,k){r.addEventListener('click',function(){pickRow(k)})});

  var EXT=['jpg','jpeg','png','webp','JPG','JPEG','PNG'];
  /* ===== KARTU ARCANA: foto profil berganti SENDIRI sesuai urutan foto1, foto2, foto3, ... (otomatis, maks 12) =====
     Tidak perlu diklik: tiap AUTO milidetik kartu teratas terbalik ke foto berikutnya, lalu kembali ke foto1 setelah foto terakhir.
     Ketuk / klik = langsung ke kartu berikutnya, geser kanan = sebelumnya (opsional). Ubah AUTO untuk mengatur kecepatan. */
  var pic=$('#pic'),deck=$('#deck');
  if(pic&&deck){
    var ARC=['Fool','Magician','Priestess','Empress','Emperor','Hierophant','Lovers','Chariot','Justice','Hermit','Fortune','Strength'],
        ROM=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'],
        AUTO=3800,tm=0,prog=null,bar=pic.querySelector('.bar i'),
        MAXF=12,last=-1,cards=[],cur=0,flying=false,nEl=pic.querySelector('.n'),ign=0,P='perspective(900px) ';
    function mkCard(i){
      var c=document.createElement('span');c.className='ac';c.setAttribute('data-p','x');
      c.innerHTML='<span class="ph"></span><span class="rn"></span><span class="ar"></span><span class="sh"><i></i></span>';
      c.querySelector('.rn').textContent=ROM[i%ROM.length];c.querySelector('.ar').textContent=ARC[i%ARC.length];
      c._i=i;deck.appendChild(c);cards.push(c);return c;
    }
    /* gambar dimuat hanya saat kartu hampir tampil (hemat memori di HP) */
    function fill(c){
      if(c._ld)return;c._ld=1;
      var im=new Image(),ph=c.querySelector('.ph'),name='foto'+(c._i+1);
      im.decoding='async';im.alt='Foto profil '+(c._i+1);ph.appendChild(im);
      if(c._src)im.src=c._src;
      else{im.src='foto/'+name+'.jpg';muatGambar(im,'foto/'+name+'.jpg',function(){ph.removeChild(im);ph.setAttribute('data-miss',name+'.jpg')})}
    }
    function layout(){
      var N=cards.length;
      cards.forEach(function(c,k){var p=(k-cur+N)%N;c.setAttribute('data-p',p<3?p:'x');if(p<3)fill(c)});
      nEl.textContent=(cur+1)+'/'+N;
      pic.setAttribute('aria-label','Foto profil berganti otomatis. Foto '+(cur+1)+' dari '+N);
    }
    function glint(c){var sh=c.querySelector('.sh i');if(sh&&sh.animate)sh.animate([{transform:'translateX(-130%)'},{transform:'translateX(130%)'}],{duration:650,easing:'ease-out'})}
    function advance(dir,quiet){
      var N=cards.length;if(flying)return;
      if(N<2){if(!quiet&&!calm&&pic.animate)pic.animate([{translate:'0'},{translate:'-6px'},{translate:'5px'},{translate:'0'}],{duration:240});return}
      if(!quiet)sOk();
      var top=cards[cur],to=cur;do{to=Math.floor(Math.random()*N)}while(to===cur||(N>2&&to===last));last=cur;
      if(calm||!top.animate){cur=to;layout();return}
      flying=true;
      var a=top.animate([{transform:P+'rotateY(0) rotate(0)'},{transform:P+'rotateY('+(dir*88)+'deg) translateY(-5%) rotate('+(dir*-3)+'deg)'}],{duration:190,easing:'ease-in',fill:'forwards'});
      a.onfinish=function(){
        a.cancel();cur=to;layout();
        var nc=cards[cur];
        if(nc.animate)nc.animate([{transform:P+'rotateY('+(dir*-88)+'deg)'},{transform:P+'rotateY('+(dir*6)+'deg)',offset:.7},{transform:P+'rotateY(0)'}],{duration:340,easing:'cubic-bezier(.2,1,.3,1)'}).onfinish=function(){flying=false;glint(nc)};
        else flying=false;
        if(window.Air){var r=pic.getBoundingClientRect();Air.burst(r.left+r.width/2,r.top+r.height/2,2,4)}
      };
      /* pengaman bila event onfinish tidak terkirim */
      setTimeout(function(){flying=false},900);
    }
    /* cari foto2, foto3, ... satu per satu sampai tidak ada (ekstensi bebas) */
    function cari(i){
      if(i>=MAXF)return;
      var im=new Image(),base='foto/foto'+(i+1),exts=['jpg','jpeg','png','webp','JPG','JPEG','PNG'],k=0;
      im.onload=function(){var c=mkCard(i);c._src=im.src;im.onload=im.onerror=null;layout();setTimeout(function(){cari(i+1)},60)};
      im.onerror=function(){k++;if(k<exts.length)im.src=base+'.'+exts[k];else im.onerror=null};
      im.src=base+'.'+exts[0];
    }
    /* ---- putar otomatis: batang kecil di bawah kartu menunjukkan waktu menuju foto berikutnya ---- */
    function stopProg(){if(prog){try{prog.cancel()}catch(e){}prog=null}}
    function schedule(ms){
      clearTimeout(tm);stopProg();
      if(cards.length<2){tm=setTimeout(function(){schedule()},700);return}   /* foto lain masih dicari */
      ms=ms||AUTO;
      if(bar&&bar.animate&&!calm)prog=bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:ms,easing:'linear',fill:'forwards'});
      tm=setTimeout(tick,ms);
    }
    function tick(){
      if(document.hidden||busy||flying){schedule(800);return}   /* tab disembunyikan / sedang pindah halaman */
      advance(1,true);schedule();
    }
    document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule()});
    mkCard(0);layout();
    setTimeout(function(){cari(1)},500);
    schedule(2600);
    pic.addEventListener('click',function(){if(ign){ign=0;return}advance(1);schedule()});
    var tx=0,ty=0;
    pic.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;e.stopPropagation()},{passive:true});
    pic.addEventListener('touchend',function(e){
      var p=e.changedTouches[0],dx=p.clientX-tx,dy=p.clientY-ty;e.stopPropagation();
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){ign=1;setTimeout(function(){ign=0},450);advance(dx<0?1:-1);schedule()}
    },{passive:true});
  }

  document.addEventListener('keydown',function(e){
    var k=e.key,ae=document.activeElement;
    if(ae&&ae.type==='range')return;
    if(busy){if(k===' '||k==='Enter')e.preventDefault();return}
    if(HOME){
      if(k==='ArrowDown'||k==='ArrowRight'){e.preventDefault();pick(sel+1)}
      else if(k==='ArrowUp'||k==='ArrowLeft'){e.preventDefault();pick(sel-1)}
      else if((k==='Enter'||k===' ')&&!(ae&&(ae.id==='snd'||ae.id==='anm'||ae.id==='mus'||ae.id==='nxt'))){e.preventDefault();openV(sel)}
    }else{
      if(k==='Escape'||k==='Backspace'){e.preventDefault();back()}
      else if(k==='ArrowLeft'||k==='q'||k==='Q'||k==='['){e.preventDefault();go(-1)}
      else if(k==='ArrowRight'||k==='e'||k==='E'||k===']'){e.preventDefault();go(1)}
      else if(PAGE==='proyek'&&k==='ArrowDown'){e.preventDefault();pickRow(curRow()+1)}
      else if(PAGE==='proyek'&&k==='ArrowUp'){e.preventDefault();pickRow(curRow()-1)}
    }
  });
  document.addEventListener('wheel',function(e){
    if(!HOME||busy||Date.now()-wheelAt<220)return;
    wheelAt=Date.now();pick(sel+(e.deltaY>0?1:-1));
  },{passive:true});
  var sx=0,sy=0;
  document.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',function(e){
    var p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;
    if(busy)return;
    if(HOME&&Math.abs(dy)>50&&Math.abs(dx)<40)pick(sel+(dy<0?1:-1));
    else if(!HOME&&dx>90&&Math.abs(dy)<50)back();
    else if(!HOME&&dx<-90&&Math.abs(dy)<50)go(1);
  },{passive:true});

  /* hero mengikuti kursor; keterangan menu muncul seperti diketik */
  var hero=$('.hero');
  document.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch'||!hero)return;
    hero.style.setProperty('--px',((e.clientX/innerWidth-.5)*-22)+'px');
    hero.style.setProperty('--py',((e.clientY/innerHeight-.5)*-14)+'px');
  },{passive:true});
  if(desc)new MutationObserver(function(){if(!calm&&desc.animate)desc.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:320,easing:'steps(14)'})})
    .observe(desc,{childList:true,characterData:true,subtree:true});

  /* ===== PEMUAT GAMBAR: ekstensi bebas (.jpg .jpeg .png .webp) ===== */
  function muatGambar(im,src,gagal){
    var m=src.match(/\.([a-z0-9]+)$/i),base=src.replace(/\.[a-z0-9]+$/i,''),pakai=m?m[1]:'',
        daftar=EXT.filter(function(e){return e!==pakai}),i=0;
    function next(){if(i>=daftar.length){im.onerror=null;if(gagal)gagal();return}im.src=base+'.'+daftar[i++]}
    im.onerror=next;
    if(im.complete&&!im.naturalWidth)next();
  }
  /* foto profil & foto menu: kalau .jpg tidak ada, coba ekstensi lain; kalau tetap tidak ada, pakai foto1 */
  [].slice.call(document.querySelectorAll('.hero img')).forEach(function(im){
    im.decoding='async';
    muatGambar(im,im.getAttribute('src'),function(){var p=document.querySelector('.hero img');if(p&&p!==im)im.src=p.src});
  });

  /* ===== GALERI FOTOGRAFI (daftar gambar di galeri.js) ===== */
  if($("#gal")){var gal=$('#gal'),galn=$('#galn'),GL=window.GALERI||[],lb=document.createElement('div'),lbi,lbp,cur=-1,lastBt=null,tx0=0;
   lb.id='lb';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Pratinjau foto');
   lb.innerHTML='<div class="lbc"><button type="button" class="lbx" aria-label="Tutup">&times;</button><button type="button" class="lbn p" aria-label="Foto sebelumnya">&#8249;</button><img alt=""><button type="button" class="lbn n" aria-label="Foto berikutnya">&#8250;</button><p></p></div>';
   document.body.appendChild(lb);
   lbi=lb.querySelector('img');lbp=lb.querySelector('p');
   function daftar(){return [].slice.call(gal.querySelectorAll('.gi:not(.kosong)'))}
   function tampil(n){
     var L=daftar();if(!L.length)return;
     cur=(n+L.length)%L.length;lastBt=L[cur];
     var im=L[cur].querySelector('img');lbi.src=im.src;lbi.alt=im.alt;
     lbp.textContent=(cur+1)+' / '+L.length+(im.alt?'  \u00B7  '+im.alt:'');
     lb.classList.toggle('satu',L.length<2)}
   function lbOpen(bt){sFoto();tampil(daftar().indexOf(bt));lb.hidden=false;lb.querySelector('.lbx').focus()}
   function lbClose(){if(lb.hidden)return;lb.hidden=true;lbi.removeAttribute('src');sFotoTutup();if(lastBt)lastBt.focus()}
   lb.addEventListener('click',function(e){
     if(e.target.closest('.lbx')||e.target===lb)lbClose();
     else if(e.target.closest('.lbn.p')){tampil(cur-1);sMove()}
     else if(e.target.closest('.lbn.n')){tampil(cur+1);sMove()}});
   /* geser kiri/kanan di HP untuk ganti foto (tidak ikut keluar dari halaman) */
   lb.addEventListener('touchstart',function(e){e.stopPropagation();tx0=e.touches[0].clientX},{passive:true});
   lb.addEventListener('touchend',function(e){
     e.stopPropagation();var dx=e.changedTouches[0].clientX-tx0;
     if(Math.abs(dx)>60&&!lb.classList.contains('satu')){tampil(cur+(dx<0?1:-1));sMove()}},{passive:true});
   function galInfo(){
     var ada=gal.querySelectorAll('.gi:not(.kosong)').length,kosong=gal.querySelectorAll('.gi.kosong').length;
     galn.textContent=!GL.length?'Daftar galeri masih kosong. Isi galeri.js dengan nama gambar.'
       :kosong&&!ada?'Gambar belum ditemukan. Taruh gambar di folder "galeri" dengan nama yang tertera (.jpg, .jpeg, atau .png), lalu refresh halaman.'
       :kosong?'Sebagian gambar belum ditemukan di folder "galeri". Klik gambar untuk memperbesar.'
       :'Klik gambar untuk memperbesar.'}
   GL.forEach(function(it){
     var bt=document.createElement('button'),im=new Image();
     bt.type='button';bt.className='gi';im.alt=it.cap||'';
     im.addEventListener('load',galInfo);
     bt.appendChild(im);
     if(it.cap){var sp=document.createElement('span');sp.textContent=it.cap;bt.appendChild(sp)}
     gal.appendChild(bt);
     im.src=it.src;
     muatGambar(im,it.src,function(){
       bt.className='gi kosong';bt.disabled=true;bt.textContent='';
       var s2=document.createElement('span');s2.textContent=it.src.split('/').pop().replace(/\.[a-z0-9]+$/i,'')+'.jpg / .jpeg / .png';bt.appendChild(s2);galInfo()})});
   galInfo();
   gal.addEventListener('click',function(e){
     var bt=e.target.closest('.gi');if(!bt||bt.disabled)return;lbOpen(bt)});
   /* saat pratinjau terbuka, tombol keyboard hanya dipakai pratinjau (musik M tetap jalan) */
   document.addEventListener('keydown',function(e){
     if(lb.hidden)return;var k=e.key;
     if(k==='m'||k==='M')return;
     e.stopImmediatePropagation();
     if(k!=='Enter'&&k!==' '&&k!=='Tab')e.preventDefault();
     if(k==='Escape'||k==='Backspace')lbClose();
     else if(k==='ArrowLeft'){tampil(cur-1);sMove()}
     else if(k==='ArrowRight'){tampil(cur+1);sMove()}},true)}

  /* ===== AWAL HALAMAN ===== */
  if(HOME){
    var hs=(location.hash||'').slice(1),k2=names.indexOf(hs);
    if(k2>=0){location.replace(names[k2]+'.html');return}   /* tautan lama index.html#profil */
    layout();setUI();
    var a=arrive();
    if(a){
      /* kembali dari halaman lain: iris menyusut ke menu yang tadi dipilih, air naik */
      home.classList.remove('enter');void home.offsetWidth;home.classList.add('enter');
      var p=itemPos(),ir=irisGo(false,p[0],p[1]);
      slabs.forEach(function(el){cancelAll(el);el.style.transform=''});
      if(window.Air)Air.surge(p[0],p[1]);
      ir.finished.catch(function(){}).then(clean);
    }else if(document.documentElement.classList.contains('gate')){
      /* layar awal: tunggu klik / tombol apa saja, lalu intro "Biodata" + air naik */
      var root=document.documentElement,st=$('#start'),done=false;
      busy=true;home.classList.remove('enter');
      var enter=function(e){
        if(done)return;
        if(e&&e.type==='keydown'){
          if(e.ctrlKey||e.metaKey||e.altKey||/^(Shift|Control|Alt|Meta|Tab|CapsLock|Escape|F\d+)$/.test(e.key))return;
          e.preventDefault();
        }
        done=true;ss('entered','1');sOk();
        document.removeEventListener('keydown',enter,true);st.removeEventListener('click',enter);
        if(calm||!iris.animate){root.classList.remove('gate');home.classList.add('enter');busy=false;return}
        lbl2.textContent='Biodata';lbl2.style.fontSize='clamp(3rem,14vw,9.5rem)';
        /* pengaman: apa pun yang terjadi, layar dibuka paling lambat 2,6 detik */
        var guard=setTimeout(function(){root.classList.remove('gate');home.classList.add('enter');lbl2.style.fontSize='';clean()},2600);
        sweepIn(1).catch(function(){}).then(function(){
          root.classList.remove('gate');
          var tx=lbl2.animate([{opacity:0,scale:.7},{opacity:1,scale:1}],{duration:380,easing:'cubic-bezier(.2,1,.3,1)',fill:'both'});
          setTimeout(function(){
            home.classList.add('enter');
            var q=itemPos();if(window.Air)Air.surge(q[0],q[1]);
            sweepOut(1).catch(function(){}).then(function(){clearTimeout(guard);try{tx.cancel()}catch(e){}lbl2.style.fontSize='';clean()});
          },320);
        });
      };
      st.addEventListener('click',enter);document.addEventListener('keydown',enter,true);
    }
  }else{
    sel=me;ss('sel',me);setUI();
    var b2=arrive();
    if(b2){showPanel();sweepOut(b2.d||1).catch(function(){}).then(clean)}
    else showPanel();
  }
  /* tombol Back browser (bfcache): pastikan layar tidak tertinggal tertutup */
  window.addEventListener('pageshow',function(e){if(e.persisted){clean();document.documentElement.classList.remove('tr')}});
})();
