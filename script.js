const form = document.querySelector('#signup-form');
const country = document.querySelector('#country');
const callingCode = document.querySelector('#calling-code');
const success = document.querySelector('#success-state');
const guestFirst = document.querySelector('#guest-first');
let guest = {};
country.addEventListener('change', () => { callingCode.value = country.value; });

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), {threshold: .12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-header nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false');
}));

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true; button.querySelector('span').textContent = 'Sending your RSVP…';
  const data = new FormData(form);
  data.set('Phone', `${country.value} ${document.querySelector('#phone').value.trim()}`);
  try {
    const response = await fetch(form.action, {method: 'POST', body: JSON.stringify(Object.fromEntries(data)), headers: {'Content-Type': 'application/json', Accept: 'application/json'}});
    const result = await response.json();
    if (!response.ok || result.success === 'false' || result.success === false) throw new Error('RSVP could not be submitted');
    guest = {name: data.get('Full name'), email: data.get('Email'), phone: data.get('Phone')};
    guestFirst.textContent = guest.name.trim().split(/\s+/)[0];
    form.hidden = true; success.hidden = false;
    success.scrollIntoView({behavior:'smooth', block:'center'});
  } catch (error) {
    button.disabled = false; button.querySelector('span').textContent = 'Reserve my seat';
    alert('We could not send your RSVP just now. Please check your connection and try again.');
  }
});

document.querySelector('#download-invite').addEventListener('click', () => {
  if (!window.jspdf?.jsPDF) { alert('The invitation PDF tool could not load. Please refresh and try again.'); return; }
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a5'});
  const w=148, h=210;
  doc.setFillColor(55,41,65); doc.rect(0,0,w,h,'F');
  doc.setFillColor(242,230,244); doc.circle(126,25,43,'F');
  doc.setFillColor(216,175,215); doc.circle(14,193,39,'F');
  doc.setDrawColor(229,205,231); doc.setLineWidth(.5); doc.roundedRect(9,9,w-18,h-18,2,2,'S');
  doc.setTextColor(239,214,239); doc.setFont('times','italic'); doc.setFontSize(13); doc.text('✳',w/2,32,{align:'center'});
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setCharSpace(2); doc.text('YOU ARE INVITED',w/2,44,{align:'center'}); doc.setCharSpace(0);
  doc.setTextColor(255,250,247); doc.setFont('times','normal'); doc.setFontSize(31); doc.text('Healing',w/2,69,{align:'center'}); doc.text('Voices',w/2,84,{align:'center'});
  doc.setTextColor(220,179,221); doc.setFont('times','italic'); doc.setFontSize(17); doc.text('2026',w/2,98,{align:'center'});
  doc.setDrawColor(203,161,202); doc.line(51,108,97,108);
  doc.setTextColor(255,250,247); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text('With joy, we welcome',w/2,122,{align:'center'});
  doc.setFont('times','italic'); doc.setFontSize(21); const nameLines=doc.splitTextToSize(guest.name,118); doc.text(nameLines,w/2,137,{align:'center'});
  doc.setTextColor(229,217,232); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text('to an evening of stories, connection & hope.',w/2,157,{align:'center'});
  doc.setTextColor(239,214,239); doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setCharSpace(1.5); doc.text('A SPACE FOR EVERY VOICE',w/2,178,{align:'center'}); doc.setCharSpace(0);
  doc.setTextColor(231,219,231); doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.text('We look forward to sharing this moment with you.',w/2,186,{align:'center'});
  doc.save(`Healing-Voices-Invitation-${guest.name.trim().replace(/\s+/g,'-')}.pdf`);
});
document.querySelector('#register-another').addEventListener('click', () => { success.hidden=true; form.hidden=false; form.reset(); country.value='+234'; callingCode.value='+234'; form.querySelector('button[type="submit"]').disabled=false; form.querySelector('button[type="submit"] span').textContent='Reserve my seat'; form.scrollIntoView({behavior:'smooth',block:'center'}); });
