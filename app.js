import './src/style.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = (name) => {
  const icons = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-3 2a16 16 0 0 0 5 5l2-3 5 2v4c0 1-1 2-2 2C10 21 3 14 3 6c0-1 1-2 2-2Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  }
  return icons[name]
}

const defaultArtists = [
  {id:'fabi', name:'Fabi'}, {id:'katharine', name:'Katharine'},
  {id:'artist-3', name:'Lena'}, {id:'artist-4', name:'Max'}
]
const defaultWorks = [
  {id:'w1',artist:'fabi',src:'/images/IMG_6562.jpg'}, {id:'w2',artist:'katharine',src:'/images/IMG_6404.jpg'},
  {id:'w3',artist:'fabi',src:'/images/IMG_6632.jpg'}, {id:'w4',artist:'katharine',src:'/images/IMG_6722.jpg'},
  {id:'w5',artist:'fabi',src:'/images/IMG_6489.jpg'}, {id:'w6',artist:'katharine',src:'/images/IMG_7446.jpg'}
]
let artists = JSON.parse(localStorage.getItem('coupleink-artists') || 'null') || defaultArtists
let works = JSON.parse(localStorage.getItem('coupleink-works') || 'null') || defaultWorks
// Bezeichnungen aus der ersten Admin-Version verständlicher migrieren.
artists.forEach(artist => {
  if(artist.id === 'artist-3' && ['Artist 03','Resident Artist I'].includes(artist.name)) artist.name = 'Lena'
  if(artist.id === 'artist-4' && ['Artist 04','Resident Artist II'].includes(artist.name)) artist.name = 'Max'
})
localStorage.setItem('coupleink-artists', JSON.stringify(artists))

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="brand" href="#top" aria-label="Couple Ink Startseite"><img src="/images/Logo-1.png" alt="Couple Ink" /></a>
    <nav class="desktop-nav" aria-label="Hauptnavigation"><a href="#works">Arbeiten</a><a href="#story">Über uns</a><a href="#contact">Kontakt</a></nav>
    <a class="header-cta" href="#booking">Termin anfragen ${icon('arrow')}</a>
    <button class="menu-button" type="button" aria-label="Menü öffnen" aria-expanded="false"><span></span><span></span></button>
  </header>
  <div class="mobile-menu" aria-hidden="true"><nav><a href="#works">Arbeiten</a><a href="#story">Über uns</a><a href="#booking">Termin anfragen</a><a href="#contact">Kontakt</a></nav><p>Wörth am Rhein · Rheinland-Pfalz</p></div>

  <main id="top">
    <section class="hero-section">
      <div class="hero-image" role="img" aria-label="Realistisches Tattoo von Couple Ink"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content reveal">
        <p class="eyebrow light"><span></span>Tattoo Studio · Wörth</p>
        <h1>Stories under<br><em>your skin.</em></h1>
        <p class="hero-copy">Individuelle Tattoos. Ehrliches Handwerk.<br>Von der ersten Idee bis zum letzten Detail.</p>
        <a class="circle-link" href="#booking"><span>Dein Projekt<br>starten</span>${icon('arrow')}</a>
      </div>
      <div class="hero-index">Est. 2024 <span>49°03' · 08°15'</span></div>
      <a href="#works" class="scroll-hint">Entdecken <span></span></a>
    </section>

    <section class="intro section-pad">
      <div class="section-label reveal"><span>01</span><p>Deine Idee.<br>Unsere Leidenschaft.</p></div>
      <div class="intro-copy reveal"><p class="eyebrow"><span></span>Made to stay</p><h2>Keine Vorlage.<br>Kein Kompromiss.</h2><p>Wir glauben, dass ein Tattoo mehr ist als Tinte auf Haut. Es ist Erinnerung, Ausdruck und ein Stück Persönlichkeit. Deshalb entsteht bei uns jedes Motiv im echten Austausch mit dir.</p><a class="text-link" href="#story">Lerne uns kennen ${icon('arrow')}</a></div>
    </section>

    <section id="works" class="works-section section-pad">
      <div class="works-head reveal"><div><p class="eyebrow"><span></span>Selected works</p><h2>Unter die Haut.</h2></div><p>Black & Grey · Realism<br>Fineline · Individual</p></div>
      <div class="artist-tabs" role="tablist" aria-label="Arbeiten nach Artist"></div>
      <div class="gallery"></div>
    </section>

    <section id="story" class="story-section">
      <div class="story-visual reveal"><img src="/images/Fabi_Katharine.jpeg" alt="Fabi und Katharine, Gründer von Couple Ink" loading="lazy"><div class="stamp">TWO MINDS<br><span>ONE PASSION</span></div></div>
      <div class="story-content reveal"><p class="eyebrow"><span></span>Fabi & Katharine</p><h2>Aus Leidenschaft<br>wurde Familie.</h2><p>Alles begann 2016 auf einer Party in Karlsruhe. Fabi und Katharine merkten schnell, dass sie dieselbe Leidenschaft teilen. Kurz darauf begann Katharine in dem Studio zu piercen, in dem Fabi damals arbeitete – und Fabi begleitete sie auf ihrem Weg zur Tätowiererin.</p><p>Über Jahre arbeiteten beide Seite an Seite und wurden beste Freunde. Im Oktober 2020 eröffnete Katharine zunächst ihr eigenes Studio. Fabi arbeitete dort immer wieder mit ihr und beiden wurde klar, wie perfekt sie sich menschlich und in ihrer Arbeit ergänzen.</p><p>Aus Freundschaft wurde Liebe, aus zwei Wegen wurde ein gemeinsamer: Im Februar 2024 eröffneten sie Couple Ink in Wörth. Heute sind sie nicht nur Studioinhaber und Paar, sondern frischgebackene Eltern. Ihr Baby macht die kleine Couple-Ink-Familie vollkommen – und erinnert jeden Tag daran, worum es wirklich geht: Vertrauen, Zusammenhalt und etwas Bleibendes zu schaffen.</p><div class="signature">Fabi, Katharine & Family</div></div>
    </section>

    <section class="studio-family section-pad">
      <div class="family-lead reveal"><p class="eyebrow light"><span></span>More than a studio</p><h2>Vier Artists.<br><em>Eine Familie.</em></h2><p>Lena und Max waren schon immer vom Tätowieren fasziniert. Fabi und Katharine haben sie von Grund auf ausgebildet – und schnell wurde sichtbar, wie viel Talent in beiden steckt. Schon ihre ersten Kunden waren begeistert. Heute sind Lena und Max ein fester Bestandteil von Couple Ink. Wegzudenken? Unmöglich.</p></div>
      <div class="family-portraits reveal">
        <figure class="portrait-max"><img src="/images/Max.jpeg" alt="Max, Tattoo Artist bei Couple Ink" loading="lazy"><figcaption><span>01</span><div><h3>Max</h3><p>Resident Artist · Bei Couple Ink ausgebildet</p></div></figcaption></figure>
        <figure class="portrait-lena"><img src="/images/Lena.jpeg" alt="Lena, Tattoo Artist bei Couple Ink" loading="lazy"><figcaption><span>02</span><div><h3>Lena</h3><p>Resident Artist · Bei Couple Ink ausgebildet</p></div></figcaption></figure>
        <figure class="portrait-team"><img src="/images/Team.jpeg" alt="Das gesamte Couple Ink Team" loading="lazy"><figcaption><span>03</span><div><h3>Das Team</h3><p>Vier Artists · Eine Familie</p></div></figcaption></figure>
        <figure class="portrait-founders"><img src="/images/Fabi_Katharine.jpeg" alt="Fabi und Katharine" loading="lazy"><figcaption><span>04</span><div><h3>Fabi & Katharine</h3><p>Gründer · Mentoren · Familie</p></div></figcaption></figure>
      </div>
      <div class="family-baby-note reveal"><span>∞</span><div><h3>Und das jüngste Familienmitglied</h3><p>Das Baby von Fabi und Katharine · Frisch angekommen · Schon mittendrin</p></div><i>♥</i></div>
      <div class="family-pride reveal"><span>Convention<br>Awards</span><strong>1.</strong><p>Ihre Arbeiten wurden bereits auf Conventions platziert – darunter mit dem 1. Platz. Ein Erfolg, der Talent, Mut und unzählige Stunden gemeinsamer Arbeit sichtbar macht.</p></div>
      <blockquote class="reveal">„Lena und Max sind unser ganzer Stolz.<br>Sie gehören zu uns – und wir geben sie nicht mehr her.“</blockquote>
    </section>

    <section id="booking" class="booking-section section-pad">
      <div class="booking-intro reveal"><p class="eyebrow light"><span></span>Dein nächstes Tattoo</p><h2>Erzähl uns<br>deine Idee.</h2><p>Je genauer deine Angaben, desto besser können wir dein Projekt einschätzen. Wir melden uns persönlich bei dir – eine Anfrage ist noch keine feste Buchung.</p><div class="steps"><span class="active">01 Idee</span><span>02 Details</span><span>03 Kontakt</span></div></div>
      <form id="tattoo-form" class="booking-form reveal" novalidate>
        <div class="form-step active" data-step="1">
          <div class="field full"><label for="idea">Beschreibe dein Wunschmotiv *</label><textarea id="idea" name="idea" rows="4" required placeholder="Motiv, Bedeutung, wichtige Details …"></textarea></div>
          <div class="field"><label for="style">Stilrichtung *</label><select id="style" name="style" required><option value="">Bitte wählen</option><option>Black & Grey</option><option>Realistic</option><option>Fineline</option><option>Lettering</option><option>Cover-up</option><option>Sonstiges / unsicher</option></select></div>
          <div class="field"><label for="artist">Wunsch-Artist</label><select id="artist" name="artist"><option value="">Egal / Empfehlung</option>${artists.map(artist=>`<option value="${artist.id}">${artist.name}</option>`).join('')}</select></div>
          <button class="next-button" type="button">Weiter zu den Details ${icon('arrow')}</button>
        </div>
        <div class="form-step" data-step="2">
          <div class="field"><label for="placement">Körperstelle *</label><input id="placement" name="placement" required placeholder="z. B. Unterarm außen"></div>
          <div class="field"><label for="size">Ungefähre Größe *</label><input id="size" name="size" required placeholder="z. B. 15 × 10 cm"></div>
          <div class="field"><label for="color">Farbwunsch</label><select id="color" name="color"><option>Schwarz / Grau</option><option>Farbe</option><option>Noch offen</option></select></div>
          <div class="field"><label for="skin">An dieser Stelle</label><select id="skin" name="skin"><option>Noch nicht tätowiert</option><option>Bereits tätowiert / Erweiterung</option><option>Cover-up gewünscht</option><option>Narbengewebe</option></select></div>
          <div class="field full"><label for="references">Referenzbilder</label><div class="file-box"><input id="references" name="references" type="file" accept="image/jpeg,image/png,image/webp" multiple><span><strong>Bilder auswählen</strong><small>JPG, PNG oder WEBP · max. 10 MB</small></span></div></div>
          <div class="field"><label for="budget">Budgetrahmen</label><select id="budget" name="budget"><option value="">Noch offen</option><option>bis 300 €</option><option>300–600 €</option><option>600–1.000 €</option><option>über 1.000 €</option></select></div>
          <div class="field"><label for="timing">Wunschzeitraum</label><input id="timing" name="timing" placeholder="z. B. Oktober 2026"></div>
          <div class="form-actions"><button class="back-button" type="button">Zurück</button><button class="next-button" type="button">Weiter zum Kontakt ${icon('arrow')}</button></div>
        </div>
        <div class="form-step" data-step="3">
          <div class="field"><label for="firstname">Vorname *</label><input id="firstname" name="firstname" autocomplete="given-name" required></div>
          <div class="field"><label for="lastname">Nachname *</label><input id="lastname" name="lastname" autocomplete="family-name" required></div>
          <div class="field"><label for="email">E-Mail *</label><input id="email" name="email" type="email" autocomplete="email" required></div>
          <div class="field"><label for="phone">Telefon *</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>
          <div class="field"><label for="age">Alter *</label><input id="age" name="age" type="number" min="18" max="99" required placeholder="Mindestens 18"></div>
          <div class="field"><label for="contactway">Bevorzugter Kontakt</label><select id="contactway" name="contactway"><option>E-Mail</option><option>Telefon</option><option>WhatsApp</option></select></div>
          <label class="check full"><input type="checkbox" required><span>Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu. *</span></label>
          <label class="check full"><input type="checkbox"><span>Ich möchte über Guest Spots und freie Termine informiert werden.</span></label>
          <div class="form-actions"><button class="back-button" type="button">Zurück</button><button class="submit-button" type="submit">Anfrage absenden ${icon('arrow')}</button></div>
        </div>
        <div class="form-success"><span>✓</span><h3>Danke für deine Anfrage.</h3><p>Wir schauen uns dein Projekt an und melden uns persönlich bei dir.</p></div>
      </form>
    </section>

    <section id="contact" class="location-section">
      <div class="map-wrap reveal">
        <div id="studio-map" aria-label="Interaktive Karte zum Couple Ink Tattoo Studio"></div>
        <div class="map-shade"></div>
        <div class="map-coordinates">49°03' N<br>08°15' E</div>
      </div>
      <address class="location-card reveal">
        <p class="eyebrow light"><span></span>Find us</p>
        <div class="location-number">05</div>
        <h2>Hier beginnt<br>dein Projekt.</h2>
        <div class="address-block"><strong>Couple Ink Tattoo</strong><p>Ottstraße 23A<br>76744 Wörth am Rhein<br>Deutschland</p></div>
        <a class="route-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=Ottstra%C3%9Fe%2023A%2C%2076744%20W%C3%B6rth%20am%20Rhein" target="_blank" rel="noopener"><span>Route planen</span>${icon('arrow')}</a>
      </address>
    </section>
  </main>

  <footer>
    <div class="footer-top"><p>Bereit für etwas,<br>das bleibt?</p><a href="#booking">Let's talk. ${icon('arrow')}</a></div>
    <div class="footer-grid"><div><img src="/images/Logo-1.png" alt="Couple Ink"><p>Tattoo Studio<br>Wörth am Rhein</p></div><div><h3>Kontakt</h3><a href="tel:+4915562913149">+49 15562 913149</a><a href="mailto:kontakt@coupleink.de">kontakt@coupleink.de</a></div><div><h3>Navigation</h3><a href="#works">Arbeiten</a><a href="#story">Über uns</a><a href="#booking">Termin</a></div><div><h3>Social</h3><a href="https://www.instagram.com/coupleink_woerth/" target="_blank" rel="noopener noreferrer" aria-label="Couple Ink auf Instagram öffnen">@coupleink_woerth ${icon('instagram')}</a></div></div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Couple Ink</span><div><a href="https://coupleink.de/impressum/">Impressum</a><a href="https://coupleink.de/datenschutzerklaerung/">Datenschutz</a><a href="https://coupleink.de/agb/">AGB</a><a href="?admin=1">Admin</a></div><a href="#top">Nach oben ↑</a></div>
  </footer>

  <dialog class="lightbox"><button aria-label="Schließen">${icon('close')}</button><img alt="Tattoo-Arbeit vergrößert"><p></p></dialog>
  <dialog class="admin-login">
    <form method="dialog" class="admin-login-form">
      <button class="admin-login-close" value="cancel" aria-label="Anmeldung schließen">${icon('close')}</button>
      <small>COUPLE INK CMS</small>
      <h2>Admin-Anmeldung</h2>
      <p>Melde dich an, um die Galerie zu verwalten.</p>
      <label>Benutzername<input name="username" autocomplete="username" required></label>
      <label>Passwort<input name="password" type="password" autocomplete="current-password" required></label>
      <p class="admin-login-error" role="alert" aria-live="polite"></p>
      <button class="admin-login-submit" value="login">Anmelden ${icon('arrow')}</button>
    </form>
  </dialog>
  <dialog class="admin-panel">
    <div class="admin-head"><div><small>COUPLE INK CMS</small><h2>Galerie verwalten</h2></div><button class="admin-close" aria-label="Adminpanel schließen">${icon('close')}</button></div>
    <section><div class="admin-section-head"><h3>Artist-Bereiche</h3><form class="admin-add-artist"><input name="name" required maxlength="30" placeholder="Name des Artists"><button type="submit">Artist anlegen +</button></form></div><div class="admin-artists"></div></section>
    <section><h3>Bilder hochladen</h3><form class="admin-upload"><label>Artist<select name="artist"></select></label><label class="admin-file">Bilder auswählen<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required></label><button type="submit">Bulk Upload ${icon('arrow')}</button></form><p class="admin-note">Mehrfachauswahl möglich. Bilder werden optimiert und automatisch als <strong>Artist_001</strong>, <strong>Artist_002</strong> usw. benannt.</p></section>
    <section><div class="admin-section-head"><h3>Zentrale Bildverwaltung</h3><div class="bulk-actions"><label><input class="select-all-images" type="checkbox"> Alle</label><button class="bulk-delete" type="button" disabled>Auswahl löschen</button></div></div><div class="admin-images"></div></section>
    <div class="admin-status" role="status"></div>
  </dialog>
