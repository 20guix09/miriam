const supported=['pt-PT','pt-BR','en'];
const fallback='pt-PT';
const buttons=[...document.querySelectorAll('[data-lang]')];
let messages={};
const getPath=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
async function loadLanguage(lang){
  if(!supported.includes(lang)) lang=fallback;
  try{messages=await fetch(`locales/${lang}.json`).then(r=>{if(!r.ok)throw new Error();return r.json()})}catch{if(lang!==fallback)return loadLanguage(fallback)}
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const value=getPath(messages,el.dataset.i18n);if(value)el.innerHTML=value});
  buttons.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.lang===lang)));
  localStorage.setItem('rossini-language',lang);
  const whatsapp=document.getElementById('whatsapp-link');
  if(whatsapp){const text=getPath(messages,'booking.message');whatsapp.href=`https://wa.me/351934463513?text=${encodeURIComponent(text||'Olá, Mirian! Tudo bem? Vim pelo site da Rossini Lash Design e gostaria de saber mais sobre os serviços e horários disponíveis.')}`}
}
buttons.forEach(btn=>btn.addEventListener('click',()=>loadLanguage(btn.dataset.lang)));
const saved=localStorage.getItem('rossini-language');
const browser=navigator.language?.toLowerCase().startsWith('pt-br')?'pt-BR':fallback;
loadLanguage(saved||browser);

const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('.mobile-menu');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));menu.hidden=open});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}));

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'))}else{
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}

document.getElementById('year').textContent=new Date().getFullYear();

const header=document.querySelector('.header');
const hero=document.querySelector('.hero');
const sectionLinks=[...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]')];
const observedSections=[...new Set(sectionLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean))];
let previousY=window.scrollY;
let ticking=false;
let mobileHideTimer;
function setActiveNavigation(){
  const marker=window.scrollY+Math.min(window.innerHeight*.38,320);
  let current=null;
  for(const section of observedSections){if(section.offsetTop<=marker)current=section;else break}
  sectionLinks.forEach(link=>{
    const active=current&&link.getAttribute('href')===`#${current.id}`;
    link.classList.toggle('is-active',Boolean(active));
    if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
}
function scheduleMobileHide(delay=1800){
  clearTimeout(mobileHideTimer);
  mobileHideTimer=setTimeout(()=>{
    if(menuButton.getAttribute('aria-expanded')!=='true')header.classList.remove('header-visible');
  },delay);
}
function updateHeader(){
  const currentY=window.scrollY;
  const pastHero=currentY>hero.offsetHeight-80;
  const mobile=matchMedia('(max-width: 759px)').matches;
  header.classList.toggle('after-hero',pastHero);
  if(mobile&&pastHero){
    const goingUp=currentY<previousY-3;
    const goingDown=currentY>previousY+5;
    if(goingUp){header.classList.add('header-visible');scheduleMobileHide(2000)}
    else if(goingDown&&menuButton.getAttribute('aria-expanded')!=='true'){scheduleMobileHide(650)}
    if(menuButton.getAttribute('aria-expanded')==='true'){clearTimeout(mobileHideTimer);header.classList.add('header-visible')}
  }else{header.classList.remove('header-visible')}
  setActiveNavigation();
  previousY=currentY;
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateHeader);ticking=true}},{passive:true});
addEventListener('resize',updateHeader,{passive:true});
updateHeader();
header.addEventListener('pointerdown',()=>clearTimeout(mobileHideTimer));
header.addEventListener('pointerup',()=>{if(matchMedia('(max-width: 759px)').matches&&window.scrollY>hero.offsetHeight-80)scheduleMobileHide(2200)});

document.getElementById('back-to-top').addEventListener('click',event=>{
  event.preventDefault();
  clearTimeout(mobileHideTimer);
  window.scrollTo({top:0,left:0,behavior:reduced?'auto':'smooth'});
});

// Future AIChat integration point. Intentionally disabled in this release.
export const assistantConfig={enabled:false,scope:['procedures','aftercare','location','contact','hours','faq'],fallback:'human'};
