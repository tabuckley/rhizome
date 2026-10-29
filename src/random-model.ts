import * as ecs from '@8thwall/ecs'

import collage1 from './assets/collage1_walk_AR.glb'
import collage2 from './assets/collage2_walk_loop_AR.glb'
import collage4 from './assets/collage4_walk_20s_AR.glb'
import collage5 from './assets/collage5_walk_long_sides_AR.glb'
import potato from './assets/potato_walker_AR.glb'

// Each model paired with the name of its walk animation clip. size evens out the files: the
// collages are about 1.9 units tall but the potato only 0.48, so it is scaled up 4x
// (tap-to-place.ts applies it, see newestWalkerSize).
const MODELS = [
  {url: collage1, animationClip: 'RootCreature', size: 1},
  {url: collage2, animationClip: 'RootCreature', size: 1},
  {url: collage4, animationClip: 'RootCreature', size: 1},
  {url: collage5, animationClip: 'RootCreature', size: 1},
  {url: potato, animationClip: 'WalkTurnReturn', size: 4},
]

// Too many walkers at once crashes the app, so the oldest are removed past this. The collage
// models' morph targets take a lot of graphics memory each.
const MAX_WALKERS = 3

// Walkers in the scene, oldest first
const walkers: {eid: ecs.Eid, model: number}[] = []

// Picks a model that isn't already in the scene (random among those), each time an entity with
// this component is created
ecs.registerComponent({
  name: 'random-model',
  add: (world, component) => {
    const inScene = new Set(walkers.map(w => w.model))
    const unused = MODELS.map((_, i) => i).filter(i => !inScene.has(i))
    const choices = unused.length ? unused : MODELS.map((_, i) => i)
    const model = choices[Math.floor(Math.random() * choices.length)]
    walkers.push({eid: component.eid, model})
    const {url, animationClip} = MODELS[model]
    ecs.GltfModel.set(world, component.eid, {url, animationClip, loop: true})
  },
  remove: (world, component) => {
    const i = walkers.findIndex(w => w.eid === component.eid)
    if (i !== -1) {
      walkers.splice(i, 1)
    }
  },
})

// Deletes the oldest walkers until no more than MAX_WALKERS remain
const trimWalkers = (world: ecs.World) => {
  while (walkers.length > MAX_WALKERS) {
    const {eid} = walkers.shift()!
    world.deleteEntity(eid)
  }
}

const walkerCount = () => walkers.length

// The prefab's own scale overrides one set from add, so tap-to-place applies this to the placed
// entity (the model's parent) after creating it
const newestWalkerSize = () => (walkers.length ? MODELS[walkers[walkers.length - 1].model].size : 1)

// Clear deletes every walker at once, so forget them all rather than relying on each removal
const forgetWalkers = () => {
  walkers.length = 0
}

export {
  MAX_WALKERS,
  trimWalkers,
  walkerCount,
  newestWalkerSize,
  forgetWalkers,
}