`

const header = document.querySelector('.site-header')
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), {passive:true})

const menuBtn = document.querySelector('.menu-button'), mobileMenu = document.querySelector('.mobile-menu')
menuBtn.addEventListener('click', () => { const open = menuBtn.getAttribute('aria-expanded') === 'true'; menuBtn.setAttribute('aria-expanded', String(!open)); mobileMenu.classList.toggle('open', !open); mobileMenu.setAttribute('aria-hidden', String(open)); document.body.classList.toggle('menu-open', !open) })
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menuBtn.click()))

const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible'); observer.unobserve(e.target)}}), {threshold:.12})
document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

const dialog = document.querySelector('.lightbox')
dialog.querySelector('button').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close() })

const tabs = document.querySelector('.artist-tabs'), gallery = document.querySelector('.gallery')
let activeArtist = artists[0].id
function renderGallery(){
  tabs.innerHTML = artists.map((artist, i) => `<button role="tab" aria-selected="${artist.id === activeArtist}" data-artist="${artist.id}"><small>0${i+1}</small>${artist.name}<span>${works.filter(w=>w.artist===artist.id).length}</span></button>`).join('')
  const shown = works.filter(work => work.artist === activeArtist)
  gallery.innerHTML = shown.length ? shown.map((work,i)=>`<button class="work-card visible" data-id="${work.id}" aria-label="Tattoo ${i+1} vergrößern"><img src="${work.src}" loading="${i > 1 ? 'lazy':'eager'}" alt="Tattoo-Arbeit von ${artists.find(a=>a.id===work.artist)?.name || 'Couple Ink'}" /><span>0${i+1} / ${artists.find(a=>a.id===work.artist)?.name}</span><i>+</i></button>`).join('') : `<div class="empty-gallery"><span>Coming soon</span><p>Neue Arbeiten von ${artists.find(a=>a.id===activeArtist)?.name} folgen.</p></div>`
  tabs.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { activeArtist = btn.dataset.artist; renderGallery() }))
  gallery.querySelectorAll('.work-card').forEach(card => card.addEventListener('click', () => { const work = works.find(w=>w.id===card.dataset.id); dialog.querySelector('img').src = work.src; dialog.querySelector('p').textContent = `COUPLE INK · ${artists.find(a=>a.id===work.artist)?.name}`; dialog.showModal() }))
}
renderGallery()

const admin = document.querySelector('.admin-panel'), adminStatus = admin.querySelector('.admin-status')
const adminLogin = document.querySelector('.admin-login')
const adminUser = import.meta.env.VITE_ADMIN_USER
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD
const adminSessionKey = 'coupleink-admin-authenticated'
const adminIsConfigured = Boolean(adminUser && adminPassword)
const openAdmin = () => {
  if(sessionStorage.getItem(adminSessionKey) === 'true') admin.showModal()
  else adminLogin.showModal()
}
let selectedImages = new Set()
const cleanArtistName = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'') || 'Artist'
function normalizeArtistImages(artistId){
  const artist = artists.find(a=>a.id===artistId)
  works.filter(w=>w.artist===artistId).forEach((work,index)=>{ work.filename=`${cleanArtistName(artist?.name)}_${String(index+1).padStart(3,'0')}` })
}
artists.forEach(artist=>normalizeArtistImages(artist.id))
const persist = () => {
  let saved=true
  try{ localStorage.setItem('coupleink-artists',JSON.stringify(artists)); localStorage.setItem('coupleink-works',JSON.stringify(works)) }
  catch{ saved=false; adminStatus.textContent='Browserspeicher voll: Die letzten Änderungen sind nur bis zum Neuladen sichtbar.' }
  renderGallery(); renderAdmin(); return saved
}
function renderAdmin(){
  admin.querySelector('.admin-artists').innerHTML = artists.map((a,i)=>`<label><span>Artist 0${i+1}</span><input data-artist-name="${a.id}" value="${a.name}" maxlength="30"></label>`).join('')
  admin.querySelector('[name="artist"]').innerHTML = artists.map(a=>`<option value="${a.id}">${a.name}</option>`).join('')
  admin.querySelector('.admin-images').innerHTML = works.length ? works.map(w=>`<article class="${selectedImages.has(w.id)?'selected':''}"><label class="image-select"><input type="checkbox" data-select-image="${w.id}" ${selectedImages.has(w.id)?'checked':''}><span>✓</span></label><img src="${w.src}" alt=""><div><strong>${w.filename}</strong><small>${artists.find(a=>a.id===w.artist)?.name}</small><select data-move="${w.id}">${artists.map(a=>`<option value="${a.id}" ${a.id===w.artist?'selected':''}>${a.name}</option>`).join('')}</select></div><button data-delete="${w.id}" aria-label="Bild löschen">×</button></article>`).join('') : '<p>Noch keine Bilder vorhanden.</p>'
  admin.querySelectorAll('[data-artist-name]').forEach(input => input.addEventListener('change', () => { const artist=artists.find(a=>a.id===input.dataset.artistName); artist.name=input.value.trim()||artist.name; normalizeArtistImages(artist.id); persist() }))
  admin.querySelectorAll('[data-move]').forEach(select => select.addEventListener('change', () => { const work=works.find(w=>w.id===select.dataset.move),oldArtist=work.artist; work.artist=select.value; normalizeArtistImages(oldArtist); normalizeArtistImages(work.artist); persist() }))
  admin.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => { if(confirm('Dieses Bild wirklich aus der Galerie entfernen?')){ const artist=works.find(w=>w.id===btn.dataset.delete)?.artist; works=works.filter(w=>w.id!==btn.dataset.delete); selectedImages.delete(btn.dataset.delete); normalizeArtistImages(artist); persist() } }))
  admin.querySelectorAll('[data-select-image]').forEach(input=>input.addEventListener('change',()=>{ input.checked?selectedImages.add(input.dataset.selectImage):selectedImages.delete(input.dataset.selectImage); renderAdmin() }))
  const all=works.length>0&&selectedImages.size===works.length,selectAll=admin.querySelector('.select-all-images'),bulkDelete=admin.querySelector('.bulk-delete')
  selectAll.checked=all; selectAll.indeterminate=selectedImages.size>0&&!all; bulkDelete.disabled=selectedImages.size===0; bulkDelete.textContent=selectedImages.size?`${selectedImages.size} Bilder löschen`:'Auswahl löschen'
}
function optimizeImage(file){ return new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onerror=reject; reader.onload=()=>{ const img=new Image(); img.onerror=reject; img.onload=()=>{ const max=1600, scale=Math.min(1,max/Math.max(img.width,img.height)), canvas=document.createElement('canvas'); canvas.width=Math.round(img.width*scale); canvas.height=Math.round(img.height*scale); canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL('image/jpeg',.84)) }; img.src=reader.result }; reader.readAsDataURL(file) }) }
admin.querySelector('.admin-close').addEventListener('click',()=>admin.close())
adminLogin.addEventListener('close',()=>{
  const form=adminLogin.querySelector('form')
  if(adminLogin.returnValue!=='login') return
  const data=new FormData(form),error=form.querySelector('.admin-login-error')
  if(!adminIsConfigured){ error.textContent='Admin-Zugang ist nicht konfiguriert.'; adminLogin.showModal(); return }
  if(data.get('username')!==adminUser||data.get('password')!==adminPassword){ error.textContent='Benutzername oder Passwort ist falsch.'; form.elements.password.value=''; adminLogin.showModal(); form.elements.password.focus(); return }
  sessionStorage.setItem(adminSessionKey,'true'); error.textContent=''; form.reset(); admin.showModal()
})
admin.querySelector('.admin-add-artist').addEventListener('submit',e=>{ e.preventDefault(); const name=new FormData(e.currentTarget).get('name').trim(); if(!name)return; const id=`artist-${Date.now()}`; artists.push({id,name}); activeArtist=id; e.currentTarget.reset(); persist(); adminStatus.textContent=`${name} wurde als Artist angelegt.` })
admin.querySelector('.select-all-images').addEventListener('change',e=>{ selectedImages=e.target.checked?new Set(works.map(w=>w.id)):new Set(); renderAdmin() })
admin.querySelector('.bulk-delete').addEventListener('click',()=>{ if(!selectedImages.size||!confirm(`${selectedImages.size} ausgewählte Bilder wirklich löschen?`))return; const affected=new Set(works.filter(w=>selectedImages.has(w.id)).map(w=>w.artist)); works=works.filter(w=>!selectedImages.has(w.id)); selectedImages.clear(); affected.forEach(normalizeArtistImages); persist(); adminStatus.textContent='Die ausgewählten Bilder wurden gelöscht.' })
admin.querySelector('.admin-upload').addEventListener('submit',async e=>{ e.preventDefault(); const data=new FormData(e.currentTarget),files=[...e.currentTarget.elements.images.files],artist=data.get('artist'); if(!files.length)return; adminStatus.textContent=`0 von ${files.length} Bildern verarbeitet …`; let added=0; try{ for(const file of files){ const src=await optimizeImage(file); works.push({id:`w${Date.now()}-${added}`,artist,src}); added++; adminStatus.textContent=`${added} von ${files.length} Bildern verarbeitet …` } normalizeArtistImages(artist); persist(); e.currentTarget.reset(); adminStatus.textContent=`${added} Bilder wurden optimiert, umbenannt und hinzugefügt.` }catch{ normalizeArtistImages(artist); persist(); adminStatus.textContent=`${added} Bilder hinzugefügt. Eine Datei konnte nicht verarbeitet werden.` } })
renderAdmin()
if(new URLSearchParams(location.search).has('admin')) openAdmin()

const studioPosition = [49.0513305, 8.2654164]
const studioMap = L.map('studio-map', {zoomControl:false, scrollWheelZoom:false}).setView(studioPosition, 16)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom:19,
  attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
}).addTo(studioMap)
L.control.zoom({position:'bottomleft'}).addTo(studioMap)
const studioIcon = L.divIcon({
  className:'studio-map-marker',
  html:'<span><img src="/images/Logo-1.png" alt=""></span><i></i>',
  iconSize:[76,92], iconAnchor:[38,92]
})
L.marker(studioPosition,{icon:studioIcon,title:'Couple Ink Tattoo'}).addTo(studioMap).bindPopup('<strong>Couple Ink Tattoo</strong><br>Ottstraße 23A')

const form = document.querySelector('#tattoo-form'), stepEls = [...form.querySelectorAll('.form-step')], indicators = [...document.querySelectorAll('.steps span')]

// Native Select-Menüs werden je nach Betriebssystem fremd gestaltet. Diese
// zugängliche Oberfläche hält das echte Select für Formulare und Validierung synchron.
form.querySelectorAll('select').forEach(select => {
  select.classList.add('native-select')
  const shell = document.createElement('div')
  shell.className = 'ink-select'
  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'ink-select-trigger'
  trigger.setAttribute('aria-haspopup', 'listbox')
  trigger.setAttribute('aria-expanded', 'false')
  const list = document.createElement('div')
  list.className = 'ink-select-list'
  list.setAttribute('role', 'listbox')

  const sync = () => {
    const selected = select.options[select.selectedIndex]
    trigger.innerHTML = `<span>${selected.textContent}</span><i></i>`
    trigger.classList.toggle('placeholder', !select.value)
    list.querySelectorAll('[role="option"]').forEach((option, index) => {
      const active = index === select.selectedIndex
      option.classList.toggle('selected', active)
      option.setAttribute('aria-selected', String(active))
    })
  }
  const close = () => { shell.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false') }
  const open = () => { document.querySelectorAll('.ink-select.open').forEach(el => el !== shell && el.classList.remove('open')); shell.classList.add('open'); trigger.setAttribute('aria-expanded', 'true') }

  ;[...select.options].forEach((option, index) => {
    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'ink-select-option'
    item.setAttribute('role', 'option')
    item.innerHTML = `<span>${option.textContent}</span><b>✓</b>`
    item.addEventListener('click', () => { select.selectedIndex = index; select.dispatchEvent(new Event('change', {bubbles:true})); sync(); close(); trigger.focus() })
    list.append(item)
  })
  trigger.addEventListener('click', () => shell.classList.contains('open') ? close() : open())
  trigger.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','Home','End','Escape','Enter',' '].includes(e.key)) return
    e.preventDefault()
    if (e.key === 'Escape') return close()
    if (!shell.classList.contains('open')) return open()
    let next = select.selectedIndex
    if (e.key === 'ArrowDown') next = Math.min(select.options.length - 1, next + 1)
    if (e.key === 'ArrowUp') next = Math.max(0, next - 1)
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = select.options.length - 1
    if (e.key === 'Enter' || e.key === ' ') return list.children[next].click()
    list.children[next].focus()
  })
  select.after(shell)
  shell.append(trigger, list)
  sync()
})
document.addEventListener('click', e => { if (!e.target.closest('.ink-select')) document.querySelectorAll('.ink-select.open').forEach(el => { el.classList.remove('open'); el.querySelector('.ink-select-trigger').setAttribute('aria-expanded','false') }) })

let step = 0
function showStep(next){ stepEls[step].classList.remove('active'); indicators[step].classList.remove('active'); step = next; stepEls[step].classList.add('active'); indicators[step].classList.add('active'); form.scrollIntoView({behavior:'smooth', block:'center'}) }
form.querySelectorAll('.next-button').forEach(btn => btn.addEventListener('click', () => { const fields = [...stepEls[step].querySelectorAll('[required]')]; const invalid = fields.find(f => !f.checkValidity()); if(invalid){ invalid.reportValidity(); return } showStep(step + 1) }))
form.querySelectorAll('.back-button').forEach(btn => btn.addEventListener('click', () => showStep(step - 1)))
document.querySelector('#references').addEventListener('change', e => { const small = e.target.closest('.file-box').querySelector('small'); small.textContent = e.target.files.length ? `${e.target.files.length} Datei(en) ausgewählt` : 'JPG, PNG oder WEBP · max. 10 MB' })
form.addEventListener('submit', e => { e.preventDefault(); if(!form.checkValidity()){form.reportValidity(); return} stepEls[step].classList.remove('active'); document.querySelector('.form-success').classList.add('active'); form.reset() })
