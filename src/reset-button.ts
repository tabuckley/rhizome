import * as ecs from '@8thwall/ecs'
import { Logo } from './logo'
import { OBJECT_PLACED_EVENT } from './tap-to-place'
import { getHud } from './hud'
import { walkerCount, forgetWalkers } from './random-model'

const logoQuery = ecs.defineQuery([Logo])

const CLEAR_TAPPED_EVENT = 'clear-tapped'

// Drives the HUD's "clear" button, and switches the HUD between the tap prompt and the count
ecs.registerComponent({
  name: 'reset-button',
  stateMachine: ({world, eid, defineState}) => {
    const hud = getHud()
    hud.clearButton.addEventListener('click', () => world.events.dispatch(eid, CLEAR_TAPPED_EVENT))
    const showCount = () => hud.showPlaced(walkerCount())

    defineState('nothing-placed')
      .initial()
      .onEvent(OBJECT_PLACED_EVENT, 'placed', {target: world.events.globalId})
      .onEnter(() => hud.showPrompt())

    defineState('placed')
      .onEnter(showCount)
      .listen(world.events.globalId, OBJECT_PLACED_EVENT, showCount)
      .onEvent(CLEAR_TAPPED_EVENT, 'resetting')

    defineState('resetting')
      .wait(1000, 'nothing-placed')
      .onEnter(() => {
      const tempVector = ecs.math.vec3.zero();
        logoQuery(world).forEach(e => {
          world.transform.getLocalPosition(e, tempVector)
          ecs.PositionAnimation.set(world, e, {
            duration: 1000,
            loop: false,
            fromX: tempVector.x,
            fromY: tempVector.y,
            fromZ: tempVector.z,
            toX: tempVector.x,
            toY: -4,
            toZ: tempVector.z,
            easeIn: true,
            easingFunction: 'Quadratic'
          })
        })
      })
      .onExit(() => {
        logoQuery(world).forEach(e => {
          world.deleteEntity(e)
        })
        forgetWalkers()
      })
  }
})
