import homeImage from './assets/potato-home.jpg'
import {showLoading} from './loading'
import {
  INK, MUTED, BODY, RULE, SERIF, LABEL_STYLE, PRIMARY_BUTTON_STYLE, SCREEN_STYLE, makeButton,
} from './theme'

// Welcome screen shown before AR starts. Tapping Begin asks for every permission up front, so
// 8th Wall finds them already granted and no prompt interrupts placing, recording or sending.
// iOS only: motion sensors need permission from a user gesture, so this must be the first thing
// the Begin tap does. Granting it here skips 8th Wall's own "tap to allow motion" screen.
const requestMotion = () => {
  const requests = [window.DeviceMotionEvent, window.DeviceOrientationEvent]
    .map(event => (event as any)?.requestPermission?.().catch(() => {}))
  return Promise.all(requests)
}

// Camera and microphone in one getUserMedia call show a single combined prompt.
const requestCameraAndMic = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    stream.getTracks().forEach(track => track.stop())
  } catch (err) {
    // Mic denied or missing: 8th Wall still asks for the camera alone, videos have no audio.
  }
}

const PERMISSIONS = [
  ['camera', 'to see where you are'],
  ['microphone', 'to hear it'],
  ['motion', 'to find the ground'],
]

const showIntro = () => new Promise<void>((resolve) => {
  const now = new Date()
  const weekday = now.toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase()
  const date = now.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}).toLowerCase()

  const overlay = document.createElement('div')
  overlay.style.cssText = SCREEN_STYLE

  const rows = PERMISSIONS.map(([name, reason], i) => `
    <div style="display: flex; justify-content: space-between; gap: 12px; padding: 10px 0;
      border-top: 1px solid ${RULE};${i === PERMISSIONS.length - 1 ? ` border-bottom: 1px solid ${RULE};` : ''}">
      <span>${name}</span><span style="color: ${MUTED}; text-align: right;">${reason}</span>
    </div>`).join('')

  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; ${LABEL_STYLE}">
      <span>${weekday}</span><span>${date}</span>
    </div>
    <div style="height: 1px; background: ${INK}; margin-top: 12px; flex-shrink: 0;"></div>
    <img src="${homeImage}" alt="" style="height: min(302px, 34vh); width: auto; align-self: center;
      display: block; flex-shrink: 0; margin: 14px 0;">
    <h1 style="margin: 0; font: 38px/1.02 ${SERIF}; letter-spacing: -0.01em;">
      put down roots, and form a small rhizome.</h1>
    <p style="margin: 14px 0 0; font-size: 13px; line-height: 1.6; color: ${BODY};">
      tap the ground to place a potato. record five seconds of its visit and send it back.</p>
    <div style="margin-top: auto; padding-top: 24px; font-size: 12px; letter-spacing: 0.02em;">
      <div style="${LABEL_STYLE} padding-bottom: 10px;">we will ask for</div>
      ${rows}
    </div>`

  const startButton = makeButton('begin', PRIMARY_BUTTON_STYLE)
  startButton.style.cssText += 'margin-top: 24px; flex-shrink: 0;'

  startButton.addEventListener('click', async () => {
    const motion = requestMotion()
    startButton.disabled = true
    startButton.textContent = 'starting…'
    // One prompt at a time, so they don't stack on top of each other
    await motion
    await requestCameraAndMic()
    // The loading screen goes up first so the camera doesn't flash between the two
    showLoading()
    overlay.remove()
    resolve()
  })

  overlay.append(startButton)
  document.body.append(overlay)
})

// Skip the intro inside the 8th Wall editor and on desktop (which shows the "open on your
// phone" landing page instead).
const isEditor = window.location.href.includes('liveSyncMode')
const isTouchDevice = navigator.maxTouchPoints > 0

if (!isEditor && isTouchDevice) {
  // The generated entry calls ecs.application.init(scene) after all src files have run, so
  // wrapping it here delays starting the scene (and the camera prompt) until Begin is tapped.
  // application isn't in the ecs type definitions, so reach it through window
  const {application} = (window as any).ecs
  const init = application.init.bind(application)
  application.init = (...args) => {
    showIntro().then(() => init(...args))
  }
}
