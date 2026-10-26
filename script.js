(function(){
  var $=function(s){return document.querySelector(s)},
      its=[].slice.call(document.querySelectorAll('.it')),
      slabs=[].slice.call(document.querySelectorAll('.slab')),
      home=$('#home'),view=$('#view'),iris=$('#iris'),lbl=$('#lbl'),lbl2=$('#lbl2'),desc=$('#desc'),
      names=['profil','proyek','keahlian','kontak'],
      descs=['Lihat profil saya','Lihat tugas dan proyek kuliah','Lihat kemampuan saya','Ajak saya bekerja sama'],
      calm=false,
      sel=0,open=-1,busy=false,on=true,ctx=null,nz=null,wheelAt=0;

  var anm=$('#anm');
  function setAnim(){document.documentElement.classList.toggle('noanim',calm);anm.setAttribute('aria-pressed',!calm);anm.textContent=calm?'Animasi: mati':'Animasi: nyala'}
  try{if(localStorage.getItem('anim')==='off')calm=true}catch(e){}
  setAnim();
  anm.addEventListener('click',function(){calm=!calm;setAnim();try{localStorage.setItem('anim',calm?'off':'on')}catch(e){}sOk()});

  var d=new Date(),hr=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  $('#tgl').textContent=(d.getMonth()+1)+'/'+d.getDate();$('#hari').textContent=hr[d.getDay()];

  /* gelembung + kilau */
  {var fx=$('#fx');
   for(var q=0;q<40;q++){
    var b=document.createElement('i'),t=Math.random(),
        z=t<.15?4:t<.6?6+Math.random()*10:18+Math.random()*34;
    b.className=z<5?'p':z<16?'s':'';
    b.style.cssText='left:'+Math.random()*100+'%;width:'+z+'px;height:'+z+'px;'
      +'animation-duration:'+(9+Math.random()*13)+'s,'+(2+Math.random()*3)+'s;'
      +'animation-delay:-'+Math.random()*20+'s,-'+Math.random()*4+'s';
    fx.appendChild(b)}
   for(q=0;q<10;q++){var k=document.createElement('i');k.className='k';
    k.style.cssText='left:'+Math.random()*100+'%;animation-duration:'+(14+Math.random()*12)+'s,'+(1+Math.random()*1.6)+'s;animation-delay:-'+Math.random()*20+'s,-'+Math.random()*2+'s';
    fx.appendChild(k)}}

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
  $('#snd').addEventListener('click',function(){on=!on;this.setAttribute('aria-pressed',on);this.textContent=on?'Suara: nyala':'Suara: mati';sOk()});

  /* ===== MENU SEPERTI RODA ===== */
  var heroImgs=[].slice.call(document.querySelectorAll('.hero img'));
  function layout(){
    heroImgs.forEach(function(im,i){im.classList.toggle('on',i===sel)});
    its.forEach(function(b,i){var k=i-sel;
      b.style.setProperty('--d',k);b.style.setProperty('--ad',Math.abs(k));
      b.setAttribute('aria-current',i===sel);});
    home.style.setProperty('--sel',sel);
    desc.textContent=descs[sel];
  }
  function pick(n){sel=(n+its.length)%its.length;layout();sMove()}

  /* ===== TRANSISI ===== */
  var OFFL='translateX(-190vw) skewX(-16deg)',ON='translateX(0) skewX(-16deg)',OFFR='translateX(190vw) skewX(-16deg)',
      DUR=400,GAP=55;
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
    cancelAll(iris);
    slabs.forEach(function(el){cancelAll(el);el.style.transform=''});
    busy=false;
  }
  function circle(r,x,y){return 'circle('+r+' at '+x+'px '+y+'px)'}
  function transition(kind,x,y,text,mid,dir){
    if(calm||!iris.animate){mid();return}
    busy=true;lbl.textContent=text;lbl2.textContent=text;
    var p;
    if(kind==='open'){
      p=iris.animate([{clipPath:circle('0px',x,y)},{clipPath:circle('150vmax',x,y)}],
        {duration:520,easing:'cubic-bezier(.6,0,.25,1)',fill:'forwards'}).finished
      .then(function(){mid();holdSlabs();cancelAll(iris);return sweepOut(1)});
    }else if(kind==='close'){
      p=sweepIn(-1).then(function(){
        mid();
        var r=its[sel].getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
        var a=iris.animate([{clipPath:circle('150vmax',cx,cy)},{clipPath:circle('0px',cx,cy)}],
          {duration:520,easing:'cubic-bezier(.6,0,.25,1)',fill:'forwards'});
        slabs.forEach(function(el){cancelAll(el);el.style.transform=''});
        return a.finished;
      });
    }else{
      p=sweepIn(dir).then(function(){mid();return sweepOut(dir)});
    }
    p.catch(function(){}).then(clean);
  }

  function showPanel(i){
    names.forEach(function(n,k){$('#p-'+n).hidden=k!==i});
    $('#gt').textContent=names[i];$('#tname').textContent=names[i];
    var els=[].slice.call($('#p-'+names[i]).querySelectorAll('.st'));
    els.forEach(function(e,k){e.style.setProperty('--i',k)});
    view.classList.remove('enter');void view.offsetWidth;view.classList.add('enter');
    view.scrollTop=0;
  }
  function setUI(){
    $('#kA').hidden=open>=0&&open!==1;
    $('#kAt').textContent=open===1?'Pilih':'Buka';
  }
  function openV(i){
    if(busy||open===i)return;
    sel=i;layout();sOpen();
    var r=its[i].getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    transition('open',x,y,names[i],function(){open=i;home.hidden=true;view.hidden=false;showPanel(i);setUI()});
  }
  function go(step){
    if(busy||open<0)return;
    var n=(open+step+names.length)%names.length;
    sSwitch(step>0);
    transition('switch',0,0,names[n],function(){open=n;sel=n;layout();showPanel(n);setUI()},-step);
  }
  function back(){
    if(busy||open<0)return;
    sClose();
    transition('close',0,0,'menu',function(){
      open=-1;view.hidden=true;home.hidden=false;layout();
      home.classList.remove('enter');void home.offsetWidth;home.classList.add('enter');
      setUI();
    });
  }

  its.forEach(function(b,i){b.addEventListener('click',function(){openV(i)})});
  $('#kA').addEventListener('click',function(){if(open<0)openV(sel);else if(open===1)pickRow(curRow()+1)});
  $('#kB').addEventListener('click',back);
  $('#tL').addEventListener('click',function(){go(-1)});
  $('#tR').addEventListener('click',function(){go(1)});

  var rows=[].slice.call(document.querySelectorAll('.row'));
  function curRow(){return rows.findIndex(function(r){return r.classList.contains('on')})}
  function pickRow(n){
    n=(n+rows.length)%rows.length;
    rows.forEach(function(r,k){r.classList.toggle('on',k===n)});
    $('#pd').textContent=rows[n].dataset.t;sMove();
  }
  rows.forEach(function(r,k){r.addEventListener('click',function(){pickRow(k)})});

  var pic=$('#pic'),f=1;
  pic.addEventListener('click',function(){
    f=f===1?2:1;pic.dataset.f=f;pic.querySelector('.n').textContent=f+'/2';
    pic.setAttribute('aria-label','Ganti foto profil. Foto '+f+' dari 2');sOk();
    if(!calm&&pic.animate)pic.animate([{scale:.93},{scale:1}],{duration:240});
  });

  document.addEventListener('keydown',function(e){
    var k=e.key,ae=document.activeElement;
    if(busy){if(k===' '||k==='Enter')e.preventDefault();return}
    if(open<0){
      if(k==='ArrowDown'||k==='ArrowRight'){e.preventDefault();pick(sel+1)}
      else if(k==='ArrowUp'||k==='ArrowLeft'){e.preventDefault();pick(sel-1)}
      else if((k==='Enter'||k===' ')&&!(ae&&(ae.id==='snd'||ae.id==='anm'||ae.id==='mus'||ae.id==='nxt'))){e.preventDefault();openV(sel)}
    }else{
      if(k==='Escape'||k==='Backspace'){e.preventDefault();back()}
      else if(k==='ArrowLeft'||k==='q'||k==='Q'||k==='['){e.preventDefault();go(-1)}
      else if(k==='ArrowRight'||k==='e'||k==='E'||k===']'){e.preventDefault();go(1)}
      else if(open===1&&k==='ArrowDown'){e.preventDefault();pickRow(curRow()+1)}
      else if(open===1&&k==='ArrowUp'){e.preventDefault();pickRow(curRow()-1)}
    }
  });
  document.addEventListener('wheel',function(e){
    if(open>=0||busy||Date.now()-wheelAt<220)return;
    wheelAt=Date.now();pick(sel+(e.deltaY>0?1:-1));
  },{passive:true});
  var sx=0,sy=0;
  document.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  document.addEventListener('touchend',function(e){
    var p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;
    if(busy)return;
    if(open<0&&Math.abs(dy)>50&&Math.abs(dx)<40)pick(sel+(dy<0?1:-1));
    else if(open>=0&&dx>90&&Math.abs(dy)<50)back();
    else if(open>=0&&dx<-90&&Math.abs(dy)<50)go(1);
  },{passive:true});

  /* hero mengikuti kursor; keterangan menu muncul seperti diketik */
  var hero=$('.hero');
  document.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch'||!hero)return;
    hero.style.setProperty('--px',((e.clientX/innerWidth-.5)*-22)+'px');
    hero.style.setProperty('--py',((e.clientY/innerHeight-.5)*-14)+'px');
  },{passive:true});
  new MutationObserver(function(){if(!calm&&desc.animate)desc.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:320,easing:'steps(14)'})})
    .observe(desc,{childList:true,characterData:true,subtree:true});

  /* ===== PEMUAT GAMBAR: ekstensi bebas (.jpg .jpeg .png .webp) ===== */
  var EXT=['jpg','jpeg','png','webp','JPG','JPEG','PNG'];
  function muatGambar(im,src,gagal){
    var m=src.match(/\.([a-z0-9]+)$/i),base=src.replace(/\.[a-z0-9]+$/i,''),pakai=m?m[1]:'',
        daftar=EXT.filter(function(e){return e!==pakai}),i=0;
    function next(){if(i>=daftar.length){im.onerror=null;if(gagal)gagal();return}im.src=base+'.'+daftar[i++]}
    im.onerror=next;
    if(im.complete&&!im.naturalWidth)next();
  }
  /* foto profil & foto menu: kalau .jpg tidak ada, coba ekstensi lain; kalau tetap tidak ada, pakai foto1 */
  [].slice.call(document.querySelectorAll('.hero img,.pic img')).forEach(function(im){
    muatGambar(im,im.getAttribute('src'),function(){var p=document.querySelector('.hero img');if(p&&p!==im)im.src=p.src});
  });

  /* ===== GALERI FOTOGRAFI (daftar gambar di galeri.js) ===== */
  {var gal=$('#gal'),galn=$('#galn'),GL=window.GALERI||[],lb=document.createElement('div'),lbi,lbp,cur=-1,lastBt=null,tx0=0;
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

  layout();setUI();
  var h=(location.hash||'').slice(1),k2=names.indexOf(h);
  if(k2>=0){sel=k2;layout();open=k2;home.hidden=true;view.hidden=false;showPanel(k2);setUI()}
  else if(!calm&&iris.animate){
    busy=true;home.classList.remove('enter');
    lbl2.textContent='Biodata';lbl2.style.fontSize='clamp(3rem,14vw,9.5rem)';
    holdSlabs();
    var tx=lbl2.animate([{opacity:0,scale:.7},{opacity:1,scale:1}],{duration:650,delay:150,easing:'cubic-bezier(.2,1,.3,1)',fill:'both'});
    setTimeout(function(){
      home.classList.add('enter');
      sweepOut(1).catch(function(){}).then(function(){tx.cancel();lbl2.style.fontSize='';clean()});
    },1100);
  }
})();
