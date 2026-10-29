import loadingImage from './assets/potato-loading.jpg'
import {MONO, SERIF, SAFE_TOP, SAFE_BOTTOM} from './theme'

// Full-screen collage shown from the intro's Begin tap until the camera has found the ground
// (hidden by hide-on-ready.ts).
let overlay: HTMLElement | null = null

const showLoading = () => {
  overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10001; background: #3b3b3b url(${loadingImage})
    45% 50% / cover no-repeat; color: #fff; font-family: ${MONO}; transition: opacity 0.4s;`

  overlay.innerHTML = `
    <div style="position: absolute; top: ${SAFE_TOP}; left: 24px; font-size: 11px;
      letter-spacing: 0.02em; color: #e6e6e6;">fig. 1</div>
    <div style="position: absolute; left: 24px; right: 24px; bottom: ${SAFE_BOTTOM};
      display: flex; flex-direction: column; gap: 10px;">
      <div style="height: 1px; background: #fff; margin-bottom: 8px;"></div>
      <div style="font: italic 30px/1 ${SERIF};">finding the ground</div>
      <div style="font-size: 11px; letter-spacing: 0.02em; color: #e6e6e6;">opening camera</div>
    </div>`

  document.body.append(overlay)
}

const hideLoading = () => {
  const fading = overlay
  overlay = null
  if (!fading) {
    return
  }
  fading.style.opacity = '0'
  setTimeout(() => fading.remove(), 400)
}

export {
  showLoading,
  hideLoading,
}
