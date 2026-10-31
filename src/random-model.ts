import * as ecs from '@8thwall/ecs'

import collage1 from './assets/collage1_walk_AR.glb'
import collage2 from './assets/collage2_walk_loop_AR.glb'
import collage4 from './assets/collage4_walk_20s_AR.glb'
import collage5 from './assets/collage5_walk_long_sides_AR.glb'
import potato from './assets/potato_walker_AR.glb'

// Each model paired with the name of its walk animation clip and its height in the file, so
// they can all be scaled to the same height (the potato file is a quarter the size of the rest)
const MODELS = [
  {url: collage1, animationClip: 'RootCreature', height: 1.90},
  {url: collage2, animationClip: 'RootCreature', height: 1.90},
  {url: collage4, animationClip: 'RootCreature', height: 1.81},
  {url: collage5, animationClip: 'RootCreature', height: 1.44},
  {url: potato, animationClip: 'WalkTurnReturn', height: 0.48},
]

// Every model is scaled to this height in the files' units, times the Model entity's scale in
// the prefab (.expanse.json)
const TARGET_HEIGHT = 1.9
const PREFAB_SCALE = 0.527

// Too many walkers at once crashes the app, so the oldest are removed past this. The collage
// models' morph targets take a lot of graphics memory each.
const MAX_WALKERS = 3

// Sent on the global target whenever a walker is added or removed, for the HUD's count
const WALKERS_CHANGED_EVENT = 'walkers-changed'

// Walkers in the scene, oldest first
const walkers: {eid: ecs.Eid, model: number, scale: number}[] = []

// Deletes the oldest walkers until no more than MAX_WALKERS remain
const trimWalkers = (world: ecs.World) => {
  while (walkers.length > MAX_WALKERS) {
    const {eid} = walkers.shift()!
    world.deleteEntity(eid)
  }
}

// Picks a model that isn't already in the scene (random among those), each time an entity with
// this component is created. The cap is applied here rather than where the tap is handled,
// because this runs after the tap handler has returned.
ecs.registerComponent({
  name: 'random-model',
  add: (world, component) => {
    const inScene = new Set(walkers.map(w => w.model))
    const unused = MODELS.map((_, i) => i).filter(i => !inScene.has(i))
    const choices = unused.length ? unused : MODELS.map((_, i) => i)
    const model = choices[Math.floor(Math.random() * choices.length)]
    const {url, animationClip, height} = MODELS[model]
    walkers.push({eid: component.eid, model, scale: PREFAB_SCALE * TARGET_HEIGHT / height})
    ecs.GltfModel.set(world, component.eid, {url, animationClip, loop: true})
    trimWalkers(world)
    world.events.dispatch(world.events.globalId, WALKERS_CHANGED_EVENT)
  },
  // The prefab's scale is applied after add, so the model's own scale is kept here instead
  tick: (world, component) => {
    const walker = walkers.find(w => w.eid === component.eid)
    if (walker && ecs.Scale.get(world, component.eid).x !== walker.scale) {
      ecs.Scale.set(world, component.eid, {x: walker.scale, y: walker.scale, z: walker.scale})
    }
  },
  remove: (world, component) => {
    const i = walkers.findIndex(w => w.eid === component.eid)
    if (i !== -1) {
      walkers.splice(i, 1)
      world.events.dispatch(world.events.globalId, WALKERS_CHANGED_EVENT)
    }
  },
})

const walkerCount = () => walkers.length

// Clear deletes every walker at once, so forget them all rather than relying on each removal
const forgetWalkers = () => {
  walkers.length = 0
}

export {
  MAX_WALKERS,
  WALKERS_CHANGED_EVENT,
  walkerCount,
  forgetWalkers,
}
