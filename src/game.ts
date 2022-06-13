import { getCurrentRealm, Realm } from '@decentraland/EnvironmentAPI'
import { getUserData, UserData } from "@decentraland/Identity"
import { getPlayersInScene } from "@decentraland/Players"
import { Player } from "./entities/player"
import { AvatarManager, Avatar } from './entities/avatarManager'
import { Item} from "./entities/item"
import { RealmManager, NewItemPosition, DeliverResponse, sItem } from "./entities/realmManager"
import { Npc } from "./entities/npc"
import { sceneMessageBus } from './entities/messagebus'
import { components } from './entities/components'
import { Leaderboard } from './entities/leaderboard'
import { Environment } from './entities/environment'



const GRAB_DISTANCE_1ST_PERSON = 3
const GRAB_DISTANCE_3RD_PERSON = 8
let grabDistance = 2
 
// for wallet testing ad "&ENABLE_WEB3" to the localhost url 

type GameState = {
  userID: string | undefined,
  npcState: string,
  wantedComponentID: number,
  oldItemID: string,
  newItemIdentity: sItem,
  score: number
}

// INIT GAME

const environment = new Environment()

const npc = new Npc(
  new Vector3(16,0,24.6),
  Quaternion.Euler(0,180,0)
  )

const leaderboard = new Leaderboard(
  new Vector3(26,0,30),
  Quaternion.Euler(0,0,0)
)
leaderboard.updateLine(5, "Connect Your Wallet", "")


let player: Player
executeTask(async () => {
  const userData = await getUserData() 
  player = new Player(userData)
  log(player)
  const resp = await player.handshake() // firebase server
  if (player.userData?.displayName && resp?.score) {
    leaderboard.updateLine(5, player.userData.displayName, resp.score)
  }
})

const avatarManager = new AvatarManager()
executeTask(async () => {
  let players = await getPlayersInScene()
  players.forEach((player) => {
    log("player was already here: ", player.userId)
    avatarManager.addAvatar(player.userId)
  })
})

let realmManager: RealmManager
executeTask(async () => {
  const realmData = await getCurrentRealm()
  if (realmData) {
    realmManager = new RealmManager(realmData)
    if (await realmManager.initRealm()) {
      const cID = realmManager.sRealm?.wantedComponentID
           sceneMessageBus.emit("WANTED!", {cID: cID})
    }
  }
})



// GRAB ITEM
Input.instance.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => {
  realmManager.correctErrors()
  if (e.hit && e.hit.length < grabDistance) {
    let hitEntity = engine.entities[e.hit.entityId]
    if (!player.isGrabbing) {
      if(hitEntity && hitEntity.getParent() === realmManager) {
        const item = hitEntity as Item
        player.pickUp(item)
        sceneMessageBus.emit("pickUp", {
          userID: player.userData?.userId,
          itemID: item.itemID
        })
      }      
    }
  }    
})

// Drop the item or feed it to the NPC 
Input.instance.subscribe('BUTTON_UP', ActionButton.POINTER, true, async (e) => {
  
  const item = player.dropItemInto(realmManager)
  if (!item) return

  if (e.hit && e.hit.length < grabDistance+2) {
    let hitEntity = engine.entities[e.hit.entityId]

    if (hitEntity) {
     
      const npc = hitEntity.getParent() as Npc
      if (npc.name != "Fluffy") return

      npc.yes.play()
      const response: DeliverResponse = await realmManager.deliverItem(item, player)
       if (response.success) {
       
        const gameState: GameState = {
          userID: player.userData?.userId,
          npcState: "Death",
          wantedComponentID: response.wantedComponentID,
          oldItemID: response.oldItemID,
          newItemIdentity: response.newItemIdentity,
          score: response.scoreReward
        }

        leaderboard.updateScore(response.scoreReward)

        // NPC ANIMATION
        if (gameState.score > 0) { npc.wave.play() } 
        else {  npc.no.play() }

        sceneMessageBus.emit("gameState", gameState)
       }
    } else {
      realmManager.updatePosition(item)

      const nip: NewItemPosition = {
        userID: player.userData?.userId,
        itemID: item.itemID,
        position: item.getComponent(Transform).position,
        rotation: item.getComponent(Transform).rotation
      }

      sceneMessageBus.emit("drop", nip)
    }

  } 
})

// MESSAGE BUS
sceneMessageBus.on("WANTED!", (data:any) => {
  npc.wantNewComponent(components[data.cID])
})

sceneMessageBus.on("pickUp", (data: any) => {
  if (data.userID != player.userData?.userId) {
    const avatar = avatarManager.getAvatarByID(data.userID)
    const item = realmManager.getItemByID(data.itemID)
    item.avatarGrabbing()
    item.setParent(avatar)
  }
})

sceneMessageBus.on("drop", (data: NewItemPosition) => {
  if (data.userID != player.userData?.userId)
    realmManager.detachItemFromAvatar(data)
})

sceneMessageBus.on("gameState", (data: GameState) => {
    realmManager.newItemIdentity(data.oldItemID, data.newItemIdentity)
    npc.wantNewComponent(components[data.wantedComponentID])
    npc.scoreManager.spawn(data.score) 
})

sceneMessageBus.on("npc", (data:any) => {
 // npc.playAnimation(data.animation)
})

// EVENT LISTENERS
onCameraModeChangedObservable.add(({ cameraMode }) => {
  log("Camera mode changed:", cameraMode)
  if (cameraMode == 1) {
    grabDistance = GRAB_DISTANCE_3RD_PERSON
    npc.feedDistance(GRAB_DISTANCE_3RD_PERSON)
    realmManager.updateGrabDistance(GRAB_DISTANCE_3RD_PERSON)
  } else {
    grabDistance = GRAB_DISTANCE_1ST_PERSON
    npc.feedDistance(GRAB_DISTANCE_1ST_PERSON)
    realmManager.updateGrabDistance(GRAB_DISTANCE_1ST_PERSON)
  }
})

onLeaveSceneObservable.add((player) => {
  log("player left scene: ", player.userId)
  avatarManager.removeAvatar(player.userId)
})

onEnterSceneObservable.add((player) => {
  log("player enters scene ", player.userId)
  avatarManager.getAvatarByID(player.userId)
})

// BUGFIX to camera having no position

const forwardVector: Vector3 = Vector3.Forward()
        //.scale(this.Z_OFFSET)
        .rotate(Camera.instance.rotation)
const debug = Camera.instance.position.clone().add(forwardVector)


