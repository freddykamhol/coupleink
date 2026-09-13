window.setTimeout(() => {
  const app = document.getElementById('app')
  if (app && !app.children.length && !app.textContent.trim()) {
    const message = document.createElement('main')
    message.className = 'startup-error'
    const heading = document.createElement('h1')
    heading.textContent = 'Website konnte nicht gestartet werden'
    const copy = document.createElement('p')
    copy.textContent = 'Das JavaScript-Bundle wurde nicht geladen oder ausgeführt.'
    message.append(heading, copy)
    app.append(message)
  }
}, 5000)
