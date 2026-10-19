// Welcome screen shown before AR starts. Tapping Start asks for the microphone and location, then
// starts the scene (which asks for the camera), so no permission prompt interrupts placing,
// recording or sending.
import {requestLocation} from './location'

const requestMic = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true})
    stream.getTracks().forEach(track => track.stop())
  } catch (err) {
    // Denied or unavailable: videos are recorded without audio.
  }
}

const showIntro = () => new Promise<void>((resolve) => {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000; background: #1b1b1b; color: #fff;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; padding: 24px; box-sizing: border-box; text-align: center;
    font-family: Roboto, sans-serif;`

  overlay.innerHTML = `
    <div style="font-size: 64px; line-height: 1;">🥔</div>
    <h1 style="margin: 0; font-size: 26px;">Place a potato wherever you are!</h1>
    <p style="margin: 0; max-width: 340px; font-size: 16px; line-height: 1.5; color: #ccc;">
      Tap the ground to place your potato, then record a 5 second video and send it back.
    </p>
    <p style="margin: 0; max-width: 340px; font-size: 14px; line-height: 1.5; color: #999;">
      We'll ask for your <b>camera</b> (to see your surroundings), <b>microphone</b> (for sound
      in your video) and <b>location</b> (to put your potato on the map, roughly to your town).
    </p>`

  const startButton = document.createElement('button')
  startButton.textContent = 'Start'
  startButton.style.cssText = `
    border: none; border-radius: 6px; padding: 14px 48px; font-size: 20px; color: #fff;
    background: #cb1010;`

  startButton.addEventListener('click', async () => {
    startButton.disabled = true
    startButton.textContent = 'Starting…'
    // One prompt at a time, so they don't stack on top of each other
    await requestMic()
    await requestLocation()
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
  // wrapping it here delays starting the scene (and the camera prompt) until Start is tapped.
  // application isn't in the ecs type definitions, so reach it through window
  const {application} = (window as any).ecs
  const init = application.init.bind(application)
  application.init = (...args) => {
    showIntro().then(() => init(...args))
  }
}
