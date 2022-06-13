import { Item } from "./item"
import { Component, components } from "./components"
import { sceneMessageBus } from "./messagebus"
import { ScoreTextManager, SimpleMove } from "./scoreTextManager"


export class Npc extends Entity {
    
    name: string = "Fluffy"
    wantedItem: Item
    scoreManager: ScoreTextManager

    idle: AnimationState
    // death: AnimationState
    // duck: AnimationState
    // hitReact: AnimationState
    no: AnimationState
    // punch: AnimationState
    wave: AnimationState
    yes: AnimationState


    constructor( 
        position: Vector3 = new Vector3(4,0,4),
        rotation: Quaternion = new Quaternion(0,0,0,0)
        //wantedComponent: Component

    ) {
        super()

        this.wantedItem = new Item("NonFood", new Vector3(-2.7,4.1,0), components[0], false, Quaternion.Euler(90,0,0))
        this.wantedItem.getComponent(Transform).scale.set(3,3,3)
        this.wantedItem.setParent(this)
        
        this.addComponent(new GLTFShape("models/Character.glb"))
        this.addComponent(new Transform({ 
            position: position,
            rotation: rotation
        }))
        // this.addComponent(new Billboard(false,true,false ))

        this.addComponent(new Animator())
        this.idle = new AnimationState("Idle", { layer: 0})
        this.idle.looping = true
        this.idle.weight = 0.5
        //this.death = new AnimationState("Death")
        //this.death.looping = true
        this.getComponent(Animator).addClip(this.idle)
        // this.duck = new AnimationState("Duck")
        // this.hitReact = new AnimationState("HitReact")
        this.no = new AnimationState("No", { layer: 1})
        this.no.looping = false
        this.no.weight = 0.5
        this.getComponent(Animator).addClip(this.no)
        // this.punch = new AnimationState("Punch")
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


    }

    public wantNewComponent(component: Component) {
        // animation 
        
        this.wantedItem.component = component
        this.wantedItem.addComponentOrReplace(component.shape)
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

    // public getHungryFor(component:FoodComponent): void {
    //     this.hungryFor.name = component.name
    //     this.hungryFor.addComponentOrReplace(component.shape)
    // }

    // public async feed(food: Food): Promise<void> {
    //     log("Cat: Mmmmh food!")

    //     // play thinkung animation
    //     // send item ID to server
    //     const res = await foodManager.checkItem(food) // {rightItem:boolean, newWantedItem, newItemReplacing the eaten one}
    //     // server responds true or false + new Realm list & wanted Items
    //     if (res.rightItem) {
    //         this.getHungryFor(foodComponents[res.wantedItems])
    //     } else {
    //         log("Cat: I dont want that!")
    //         this.getComponent(Transform).position = new Vector3(Math.random()*14+1,0,Math.random()*14+1)
    //     }



    //     if (food.name == this.hungryFor.name) {
    //         log("Cat: This is what I want")
    //         /
    //         this.getHungry()
    //     } else {
    //         log("Cat: I dont want that!")
    //         this.getComponent(Transform).position = new Vector3(Math.random()*14+1,0,Math.random()*14+1)
    //     }
    //     food.newIdentity(food)
    // }

  

}