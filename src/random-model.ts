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

// Picks one of the walkers at random each time an entity with this component is created
ecs.registerComponent({
  name: 'random-model',
  add: (world, component) => {
    const {url, animationClip} = MODELS[Math.floor(Math.random() * MODELS.length)]
    ecs.GltfModel.set(world, component.eid, {url, animationClip, loop: true})
  },
})
