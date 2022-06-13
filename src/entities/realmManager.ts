
import { Realm } from "@decentraland/EnvironmentAPI"
import { fireBaseServer } from "./firebase"
import { components } from "./components"
import { Player } from "./player"
import { Item } from "./item"
import { UserData } from "@decentraland/Identity"


type sRealm = {
    items: sItem[],
    wantedComponentID: number,
    round: number,
}

export type sItem = {
    itemID: string,
    componentID: number,
    x: number,
    z: number,
    y: number
}

export type NewItemPosition = {
    userID: string | undefined,
    itemID: string,
    position: ReadOnlyVector3,
    rotation: ReadOnlyQuaternion
  }

export type DeliverResponse = {
    success: boolean,
    isRightItem: boolean,
    wantedComponentID: number,
    scoreReward: number,
    oldItemID: string,
    newItemIdentity: sItem
}

const failedResponse: DeliverResponse = {
    success: false,
    isRightItem: false,
    scoreReward: 0,
    wantedComponentID: 0,
    oldItemID: "",
    newItemIdentity: {
        itemID: "0",
        componentID: 0,
        x: 0,
        z: 0,
        y: 0
    }}

export class RealmManager extends Entity {
    
    items: Item[] = []
    realm: Realm
    sRealm?: sRealm 

    constructor( 
        realm: Realm
    ) {
        super()

        this.realm = realm

        this.spawn()   
    }
 
    public async initRealm(): Promise<boolean> {

        this.items = [] 

        try { // to load scene data from server
        
            this.sRealm = await this.getRealmState(this.realm.displayName)
            if ( this.sRealm ) 
                this.addItemsToScene(this.sRealm)
                
            return true
            
        } catch (err) {
            log("Could not load items from server")
            log("initRealm()");log(err)
            return false
        }        

    }

    // loads current state from server
    public async getRealmState(realm: string): Promise<any>{
        const url = fireBaseServer + "/getrealmstate?realm="+realm
        try {
            let response = await fetch(url)
            let data = await response.json() as sRealm

            return data

          } catch (err) {
            log('error fetching from server ', url) 
          }
    }

    public addItemsToScene(sRealm: sRealm) {
        sRealm.items.forEach(e => {
            const pos = new Vector3(e.x, e.y, e.z)
            const component = components[e.componentID]
            const entity = new Item(e.itemID, pos, component)
            entity.setParent(this)
            this.items.push(entity)
        })
    }

    public async updatePosition(item: Item) {
        const pos = item.getComponent(Transform).position
        let url = fireBaseServer + "/updatePosition?"
            url += "&realm=" + this.realm.displayName
            url += "&itemID=" + item.itemID
            url += "&x=" + pos.x
            url += "&y=" + pos.y
            url += "&z=" + pos.z

        try {
            let response = await fetch(url)
            let data = await response.json() 
            return data
        } catch (err) {
            log('error fetching from server ', url)
            log("updatePosition()");log(err) 
        }
    }

    public async deliverItem(item: Item, player: Player): Promise<DeliverResponse> {
            
        let url = fireBaseServer + "/deliveritem?"
            url += "itemID=" + item.itemID
            url += "&pubKey=" + player.userData?.publicKey
            url += "&realm=" + this.realm.displayName

        try {
            log(url)
            let response = await fetch(url)
            let data = await response.json() as DeliverResponse
            log("response:")
            log("Is right item: " + data.isRightItem)
            log("Old item ID: " + data.oldItemID)
            log("Wanted componentID: " + data.wantedComponentID)
            log("newItemID " + data.newItemIdentity.itemID)
            log("newItemCompID: " + data.newItemIdentity.componentID)
            return data

        } catch (err) {
            log('error fetching from server ', url)
            log("deliverItem()");log(err)
            return failedResponse
        }  
    }

    public spawn(): void {
        engine.addEntity(this)
    }

    public destroy(): void {
        engine.removeEntity(this)
    }


    // public attachItemToAvatar(avatarID: string, itemID: string): void { // depricated
    //     const item = this.getItemByID(itemID)
    //     item.addComponentOrReplace(
    //         new AttachToAvatar({
    //           avatarId: avatarID,
    //           anchorPointId: AttachToAvatarAnchorPointId.NameTag,
    //         })
    //       )
    //     const pos = item.getComponent(Transform).position
    //     pos.x += 1
    //     pos.y -= 0.3
    // }

    public detachItemFromAvatar(data: NewItemPosition) {
        const item = this.getItemByID(data.itemID)
        item.isGrabbed = false
        item.setParent(this)
        item.addComponentOrReplace(
            new Transform({
                position: new Vector3(
                    data.position.x,
                    data.position.y,
                    data.position.z),
                rotation: new Quaternion(
                    data.rotation.w,
                    data.rotation.x,
                    data.rotation.y,
                    data.rotation.z)
            })
        )
    }

    public getItemByID(itemID: string): Item {
        let item: Item = this.items[0]
        this.items.forEach(element => {
          if (element.itemID == itemID)  
            item = element
        })
        return item
    }

    public newItemIdentity(oldItemID: string, newItemIdentity: sItem) {
        const item = this.getItemByID(oldItemID)
        item.setParent(this)    // detaching from avatar
        item.newIdentity(newItemIdentity)
    }

    public updateGrabDistance(grabDistance:number): void {
        this.items.forEach(item => {
            item.updateGrabDistance(grabDistance) 
        });
    }

    public correctErrors(): void {
        this.items.forEach(item => {
            item.correctError()         
        })
    }
/*
    public isGrabbed(): boolean {
        let isGrabbed = false
        this.items.forEach(item => {
            if(item.isGrabbed)
                isGrabbed = true
        })
        return isGrabbed
    }

    public getGrabbed(): Food | null {
        let food: Food | null = null
        this.items.forEach(item => {
            if(item.isGrabbed)
                food = item
        })
        return food
    }

    public getRandomItem(): FoodComponent {
        const randomPositionInList = Math.floor(Math.random() * this.items.length)
        const item = this.items[randomPositionInList]
        const shape = item.getComponent(GLTFShape)
        return {name: item.name, shape: shape }
    }

    public getWantedComponent(index: number): FoodComponent {
        return foodComponents[index]
    }

    public async checkItem(item:Food) {
        const itemID = "&itemID=" + item.ID
        const displayName = "&player=" + player.userData?.displayName
        const publicKey = "&pubKey=" + player.userData?.publicKey
        const url = fireBaseServer + "/checkItem?realm=" + player.realm + itemID + displayName + publicKey

        try {
            let response = await fetch(url)
            let data = await response.json() //  {rightItem:boolean, newWantedItemCompID, newItemReplacing the eaten one}
            return data
          } catch {
            log('error fetching from server ', url)
          }

    }

    private getIdByName(name:string): number {
        let ID:number = 0
        for(let i=0; i<foodComponents.length; i++) {
            if(foodComponents[i].name==name) {
                ID = i
                break
            }
        }
        return ID
    }
*/
}


