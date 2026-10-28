/* ===== PARTIKEL AIR (canvas) =====
   Gelembung berparalaks, serpihan confetti pink, kilau, debu laut, riak, dan percikan saat gelembung pecah.
   - Kursor mendorong gelembung; klik/ketuk memunculkan riak + gelembung.
   - Air.surge(x,y)  : gelombang gelembung naik saat menu pause dibuka.
   - Air.burst(x,y,n,c): semburan gelembung (+ c serpihan) dari satu titik.
   Dipakai di semua halaman; di beranda partikelnya penuh, di halaman lain lebih ringan. */
(function(){
  var cv=document.getElementById('fx');
  if(!cv||!cv.getContext)return;
  var g=cv.getContext('2d'),HOME=document.body.getAttribute('data-page')==='home',
      LITE=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||innerWidth<760||(navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4),
      Q=LITE?.8:1.25,LV=(HOME?1:.55)*Q,GA=HOME?1:.75,MAXB=LITE?110:240,MIN=10,ema=16,af=1,fc=-120,dg=0,TAU=Math.PI*2,rnd=Math.random,
      W=0,H=0,dpr=1,calm=false,raf=0,last=0,mx=-999,my=-999,lastTrail=0,rz=0,
      B=[],S=[],K=[],F=[],L=[],R=[],D=[],spr=null,
      PAL=['#ff5fa8','#e8112d','#ffffff','#c63cff','#9be9ff','#ff8ec7'],
      TRI=[[-1,-.6],[1,0],[-.4,.8]];
  try{if(localStorage.getItem('anim')==='off')calm=true}catch(e){}
  function rr(a,b){return a+rnd()*(b-a)}

  /* gelembung digambar sekali ke sprite lalu diskalakan: ringan untuk puluhan gelembung */
  function mkSprite(){
    var s=document.createElement('canvas'),n=s.width=s.height=128,c=s.getContext('2d'),m=n/2,
        gr=c.createRadialGradient(m*.8,m*.78,m*.08,m,m,m-3);
    gr.addColorStop(0,'rgba(255,255,255,.05)');gr.addColorStop(.72,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,.5)');
    c.fillStyle=gr;c.beginPath();c.arc(m,m,m-3,0,TAU);c.fill();
    c.lineWidth=3;c.strokeStyle='rgba(255,255,255,.85)';c.stroke();
    c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.ellipse(m*.62,m*.55,m*.2,m*.1,-.7,0,TAU);c.fill();
    c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(m*1.4,m*1.4,m*.07,0,TAU);c.fill();
    return s;
  }

  /* ---------- pembuat partikel ---------- */
  function newB(init){
    var t=rnd(),r=t<.2?rr(1.5,3):t<.62?rr(4,10):rr(12,32),b={
      x:rr(0,W),y:init?rr(0,H):H+r+rr(0,H*.3),r:r,vy:0,vt:-(26+r*3+rr(0,22)),vx:0,
      ph:rr(0,TAU),fr:rr(.8,2.2),am:rr(8,24)*(r<10?1:.6),a:r<3?.8:rr(.55,1),keep:true};
    b.vy=b.vt;return b;
  }
  function newF(init){
    return {x:rr(0,W),y:init?rr(0,H):H+20,s:rr(4,9),rot:rr(0,TAU),vr:rr(-2.5,2.5),fl:rr(0,TAU),vf:rr(2,5),
      vy:0,vt:-rr(14,42),vx:0,ph:rr(0,TAU),fr:rr(.5,1.4),am:rr(10,30),c:PAL[(rnd()*PAL.length)|0],l:99,keep:true};
  }
  function confetti(x,y,n){
    for(var i=0;i<n;i++){
      var f=newF(false),a=rr(0,TAU),v=rr(160,560);
      f.keep=false;f.x=x;f.y=y;f.vx=Math.cos(a)*v;f.vy=Math.sin(a)*v;f.l=rr(3,6);f.vt=-rr(10,30);F.push(f);
    }
  }
  function ripple(x,y,max,a){R.push({x:x,y:y,r:4,max:max,a:a==null?.8:a})}
  function pop(b){
    ripple(b.x,Math.max(b.y,6),b.r*2.6,.6);
    for(var i=0,n=3+((b.r/5)|0);i<n;i++)
      D.push({x:b.x,y:b.y,vx:rr(-90,90),vy:-rr(120,300),l:0,m:rr(.5,.9),r:rr(1,2.4)});
  }

  /* isi ulang jumlah partikel dasar sesuai ukuran layar */
  function fit(){
    var n=Math.round(Math.min(72,Math.max(26,W*H/19000))*LV),i,b;
    B=B.filter(function(x){return!x.keep});for(i=0;i<n;i++)B.push(newB(true));
    F=F.filter(function(x){return!x.keep});for(i=0,n=Math.round(15*LV);i<n;i++)F.push(newF(true));
    S=[];for(i=0,n=Math.round(46*LV);i<n;i++)S.push({x:rr(0,W),y:rr(0,H),r:rr(.7,1.9),vy:-rr(4,16),ph:rr(0,TAU),fr:rr(.8,2.6)});
    K=[];for(i=0,n=Math.round(10*LV);i<n;i++)K.push({x:rr(0,W),y:rr(0,H),s:rr(5,10),vy:-rr(10,28),ph:rr(0,TAU),fr:rr(1.5,3.5)});
    L=[];for(i=0,n=LITE?(HOME?6:4):(HOME?10:6);i<n;i++)L.push({x:rr(0,W),y:rr(0,H*.17),w:rr(120,320),h:rr(10,26),v:rr(8,26),ph:rr(0,TAU),fr:rr(.3,.9)});
  }
  function size(){
    dpr=Math.min(LITE?1.25:1.75,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);g.setTransform(dpr,0,0,dpr,0,0);fit();
  }

  /* ---------- efek yang dipanggil halaman ---------- */
  function burst(x,y,n,c){
    if(calm)return;
    for(var i=0;i<n&&B.length<MAXB;i++){
      var a=rr(0,TAU),v=rr(40,240),b=newB(false);
      b.keep=false;b.r=rnd()<.7?rr(2,6):rr(7,14);b.x=x+Math.cos(a)*rr(0,14);b.y=y+Math.sin(a)*rr(0,10);
      b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v*.6-rr(40,160);b.vt=-(40+b.r*3+rr(0,30));B.push(b);
    }
    ripple(x,y,rr(70,110),.7);
    if(c)confetti(x,y,c);
  }
  function surge(x,y){
    if(calm)return;
    x=x==null?W*.35:x;y=y==null?H*.5:y;
    var n=Math.round(46*LV+10),i,b;
    for(i=0;i<n&&B.length<MAXB;i++){b=newB(false);b.keep=false;b.y=H+rr(0,90);b.vy=-rr(600,1500);b.vx=rr(-30,30);B.push(b)}
    B.forEach(function(o){if(o.keep)o.vy-=rr(200,520)});
    confetti(x,y,Math.round(22*LV)+4);
    ripple(x,y,Math.max(W,H)*.2,.7);ripple(x,y,Math.min(W,H)*.95,.3);
  }

  /* ---------- gambar satu frame ---------- */
  function frame(t){
    raf=requestAnimationFrame(frame);
    var df=t-last;
    if(df<MIN)return;                       /* layar 120/144 Hz: tetap ~60 fps, tidak boros */
    if(df<200){ema+=(df-ema)*.06;
      /* target 60 fps: kalau rata-rata frame > 22 ms, kurangi partikel otomatis (maks 3x) */
      if(++fc>90&&dg<3&&ema>22){fc=0;dg++;try{sessionStorage.setItem('airq',dg)}catch(e){}if(dg>=2)document.documentElement.classList.add('lite');Q*=.6;LV=(HOME?1:.55)*Q;MAXB=Math.max(30,MAXB*.7|0);fit()}}
    var dt=Math.min(.05,(t-last)/1000||0),i,b,f,o,d,dx,dy,d2;last=t;
    g.clearRect(0,0,W,H);g.fillStyle='#fff';

    /* kejadian acak di permukaan air: riak jauh atau barisan gelembung kecil naik dari dasar */
    if(!calm){af-=dt;if(af<=0){af=rr(1,2.4);
      if(rnd()<.55)ripple(rr(W*.05,W*.95),rr(H*.03,H*.24),rr(50,115),.32);
      else{var sx=rr(W*.05,W*.95),j;for(j=0;j<6&&B.length<MAXB;j++){b=newB(false);b.keep=false;b.r=rr(2,6);b.x=sx+rr(-14,14);b.y=H+rr(0,50)+j*24;b.vt=-(70+rr(0,50));b.vy=b.vt;B.push(b)}}}}

    /* kilau cahaya di permukaan air */
    for(i=0;i<L.length;i++){o=L[i];o.ph+=dt*o.fr;o.x+=o.v*dt;if(o.x-o.w>W)o.x=-o.w;
      g.globalAlpha=(.05+.08*(Math.sin(o.ph)+1)/2)*GA;g.beginPath();g.ellipse(o.x,o.y,o.w,o.h,-.05,0,TAU);g.fill()}

    /* debu laut */
    for(i=0;i<S.length;i++){o=S[i];o.ph+=dt*o.fr;o.y+=o.vy*dt;o.x+=Math.sin(o.ph)*6*dt;
      if(o.y<-4){o.y=H+4;o.x=rr(0,W)}
      g.globalAlpha=(.25+.4*(Math.sin(o.ph*1.7)+1)/2)*GA;g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill()}

    /* gelembung */
    for(i=B.length-1;i>=0;i--){
      b=B[i];b.vy+=(b.vt-b.vy)*Math.min(1,dt*1.5);b.ph+=dt*b.fr;b.vx*=1-Math.min(1,dt*1.6);
      dx=b.x-mx;dy=b.y-my;d2=dx*dx+dy*dy;
      if(d2<12100&&d2>1){d=Math.sqrt(d2);o=(1-d/110)*900*dt;b.vx+=dx/d*o;b.vy+=dy/d*o*.6}
      b.x+=(b.vx+Math.cos(b.ph)*b.am)*dt;b.y+=b.vy*dt;
      if(b.y<H*.07&&b.r>5&&rnd()<dt*.9){pop(b);if(b.keep)B[i]=newB(false);else B.splice(i,1);continue}
      if(b.y<-b.r-8||b.x<-80||b.x>W+80){if(b.keep)B[i]=newB(false);else B.splice(i,1);continue}
      g.globalAlpha=b.a*GA;
      if(b.r<3){g.beginPath();g.arc(b.x,b.y,b.r,0,TAU);g.fill()}
      else{o=Math.sin(b.ph*2)*.04;g.drawImage(spr,b.x-b.r*(1+o),b.y-b.r*(1-o),b.r*2*(1+o),b.r*2*(1-o))}
    }

    /* confetti pink melayang */
    for(i=F.length-1;i>=0;i--){
      f=F[i];f.ph+=dt*f.fr;f.rot+=f.vr*dt;f.fl+=f.vf*dt;f.vx*=1-Math.min(1,dt*1.8);f.vy+=(f.vt-f.vy)*Math.min(1,dt*1.4);
      f.x+=(f.vx+Math.cos(f.ph)*f.am)*dt;f.y+=f.vy*dt;
      if(!f.keep){f.l-=dt;if(f.l<=0||f.y<-30){F.splice(i,1);continue}}
      else if(f.y<-30){F[i]=newF(false);continue}
      var cs=Math.cos(f.rot),sn=Math.sin(f.rot),fy=Math.cos(f.fl);
      g.globalAlpha=Math.min(1,f.l)*.78*GA;g.fillStyle=f.c;g.beginPath();
      for(var k=0;k<3;k++){var lx=TRI[k][0]*f.s,ly=TRI[k][1]*f.s*fy;
        g[k?'lineTo':'moveTo'](f.x+lx*cs-ly*sn,f.y+lx*sn+ly*cs)}
      g.closePath();g.fill();
    }
    g.fillStyle='#fff';

    /* kilau bintang */
    for(i=0;i<K.length;i++){
      o=K[i];o.ph+=dt*o.fr;o.y+=o.vy*dt;if(o.y<-12){o.y=H+12;o.x=rr(0,W)}
      var tw=(Math.sin(o.ph)+1)/2,s=o.s*(.4+.8*tw);
      g.globalAlpha=(.15+.85*tw)*GA;g.beginPath();
      g.moveTo(o.x,o.y-s);g.lineTo(o.x+s*.2,o.y-s*.2);g.lineTo(o.x+s,o.y);g.lineTo(o.x+s*.2,o.y+s*.2);
      g.lineTo(o.x,o.y+s);g.lineTo(o.x-s*.2,o.y+s*.2);g.lineTo(o.x-s,o.y);g.lineTo(o.x-s*.2,o.y-s*.2);g.closePath();g.fill();
    }

    /* riak */
    g.strokeStyle='#fff';
    for(i=R.length-1;i>=0;i--){
      o=R[i];o.r+=dt*o.max*1.5;if(o.r>=o.max){R.splice(i,1);continue}
      d=1-o.r/o.max;g.lineWidth=2.4*d+.6;g.globalAlpha=d*o.a*GA;g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.stroke();
      g.lineWidth=1;g.globalAlpha=d*d*o.a*.6*GA;g.beginPath();g.arc(o.x,o.y,o.r*.72,0,TAU);g.stroke();
    }

    /* percikan */
    for(i=D.length-1;i>=0;i--){
      o=D[i];o.l+=dt;if(o.l>=o.m){D.splice(i,1);continue}
      o.vy+=700*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;
      g.globalAlpha=(1-o.l/o.m)*GA;g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill();
    }
    g.globalAlpha=1;
  }

  function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  function stop(){if(raf){cancelAnimationFrame(raf);raf=0}g.clearRect(0,0,W,H)}

  /* ---------- interaksi ---------- */
  document.addEventListener('pointermove',function(e){
    if(e.pointerType==='touch')return;
    mx=e.clientX;my=e.clientY;
    var now=performance.now();
    if(!calm&&now-lastTrail>110&&Math.abs(e.movementX||0)+Math.abs(e.movementY||0)>14&&B.length<MAXB){
      lastTrail=now;var b=newB(false);b.keep=false;b.r=rr(2,5);b.x=mx;b.y=my;b.vy=-rr(20,60);b.vt=-rr(40,70);B.push(b)}
  },{passive:true});
  document.addEventListener('pointerout',function(e){if(!e.relatedTarget){mx=my=-999}});
  document.addEventListener('pointerdown',function(e){
    burst(e.clientX,e.clientY,LITE?3:6);
    if(e.pointerType==='touch'){mx=e.clientX;my=e.clientY;setTimeout(function(){mx=my=-999},180)}
  },{passive:true});
  window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(size,150)});

  /* ingat tingkat kualitas antarhalaman supaya perangkat lambat tidak mulai dari penuh lagi di tiap halaman */
  try{dg=+sessionStorage.getItem('airq')||0}catch(e){}
  for(var z=0;z<dg;z++){Q*=.6;MAXB=Math.max(30,MAXB*.7|0)}
  LV=(HOME?1:.55)*Q;if(dg>=2)document.documentElement.classList.add('lite');
  spr=mkSprite();size();
  window.Air={burst:burst,surge:surge,ripple:ripple,setCalm:function(c){calm=c;if(c)stop();else start()}};
  if(!calm)start();
})();
