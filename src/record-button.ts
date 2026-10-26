import * as ecs from '@8thwall/ecs'
import {uploadVideo} from './upload'

// Recording length and end card are configured in app.js (XR8.MediaRecorder.configure)
const RECORD_SECONDS = 5

const BUTTON_STYLE = `
  border: none; border-radius: 6px; padding: 12px 24px; font-size: 18px; color: #fff;`

const makeButton = (label: string, background: string) => {
  const button = document.createElement('button')
  button.textContent = label
  button.style.cssText = `${BUTTON_STYLE} background: ${background};`
  return button
}

// DOM overlays aren't drawn into the recording, so this countdown won't appear in the video.
const showRecordingIndicator = () => {
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 10000;
    background: rgba(0,0,0,0.6); color: #fff; padding: 8px 16px; border-radius: 20px;
    font: 18px Roboto, sans-serif; display: flex; align-items: center; gap: 8px;`
  const dot = '<span style="width:12px;height:12px;border-radius:50%;background:#e00"></span>'
  let remaining = RECORD_SECONDS
  const render = () => {
    indicator.innerHTML = remaining > 0 ? `${dot} Recording ${remaining}s` : 'Processing…'
  }
  render()
  const interval = setInterval(() => {
    remaining = Math.max(0, remaining - 1)
    render()
  }, 1000)
  document.body.append(indicator)
  return () => {
    clearInterval(interval)
    indicator.remove()
  }
}

// Shows the recorded clip with a name field and Send / Retake buttons. Send uploads the clip.
const showPreview = (blob: Blob, onClose: () => void) => {
  const url = URL.createObjectURL(blob)

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.85);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; padding: 16px; box-sizing: border-box; font-family: Roboto, sans-serif;`

  const video = document.createElement('video')
  video.src = url
  video.controls = true
  video.autoplay = true
  video.loop = true
  video.playsInline = true
  video.style.cssText = 'max-width: 100%; max-height: 70vh; border-radius: 8px;'

  const close = () => {
    overlay.remove()
    URL.revokeObjectURL(url)
    onClose()
  }

  const nameInput = document.createElement('input')
  nameInput.placeholder = 'Your name / town (optional)'
  nameInput.maxLength = 40
  nameInput.style.cssText = `
    width: min(100%, 320px); box-sizing: border-box; padding: 10px 12px; font-size: 16px;
    border: none; border-radius: 6px;`

  const status = document.createElement('div')
  status.style.cssText = 'color: #fff; font-size: 16px; min-height: 20px; text-align: center;'

  const sendButton = makeButton('Send', '#cb1010')
  const closeButton = makeButton('Retake', '#555')

  sendButton.addEventListener('click', async () => {
    sendButton.disabled = true
    closeButton.disabled = true
    nameInput.disabled = true
    status.textContent = 'Sending…'
    try {
      await uploadVideo(blob, nameInput.value)
      status.textContent = 'Sent! Thank you 🥔'
      sendButton.remove()
      closeButton.textContent = 'Done'
    } catch (err) {
      console.error(err)
      status.textContent = 'Couldn\'t send. Check your connection and try again.'
      sendButton.disabled = false
      nameInput.disabled = false
    }
    closeButton.disabled = false
  })

  closeButton.addEventListener('click', close)

  const buttons = document.createElement('div')
  buttons.style.cssText = 'display: flex; gap: 12px;'
  buttons.append(sendButton, closeButton)

  overlay.append(video, nameInput, buttons, status)
  document.body.append(overlay)
}

ecs.registerComponent({
  name: 'record-button',
  schema: {
    // UI entity to hide while recording, so the buttons don't appear in the video
    hideWhileRecording: 'eid',
  },
  stateMachine: ({world, eid, schemaAttribute, defineState}) => {
    let hideIndicator: (() => void) | null = null

    const getUi = () => {
      const uiEid = schemaAttribute.get(eid).hideWhileRecording
      return world.getEntity(uiEid || eid)
    }

    const finish = () => {
      hideIndicator?.()
      hideIndicator = null
    }

    defineState('idle').initial().onEvent(ecs.input.UI_CLICK, 'recording')

    defineState('recording')
      .onEnter(() => {
        getUi().hide()
        hideIndicator = showRecordingIndicator()
        world.xr.startMediaRecorder()
      })
      .listen(world.events.globalId, ecs.events.RECORDER_VIDEO_READY, (e) => {
        finish()
        showPreview(e.data.videoBlob, () => getUi().show())
        world.events.dispatch(eid, 'record-done')
      })
      .listen(world.events.globalId, ecs.events.RECORDER_VIDEO_ERROR, (e) => {
        console.error('Recording failed', e.data)
        finish()
        getUi().show()
        world.events.dispatch(eid, 'record-done')
      })
      .onEvent('record-done', 'idle')
  },
})
