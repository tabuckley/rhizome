import {MAX_WALKERS} from './random-model'
import {INK, PAPER, SERIF, MONO, SAFE_TOP, SAFE_BOTTOM, LABEL_STYLE} from './theme'

// Bars over the camera: a "tap the ground" prompt until something is placed, then a count with
// the Clear and Record buttons. record-button.ts and reset-button.ts drive it.
const COUNT_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six']

const BAR_STYLE = `
  position: absolute; left: 0; right: 0; background: ${PAPER}; color: ${INK};
  pointer-events: auto; box-sizing: border-box;`

const createHud = () => {
  // Only the bars take touches, so taps on the camera view still place things
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed; inset: 0; z-index: 100; pointer-events: none; font-family: ${MONO};`

  const topBar = document.createElement('div')
  topBar.style.cssText = `${BAR_STYLE} top: 0; border-bottom: 1px solid ${INK};
    padding: ${SAFE_TOP} 24px 14px;`

  const bottomBar = document.createElement('div')
  bottomBar.style.cssText = `${BAR_STYLE} bottom: 0; border-top: 1px solid ${INK};
    padding: 18px 24px ${SAFE_BOTTOM};`

  const prompt = document.createElement('div')
  prompt.textContent = 'it will arrive here'
  prompt.style.cssText = 'text-align: center; font-size: 11px; letter-spacing: 0.02em;'

  const controls = document.createElement('div')
  controls.style.cssText = `
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center;`

  const clearButton = document.createElement('button')
  clearButton.textContent = 'clear'
  clearButton.style.cssText = `
    justify-self: start; height: 44px; padding: 0; border: none; background: none; color: ${INK};
    font: 11px ${MONO}; letter-spacing: 0.02em; text-decoration: underline;
    text-underline-offset: 4px; -webkit-tap-highlight-color: transparent;`

  const recordButton = document.createElement('button')
  recordButton.setAttribute('aria-label', 'record five seconds')
  recordButton.style.cssText = `
    justify-self: center; width: 76px; height: 76px; border-radius: 50%; border: 1px solid ${INK};
    background: none; padding: 0; display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;`
  recordButton.innerHTML = `
    <span style="width: 60px; height: 60px; border-radius: 50%; background: ${INK};"></span>`

  const length = document.createElement('span')
  length.textContent = '5 sec'
  length.style.cssText = `justify-self: end; ${LABEL_STYLE}`

  controls.append(clearButton, recordButton, length)
  bottomBar.append(prompt, controls)
  container.append(topBar, bottomBar)
  document.body.append(container)

  const showPrompt = () => {
    topBar.innerHTML = `
      <div style="${LABEL_STYLE}">step one</div>
      <div style="font: 34px/1 ${SERIF}; margin-top: 8px;">tap the ground.</div>`
    prompt.style.display = 'block'
    controls.style.display = 'none'
  }

  const showPlaced = (count: number) => {
    const verb = count === 1 ? 'has' : 'have'
    topBar.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span style="font: 26px ${SERIF};">${COUNT_WORDS[count] ?? count} ${verb} arrived.</span>
        <span style="${LABEL_STYLE}">${count} / ${MAX_WALKERS}</span>
      </div>`
    prompt.style.display = 'none'
    controls.style.display = 'grid'
  }

  showPrompt()

  return {
    clearButton,
    recordButton,
    showPrompt,
    showPlaced,
    hide: () => { container.style.display = 'none' },
    show: () => { container.style.display = 'block' },
  }
}

let hud: ReturnType<typeof createHud> | null = null

// Created on first use, so it only appears once the scene is running
const getHud = () => {
  if (!hud) {
    hud = createHud()
  }
  return hud
}

export {
  getHud,
}
