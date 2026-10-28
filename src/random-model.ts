import * as ecs from '@8thwall/ecs'

import collage1 from './assets/collage1_walk_AR.glb'
import collage2 from './assets/collage2_walk_loop_AR.glb'
import collage4 from './assets/collage4_walk_20s_AR.glb'
import collage5 from './assets/collage5_walk_long_sides_AR.glb'

// Every model shares this animation clip name
const MODELS = [collage1, collage2, collage4, collage5]
const ANIMATION_CLIP = 'RootCreature'

// Picks one of the walkers at random each time an entity with this component is created
ecs.registerComponent({
  name: 'random-model',
  add: (world, component) => {
    const url = MODELS[Math.floor(Math.random() * MODELS.length)]
    ecs.GltfModel.set(world, component.eid, {url, animationClip: ANIMATION_CLIP, loop: true})
  },
})
