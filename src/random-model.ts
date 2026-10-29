import * as ecs from '@8thwall/ecs'

import collage1 from './assets/collage1_walk_AR.glb'
import collage2 from './assets/collage2_walk_loop_AR.glb'
import collage4 from './assets/collage4_walk_20s_AR.glb'
import collage5 from './assets/collage5_walk_long_sides_AR.glb'
import potato from './assets/potato_walker_AR.glb'

// Each model paired with the name of its walk animation clip
const MODELS = [
  {url: collage1, animationClip: 'RootCreature'},
  {url: collage2, animationClip: 'RootCreature'},
  {url: collage4, animationClip: 'RootCreature'},
  {url: collage5, animationClip: 'RootCreature'},
  {url: potato, animationClip: 'WalkTurnReturn'},
]

// Too many walkers at once crashes the app, so the oldest are removed past this
const MAX_WALKERS = 4

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

export {
  trimWalkers,
}
