import { logger } from "firebase-functions/v1"
import { db } from "./firestore"
import { leaderboard } from "./leaderboard"

const GAME_REALMS = "Game-Realms"

type sItem = {
  itemID: string,
  componentID: number,
  x: number,
  y: number,
  z: number
}

type sRealm = {
  items: sItem[],
  wantedComponentID: number,
  round: number
}

type DeliveryResponse = {
  success: boolean,
  isRightItem: boolean,
  wantedComponentID: number,
  scoreReward: number,
  oldItemID: string,
  newItemIdentity: sItem
}

class ItemManager {
  
  wantedItem = 0
  itemVariationCount = 14
  itemInSceneCount = 50
  y = 0.1

  sceneBorder = 0
  sceneSize = 20 - this.sceneBorder*2
  shift = 6
  
  constructor(

  ) {

  }



  public async getRealmState(realm:string): Promise<any> {
    const realmRef = db.collection(GAME_REALMS).doc(realm)
    try {
      const doc = await realmRef.get()
      if (!doc.exists) { 
        return this.initRealm(realm)
      } else {
        return doc.data() // sRealm type
      }
    } catch (error) {
      return error
    }
  }

  public async initRealm(realm:string): Promise<sRealm> {

    let itemList: sItem[] = []
    for(let i=0; i<this.itemInSceneCount; i++) {
        itemList.push(this.newItem())
    }

    const realmDoc: sRealm = {
      items: itemList,
      wantedComponentID: itemList[0].componentID,
      round: 1
    }

    db.collection(GAME_REALMS)
      .doc(realm)
      .set(realmDoc)
      
    return realmDoc

  }

  private randomComponentID(): number {
    return Math.floor(Math.random() * this.itemVariationCount)
  }

  private randomPosition(): number {
    return (Math.random() * this.sceneSize + this.sceneBorder) + this.shift
  }

  private makeID(length:number = 5): string {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
      charactersLength));
   }
   return result;
  }

  private newItem(): sItem {
    return {
      itemID: "FOOD-"+ this.makeID(),
      componentID:  this.randomComponentID(),
      x: this.randomPosition(),
      y: this.y,
      z: this.randomPosition()
    }
  }

  public async updatePosition(realm:string, itemID:string, x:number, y:number, z:number) {
    let sRealm: sRealm
    const realmRef = db.collection(GAME_REALMS).doc(realm)
    try {
      const doc = await realmRef.get()
      sRealm = doc.data() as sRealm
      sRealm.items = this.updateItemPositionByID(itemID, sRealm.items, x, y, z)
  
      // save doc back into DB
      db.collection(GAME_REALMS).doc(realm).set(sRealm)

    } catch (error) {
      return error
    }
  }

  private updateItemPositionByID(itemID:string, items:sItem[], x:number, y:number, z:number): sItem[] {
    items.forEach(item => {
      if (item.itemID == itemID) {
        item.x = x
        item.y = y
        item.z = z
      }
    })
    return items
  }

  public async deliverItem(realm:string, itemID:string, pubKey:string): Promise<DeliveryResponse | undefined> {
    const realmRef = db.collection(GAME_REALMS).doc(realm)
    try {
      const doc = await realmRef.get()
      const sRealm: sRealm = doc.data() as sRealm
      let score = 0
      const isRightItem = this.itemIsWanted(itemID, sRealm)
      
      if (isRightItem) {
        score += 100
        leaderboard.updateScore(pubKey, score)
        sRealm.wantedComponentID = this.chooseNewWantedComponentID(sRealm.items)
        sRealm.round ++
      } else {
        score -= 100
        leaderboard.updateScore(pubKey, score)
      }

      const newItem = this.newItem()
      sRealm.items = this.newItemIdentity(itemID, newItem, sRealm.items)

      // write back to DB
      realmRef.set(sRealm, {merge: true})

      const deliveryResp: DeliveryResponse = {
        success: true,
        wantedComponentID: sRealm.wantedComponentID,
        isRightItem: isRightItem,
        scoreReward: score,
        oldItemID: itemID,
        newItemIdentity: newItem
      }
      return deliveryResp

    } catch (error) {
      logger.error(error)
      return 
    }
  }

  private itemIsWanted(itemID:string, sRealm:sRealm): boolean {

    const item = this.getItemByID(itemID, sRealm.items)
    if ( item && item.componentID == sRealm.wantedComponentID) {
      return true
    } else {
      return false
    }
  }

  private getItemByID(itemID:string, list:sItem[]): sItem | undefined {
    let result: sItem | undefined
    list.forEach(item => {
      if (item.itemID == itemID) result = item
    })
    return result
  }

  private newItemIdentity(itemID:string, newItem:sItem, itemList:sItem[]): sItem[] {
    itemList.forEach(item => {
      if (item.itemID == itemID) item = newItem
    })
    return itemList
  }

  private chooseNewWantedComponentID(items:sItem[]): number {
    const randomIndex = Math.floor(Math.random() * items.length)
    return items[randomIndex].componentID
  }



}

export const itemManager = new ItemManager()