export type Component = {
    name: string,
    shape: GLTFShape
}

export const components = [
    {name:'Apple', shape: new GLTFShape('models/Food/Apple_01.glb')},
    {name:'Bananas', shape: new GLTFShape('models/Food/Bananas_01.glb')},
    {name:'Bone', shape: new GLTFShape('models/Food/BonesSmall_01.glb')},
    {name:'Coco', shape: new GLTFShape('models/Food/Coco_02.glb')},
    {name:'Fish', shape: new GLTFShape('models/Food/Fish_01.glb')},
    {name:'Fish', shape: new GLTFShape('models/Food/Fish_02.glb')},
    {name:'Fish', shape: new GLTFShape('models/Food/Fish_03.glb')},
    {name:'Fish', shape: new GLTFShape('models/Food/Fish_04.glb')},
    {name:'Fish Skeleton', shape: new GLTFShape('models/Food/FishSkeleton_01.glb')},
    {name:'Starfish', shape: new GLTFShape('models/Food/Starfish_01.glb')},
    {name:'Lemon', shape: new GLTFShape('models/Food/Lemon_01.glb')},
    {name:'Pineapple', shape: new GLTFShape('models/Food/Pineapple_01.glb')},
    {name:'Tomato', shape: new GLTFShape('models/Food/Tomato_01.glb')},
    {name:'Watermelon', shape: new GLTFShape('models/Food/Watermelon_01.glb')}
]