import * as ecs from '@8thwall/ecs'
import endImage from './assets/potato-end.jpg'
import {getHud} from './hud'
import {
  INK, PAPER, MUTED, BODY, CAMERA_STANDIN, SERIF, MONO, LABEL_STYLE, PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE, SCREEN_STYLE, makeButton,
} from './theme'
import {uploadVideo} from './upload'

// Recording length and end card are configured in app.js (XR8.MediaRecorder.configure)
const RECORD_SECONDS = 5

const RECORD_TAPPED_EVENT = 'record-tapped'

// DOM overlays aren't drawn into the recording, so this progress line and timer won't appear in
// the video.
const showRecordingIndicator = () => {
  const progress = document.createElement('div')
  progress.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 10000;
    background: ${PAPER};`
  const fill = document.createElement('div')
  fill.style.cssText = `height: 100%; width: 0; background: ${INK};
    transition: width ${RECORD_SECONDS}s linear;`
  progress.append(fill)

  const tag = document.createElement('div')
  tag.style.cssText = `
    position: fixed; top: calc(env(safe-area-inset-top) + 20px); left: 50%;
    transform: translateX(-50%); z-index: 10000; background: ${PAPER}; color: ${INK};
    border: 1px solid ${INK}; padding: 8px 14px; display: flex; align-items: center; gap: 10px;
    font: 11px ${MONO}; letter-spacing: 0.02em; white-space: nowrap;`
  const dot = `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${INK};"></span>`
  let elapsed = 0
  const render = () => {
    tag.innerHTML = elapsed < RECORD_SECONDS
      ? `${dot}<span>rec</span><span style="color: ${MUTED};">00:0${elapsed}</span>`
      : '<span>processing…</span>'
  }
  render()
  const interval = setInterval(() => {
    elapsed = Math.min(RECORD_SECONDS, elapsed + 1)
    render()
  }, 1000)

  document.body.append(progress, tag)
  // Read the layout first so the bar animates from empty instead of appearing full
  fill.getBoundingClientRect()
  fill.style.width = '100%'

  return () => {
    clearInterval(interval)
    progress.remove()
    tag.remove()
  }
}

// Shown once a clip is sent. Done returns to the camera.
const showSent = (onDone: () => void) => {
  const overlay = document.createElement('div')
  overlay.style.cssText = SCREEN_STYLE

  overlay.innerHTML = `
    <div style="${LABEL_STYLE}">sent · ${RECORD_SECONDS} sec</div>
    <div style="height: 1px; background: ${INK}; margin-top: 12px;"></div>
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;
      gap: 24px; padding: 24px 0;">
      <img src="${endImage}" alt="" style="height: min(442px, 44vh); width: auto;
        align-self: center; display: block;">
      <h1 style="margin: 0; font: 56px/1 ${SERIF};">received.</h1>
      <p style="margin: 0; font: italic 22px/1.3 ${SERIF}; color: ${BODY};">
        it will remember where you were.</p>
    </div>`

  const doneButton = makeButton('done', SECONDARY_BUTTON_STYLE)
  doneButton.style.flexShrink = '0'
  doneButton.addEventListener('click', () => {
    overlay.remove()
    onDone()
  })

  overlay.append(doneButton)
  document.body.append(overlay)
}

// Shows the recorded clip with a name field and Retake / Send buttons. Send uploads the clip.
const showPreview = (blob: Blob, onClose: () => void) => {
  const url = URL.createObjectURL(blob)

  const overlay = document.createElement('div')
  overlay.style.cssText = `${SCREEN_STYLE} gap: 20px;`

  const header = document.createElement('div')
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: baseline;'
  header.innerHTML = `
    <span style="font: 30px ${SERIF};">your visit.</span>
    <span style="${LABEL_STYLE}">0:0${RECORD_SECONDS}</span>`

  const video = document.createElement('video')
  video.src = url
  video.controls = true
  video.autoplay = true
  video.loop = true
  video.playsInline = true
  video.style.cssText = `
    flex: 1 1 0; min-height: 160px; width: 100%; object-fit: cover; box-sizing: border-box;
    border: 1px solid ${INK}; background: ${CAMERA_STANDIN};`

  const close = () => {
    overlay.remove()
    URL.revokeObjectURL(url)
    onClose()
  }

  const field = document.createElement('div')
  field.style.cssText = 'display: flex; flex-direction: column; gap: 6px;'
  field.innerHTML = `<label for="sender-name" style="${LABEL_STYLE}">who sent this (optional)</label>`

  const nameInput = document.createElement('input')
  nameInput.id = 'sender-name'
  nameInput.placeholder = 'name, town'
  nameInput.maxLength = 40
  nameInput.style.cssText = `
    height: 44px; border: none; border-bottom: 1px solid ${INK}; border-radius: 0; padding: 0;
    background: none; color: ${INK}; font: 22px ${SERIF}; outline: none;`
  field.append(nameInput)

  const status = document.createElement('div')
  status.style.cssText = `${LABEL_STYLE} min-height: 16px; text-align: center;`

  const closeButton = makeButton('retake', SECONDARY_BUTTON_STYLE)
  const sendButton = makeButton('send', PRIMARY_BUTTON_STYLE)

  sendButton.addEventListener('click', async () => {
    sendButton.disabled = true
    closeButton.disabled = true
    nameInput.disabled = true
    sendButton.textContent = 'sending…'
    status.textContent = ''
    try {
      await uploadVideo(blob, nameInput.value)
      overlay.remove()
      URL.revokeObjectURL(url)
      showSent(onClose)
    } catch (err) {
      console.error(err)
      status.textContent = 'couldn\'t send. check your connection and try again.'
      sendButton.textContent = 'send'
      sendButton.disabled = false
      closeButton.disabled = false
      nameInput.disabled = false
    }
  })

  closeButton.addEventListener('click', close)

  const buttons = document.createElement('div')
  buttons.style.cssText = 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;'
  buttons.append(closeButton, sendButton)

  overlay.append(header, video, field, buttons, status)
  document.body.append(overlay)
}

// Drives the HUD's record button. The HUD is hidden while recording so it stays out of the way.
ecs.registerComponent({
  name: 'record-button',
  stateMachine: ({world, eid, defineState}) => {
    const hud = getHud()
    hud.recordButton.addEventListener('click', () => world.events.dispatch(eid, RECORD_TAPPED_EVENT))
    let hideIndicator: (() => void) | null = null

    const finish = () => {
      hideIndicator?.()
      hideIndicator = null
    }

    defineState('idle').initial().onEvent(RECORD_TAPPED_EVENT, 'recording')

    defineState('recording')
      .onEnter(() => {
        hud.hide()
        hideIndicator = showRecordingIndicator()
        world.xr.startMediaRecorder()
      })
      .listen(world.events.globalId, ecs.events.RECORDER_VIDEO_READY, (e) => {
        finish()
        showPreview(e.data.videoBlob, () => hud.show())
        world.events.dispatch(eid, 'record-done')
      })
      .listen(world.events.globalId, ecs.events.RECORDER_VIDEO_ERROR, (e) => {
        console.error('Recording failed', e.data)
        finish()
        hud.show()
        world.events.dispatch(eid, 'record-done')
      })
      .onEvent('record-done', 'idle')
  },
})
