const form = document.querySelector('#signup-form');
const country = document.querySelector('#country');
const callingCode = document.querySelector('#calling-code');
const success = document.querySelector('#success-state');
const guestFirst = document.querySelector('#guest-first');
const guestNumber = document.querySelector('#guest-number');
const participantNumberInput = document.querySelector('#participant-number');
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
  if (!participantNumberInput.value) participantNumberInput.value = createParticipantNumber();
  data.set('Participant number', participantNumberInput.value);
  data.set('Phone', `${country.value} ${document.querySelector('#phone').value.trim()}`);
  try {
    const response = await fetch(form.action, {method: 'POST', body: JSON.stringify(Object.fromEntries(data)), headers: {'Content-Type': 'application/json', Accept: 'application/json'}});
    const result = await response.json();
    if (!response.ok || result.success === 'false' || result.success === false) throw new Error('RSVP could not be submitted');
    guest = {name: data.get('Full name'), email: data.get('Email'), phone: data.get('Phone'), number: participantNumberInput.value};
    guestFirst.textContent = guest.name.trim().split(/\s+/)[0];
    guestNumber.textContent = guest.number;
    document.querySelector('#invite-number').textContent = guest.number;
    document.querySelector('#invite-guest').textContent = guest.name;
    form.hidden = true; success.hidden = false;
    success.scrollIntoView({behavior:'smooth', block:'center'});
  } catch (error) {
    button.disabled = false; button.querySelector('span').textContent = 'Reserve my seat';
    alert('We could not send your RSVP just now. Please check your connection and try again.');
  }
});

function createParticipantNumber() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const number = 100000 + (bytes[0] % 900000);
  return `HV26-${number}`;
}

document.querySelector('#download-invite').addEventListener('click', () => {
  if (!window.jspdf?.jsPDF) { alert('The invitation PDF tool could not load. Please refresh and try again.'); return; }
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF({orientation:'landscape', unit:'mm', format:'a5'});
  const w=210, h=148, panel=71;

  // Soft paper, plum ticket panel, and fine double frame.
  doc.setFillColor(250,247,241); doc.rect(0,0,w,h,'F');
  doc.setFillColor(54,39,64); doc.rect(0,0,panel,h,'F');
  doc.setDrawColor(224,207,226); doc.setLineWidth(.45); doc.roundedRect(5,5,w-10,h-10,2,2,'S');
  doc.setDrawColor(198,160,203); doc.setLineWidth(.35); doc.roundedRect(8,8,panel-16,h-16,1.5,1.5,'S');

  // Abstract orbit and glowing center create a unique, botanical keepsake motif.
  doc.setDrawColor(211,174,216); doc.setLineWidth(.5); doc.ellipse(34,71,25,39,'S');
  doc.setDrawColor(211,174,216); doc.ellipse(34,71,18,34,'S');
  doc.setFillColor(197,151,205); doc.circle(34,61,11,'F');
  doc.setFillColor(226,199,230); doc.circle(29,56,3,'F');
  doc.setTextColor(255,249,255); doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setCharSpace(1.2); doc.text('HEALING VOICES',15,18); doc.setCharSpace(0);
  doc.setTextColor(225,204,230); doc.setFont('helvetica','normal'); doc.setFontSize(5.5); doc.setCharSpace(1.5); doc.text('WITH ABIKE',15,23); doc.setCharSpace(0);
  doc.setTextColor(255,249,255); doc.setFont('times','normal'); doc.setFontSize(21); doc.text('A space',15,111); doc.text('to be',15,121);
  doc.setTextColor(221,184,226); doc.setFont('times','italic'); doc.setFontSize(21); doc.text('heard.',15,131);
  doc.setTextColor(226,207,228); doc.setFont('helvetica','normal'); doc.setFontSize(5); doc.setCharSpace(1); doc.text('LISTEN  |  CONNECT  |  HEAL',15,140); doc.setCharSpace(0);

  // Editorial invitation typography and the assigned participant number.
  const x=86, right=198;
  doc.setTextColor(137,116,140); doc.setFont('helvetica','bold'); doc.setFontSize(6); doc.setCharSpace(1.3); doc.text('YOUR PERSONAL INVITATION',x,18); doc.setCharSpace(0);
  doc.setDrawColor(220,205,222); doc.setLineWidth(.4); doc.roundedRect(157,11,40,12,2,2,'S');
  doc.setTextColor(118,84,124); doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.text('PARTICIPANT NO.',160,16);
  doc.setFontSize(6.5); doc.text(guest.number,160,20);
  doc.setTextColor(58,45,62); doc.setFont('times','normal'); doc.setFontSize(29); doc.text('Healing',x,49);
  doc.setTextColor(151,108,158); doc.setFont('times','italic'); doc.setFontSize(29); doc.text('Voices',x,62);
  doc.setDrawColor(199,151,205); doc.setLineWidth(.7); doc.line(x,69,right,69);
  doc.setFillColor(199,151,205); doc.circle((x+right)/2,69,1.5,'F');
  doc.setTextColor(149,132,153); doc.setFont('helvetica','bold'); doc.setFontSize(5.7); doc.setCharSpace(1.2); doc.text('WITH JOY, WE WELCOME',x,79); doc.setCharSpace(0);
  const nameSize = guest.name.length > 24 ? 14 : guest.name.length > 16 ? 17 : 21;
  doc.setTextColor(78,59,85); doc.setFont('times','italic'); doc.setFontSize(nameSize);
  const nameLines=doc.splitTextToSize(guest.name,108); doc.text(nameLines,x,91);
  const messageY = 91 + (nameLines.length > 1 ? 11 : 7);
  doc.setTextColor(116,105,119); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
  doc.text('to an evening of stories, connection and the courage to begin again.',x,messageY);
  doc.setDrawColor(226,216,226); doc.line(x,130,right,130);
  doc.setTextColor(153,135,155); doc.setFont('helvetica','bold'); doc.setFontSize(5.5); doc.setCharSpace(1.2); doc.text('COME AS YOU ARE',x,137); doc.setCharSpace(0);
  doc.setFont('helvetica','normal'); doc.text('HV | 2026',right,137,{align:'right'});
  doc.save(`Healing-Voices-${guest.number}.pdf`);
});
document.querySelector('#register-another').addEventListener('click', () => { success.hidden=true; form.hidden=false; form.reset(); country.value='+234'; callingCode.value='+234'; participantNumberInput.value=''; form.querySelector('button[type="submit"]').disabled=false; form.querySelector('button[type="submit"] span').textContent='Reserve my seat'; form.scrollIntoView({behavior:'smooth',block:'center'}); });
