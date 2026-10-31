// Counts visits and each step of the experience with GoatCounter (goatcounter.com), which also
// records each visitor's country and region. It sets no cookies and doesn't count localhost.
// Fill in the code from your GoatCounter site address (the "potato" in potato.goatcounter.com);
// while it's empty nothing is loaded or counted.
const GOATCOUNTER_CODE = 'potato-patata'

// Steps counted before the script has loaded, sent once it has
const pending: string[] = []

const send = (step: string) => {
  (window as any).goatcounter.count({path: step, title: step, event: true})
}

if (GOATCOUNTER_CODE) {
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://gc.zgo.at/count.js'
  script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`
  script.addEventListener('load', () => pending.splice(0).forEach(send))
  document.head.append(script)
}

// Counts one step, such as 'begin' or 'sent', shown under Events in the GoatCounter dashboard
const trackStep = (step: string) => {
  if (!GOATCOUNTER_CODE) {
    return
  }
  if ((window as any).goatcounter?.count) {
    send(step)
  } else {
    pending.push(step)
  }
}

export {
  trackStep,
}
