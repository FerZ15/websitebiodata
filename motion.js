/* motion.js - gerak tambahan: sentakan saat memilih, teks berganti meluncur, isi halaman masuk berurutan */
(function(){
  var R=document.documentElement;
  function restart(el,c){if(!el||R.classList.contains('noanim'))return;el.classList.remove(c);void el.offsetWidth;el.classList.add(c)}
  /* semua kotak/baris/kartu ikut animasi masuk berurutan, bukan muncul tiba-tiba */
  var v=document.getElementById('view');
  if(v){
    var n=v.querySelectorAll('.st').length;
    [].forEach.call(v.querySelectorAll('.box,.card,.sk,.row,.detail,.gh,.links,.galw,.pic'),function(e){
      if(e.classList.contains('st')||e.closest('.st'))return;
      e.classList.add('st');e.style.setProperty('--i',n++);
    });
  }
  /* sentakan saat pilihan pindah (menu beranda & daftar proyek) */
  var mo=new MutationObserver(function(ms){ms.forEach(function(m){
    var t=m.target,o=' '+(m.oldValue||'')+' ';
    if(m.attributeName==='aria-current'){if(t.getAttribute('aria-current')==='true')restart(t,'jolt')}
    else if(t.classList.contains('row')&&t.classList.contains('on')&&o.indexOf(' on ')<0)restart(t,'jolt');
  })});
  [].forEach.call(document.querySelectorAll('.it,.row'),function(e){mo.observe(e,{attributes:true,attributeFilter:['aria-current','class'],attributeOldValue:true})});
  /* teks yang diganti lewat script ikut meluncur */
  var so=new MutationObserver(function(ms){ms.forEach(function(m){restart(m.target.closest('.detail')||m.target,'swap')})});
  [].forEach.call(document.querySelectorAll('#desc,.detail,.tabs span'),function(e){so.observe(e,{childList:true,subtree:true,characterData:true})});
})();

/* ===== scroll merah dengan pegas: meluncur naik-turun dan melar saat bergerak ===== */
(function(){
  var v=document.getElementById('view'),R=document.documentElement;
  if(!v)return;
  var sb=document.createElement('div'),th=document.createElement('i'),pos=0,vel=0,run=0,hide=0;
  sb.id='sb';sb.setAttribute('aria-hidden','true');sb.appendChild(th);document.body.appendChild(sb);
  function calm(){return R.classList.contains('noanim')}
  function geo(){
    var H=sb.clientHeight,ch=v.clientHeight,sh=v.scrollHeight;
    if(sh<=ch+4||!H){sb.classList.remove('on');return null}
    var h=Math.max(36,H*ch/sh);
    return {h:h,t:(H-h)*v.scrollTop/(sh-ch)};
  }
  function draw(g){
    var st=1+Math.min(Math.abs(vel)*.03,.7);
    th.style.height=g.h+'px';
    th.style.transform='translateY('+pos+'px) skewX(-14deg) scaleY('+st+')';
  }
  function frame(){
    run=0;var g=geo();if(!g)return;
    sb.classList.add('on');
    if(calm()){pos=g.t;vel=0;draw(g);return}
    vel+=(g.t-pos)*.16;vel*=.72;pos+=vel;     /* pegas: sedikit melewati lalu kembali */
    draw(g);
    if(Math.abs(g.t-pos)>.3||Math.abs(vel)>.3)run=requestAnimationFrame(frame);
    else{pos=g.t;vel=0;draw(g)}
  }
  function kick(){if(!run)run=requestAnimationFrame(frame);clearTimeout(hide)}
  v.addEventListener('scroll',kick,{passive:true});
  addEventListener('resize',kick);
  if(window.ResizeObserver)new ResizeObserver(kick).observe(v.querySelector('.body')||v);
  /* saat halaman terbuka, kepala scroll meluncur turun dari atas */
  pos=-40;kick();setTimeout(kick,900);
  /* ayunan besar saat kartu foto berganti */
  var pic=document.getElementById('pic'),n=pic&&pic.querySelector('.n');
  if(n)new MutationObserver(function(){if(calm())return;pic.classList.remove('swing');void pic.offsetWidth;pic.classList.add('swing')}).observe(n,{childList:true,characterData:true,subtree:true});
})();
