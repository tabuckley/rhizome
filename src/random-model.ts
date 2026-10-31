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

// Every model is scaled to this height in the files' units (the potato file is a quarter the size
// of the rest), times the Model entity's scale in the prefab (.expanse.json)
const TARGET_HEIGHT = 1.9

// How much the models' textures are pushed apart from mid grey, and how much their colours are
// strengthened, so the detail isn't washed out by the scene's lighting (1 leaves them as they are)
const TEXTURE_CONTRAST = 1.4
const TEXTURE_SATURATION = 1.2

// Too many walkers at once crashes the app, so the oldest are removed past this. The collage
// models' morph targets take a lot of graphics memory each.
const MAX_WALKERS = 3

// Sent on the global target whenever a walker is added or removed, for the HUD's count
const WALKERS_CHANGED_EVENT = 'walkers-changed'

// Walkers in the scene, oldest first
const walkers: {eid: ecs.Eid, model: number, onLoaded: (event: any) => void}[] = []

// Height of a loaded model's meshes, in the file's units
const measureHeight = (model: any) => {
  let min = Infinity
  let max = -Infinity
  model.traverse((object: any) => {
    const {geometry} = object
    if (!geometry) {
      return
    }
    if (!geometry.boundingBox) {
      geometry.computeBoundingBox()
    }
    min = Math.min(min, geometry.boundingBox.min.y)
    max = Math.max(max, geometry.boundingBox.max.y)
  })
  return max - min
}

// Applies the texture contrast and saturation to every material in a loaded model, in the
// shader just after the texture is read. The curve is applied in sRGB so it looks even.
const boostContrast = (model: any) => {
  model.traverse((object: any) => {
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material: any) => {
      if (!material || material.userData.contrastBoosted) {
        return
      }
      material.userData.contrastBoosted = true
      material.onBeforeCompile = (shader: any) => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #include <map_fragment>
          {
            vec3 c = pow(max(diffuseColor.rgb, 0.0), vec3(1.0 / 2.2));
            c = (c - 0.5) * ${TEXTURE_CONTRAST.toFixed(3)} + 0.5;
            float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
            c = mix(vec3(luma), c, ${TEXTURE_SATURATION.toFixed(3)});
            diffuseColor.rgb = pow(clamp(c, 0.0, 1.0), vec3(2.2));
          }
        `)
      }
      material.customProgramCacheKey = () => 'contrast-boosted'
      material.needsUpdate = true
    })
  })
}

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
    const {url, animationClip} = MODELS[model]
    // The loaded model itself is scaled, not the entity, because the prefab's scale is applied to
    // the entity after add and overrides anything set here
    const onLoaded = (event: any) => {
      const loaded = event.data.model
      boostContrast(loaded)
      const height = measureHeight(loaded)
      if (height > 0) {
        loaded.scale.setScalar(TARGET_HEIGHT / height)
        world.three.notifyChanged(loaded)
      }
    }
    world.events.addListener(component.eid, ecs.events.GLTF_MODEL_LOADED, onLoaded)
    walkers.push({eid: component.eid, model, onLoaded})
    ecs.GltfModel.set(world, component.eid, {url, animationClip, loop: true})
    trimWalkers(world)
    world.events.dispatch(world.events.globalId, WALKERS_CHANGED_EVENT)
  },
  remove: (world, component) => {
    const i = walkers.findIndex(w => w.eid === component.eid)
    if (i !== -1) {
      world.events.removeListener(component.eid, ecs.events.GLTF_MODEL_LOADED, walkers[i].onLoaded)
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
