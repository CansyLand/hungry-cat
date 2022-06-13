import { Item } from "./item"
import { Component, components } from "./components"
import { ScoreTextManager } from "./scoreTextManager"
import * as utils from '@dcl/ecs-scene-utils'
import { audioclips } from "./audioclips"

export class Npc extends Entity {
    
    name: string = "Fluffy"
    wantedItem: Item
    scoreManager: ScoreTextManager

    idle: AnimationState
    no: AnimationState
    wave: AnimationState
    yes: AnimationState


    constructor( 
        position: Vector3 = new Vector3(4,0,4),
        rotation: Quaternion = new Quaternion(0,0,0,0)
    ) {
        super()

        this.addComponent(new GLTFShape("models/Character.glb"))
        this.addComponent(new Transform({ 
            position: position,
            rotation: rotation
        }))


        // ANIMATIONS

        this.addComponent(new Animator())
        this.idle = new AnimationState("Idle", { layer: 0})
        this.idle.looping = true
        this.idle.weight = 0.5

        this.getComponent(Animator).addClip(this.idle)
 
        this.no = new AnimationState("No", { layer: 1})
        this.no.looping = false
        this.no.weight = 0.5
        this.getComponent(Animator).addClip(this.no)

        this.wave = new AnimationState("Wave", { layer: 1})
        this.wave.looping = false
        this.wave.weight = 0.5
        this.getComponent(Animator).addClip(this.wave)

        this.yes = new AnimationState("Yes", { layer: 1})
        this.yes.looping = false
        this.yes.weight = 0.5

        this.idle.play()

        const collider = new Entity()
        collider.addComponent(new BoxShape())
        collider.getComponent(BoxShape).visible = false
        collider.addComponent(new Transform())
        collider.getComponent(Transform).scale.set(0.7,0.7,0.7)
        collider.getComponent(Transform).position.set(0,2,0)
        collider.setParent(this)

        this.scoreManager = new ScoreTextManager(30)
        this.scoreManager.setParent(this)

        engine.addEntity(this)

        this.addComponent(
            new OnPointerDown(
                () => {                                       
                },
                {  
                    hoverText: 'Feed',
                    distance: 2
                }
            )
        )

        this.addComponent(
            new OnPointerUp(
                () => {                                       
                },
                {
                    hoverText: 'Feed',
                    distance: 2
                }
            )
        )

        // WANTED ITEM

        this.wantedItem = new Item("NonFood", new Vector3(-2.7,4.1,0), components[0], false, Quaternion.Euler(90,0,0))
        this.wantedItem.getComponent(Transform).scale.set(3,3,3)
        this.wantedItem.addComponent(new AudioSource(audioclips.click))
        this.wantedItem.setParent(this)
        
        

    }

    public wantNewComponent(component: Component) {
        // animation 
        this.playClick()

        this.delayedThinkAboutItem(100)
        this.delayedThinkAboutItem(200)
        this.delayedThinkAboutItem(300)
        this.delayedThinkAboutItem(400)
        this.delayedThinkAboutItem(500)
        this.delayedThinkAboutItem(600)
        this.delayedThinkAboutItem(800)
        this.delayedThinkAboutItem(1000)
        this.delayedThinkAboutItem(1250)
        this.delayedThinkAboutItem(1500)
        this.delayedThinkAboutItem(1750)

        // this is the wanted item
        this.delayedThinkAboutItem(2500, component)
 
    }

    private  delayedThinkAboutItem(delay:number, component?:Component) {
       let comp: Component
        if (component) {
            comp = component
        } else {
            comp = components[Math.floor(Math.random()*components.length)]
        }
       
        utils.setTimeout(delay, ()=>{
                this.wantedItem.component = comp
                this.wantedItem.addComponentOrReplace(comp.shape)
        })
    }

    public playAnimation(anim:string) {
        const as = new AnimationState(anim)
        as.looping = true
        as.play()
    }

    public feedDistance(feedDistance:number): void {
        this.addComponentOrReplace( new OnPointerUp(
            () => {                                       
            },
            {
                hoverText: 'Feed',
                distance: feedDistance
            }
        ))
        this.addComponentOrReplace(  new OnPointerDown(
            () => {                                       
            },
            {
                hoverText: 'Feed',
                distance: feedDistance
            }
        ))
    }

    private playClick() {
        this.wantedItem.getComponent(AudioSource).playing = true
    }

    public correctSound() {
        this.addComponentOrReplace(new AudioSource(audioclips.correct))
        this.getComponent(AudioSource).playing = true
    }

    public wrongSound() {
        this.addComponentOrReplace(new AudioSource(audioclips.wrong))
        this.getComponent(AudioSource).playing = true
    }

}