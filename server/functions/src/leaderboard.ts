import { logger } from "firebase-functions/v1"
import { db, firebase } from "./firestore"


const LEADERBOARD = "Game-Leaderboard"

type Player = {
    publicKey: string,
    displayName: string,
    score: number,
    lastLogin: any,
    creation: any
}

type LeaderboardEntry = {
    displayName:string,
    score:number
}

class Leaderboard {

    public async getPlayer(pubKey:string, displayName?:string): Promise<Player | undefined> {
        //if (!displayName) displayName = pubKey.slice(0,4)

        const playerRef = db.collection(LEADERBOARD).doc(pubKey)
        try {
            const playerDoc = await playerRef.get()
            if (playerDoc.exists) {
                logger.log(playerDoc)
                return playerDoc.data() as Player 
            } else {
                // if player is not in database
                const p = await playerRef.set({
                    publicKey: pubKey,
                    displayName: displayName,
                    score: 0,
                    lastLogin: firebase.firestore.Timestamp.now(),
                    creation: firebase.firestore.Timestamp.now()
                  })
                if (p) {
                    const playerDoc = await playerRef.get()
                    return playerDoc.data() as Player
                } else {
                    return undefined
                }
            }
            
        } catch (err) {
            logger.error(err)
            return undefined
        }
    }

    public async handshake(pubKey:string, displayName:string): Promise<Player> {
       const dummyReturn:Player = {
                publicKey: pubKey,
                displayName: displayName,
                score: 0,
                lastLogin: "",
                creation: ""
       }
       
        if (!pubKey) 
            return dummyReturn
        
        try {
            const player = await this.getPlayer(pubKey, displayName)
            const playerRef = db.collection(LEADERBOARD).doc(pubKey)
            if (player) {
                await playerRef.set({
                displayName: displayName,
                lastLogin: firebase.firestore.Timestamp.now()
              }, { merge: true })
              return player
    
            } else {
                await playerRef.set({
                    publicKey: pubKey,
                    displayName: displayName,
                    score: 0,
                    lastLogin: firebase.firestore.Timestamp.now(),
                    creation: firebase.firestore.Timestamp.now()
                  })
                return dummyReturn
            }

        } catch (err) {
            // return err
            return dummyReturn
        }

    }

    public async updateScore(pubKey:string, score:number) {
        if (!pubKey) pubKey = "anonymous"
        try{
            let player = await this.getPlayer(pubKey)
            if (player) {
                player.score += score
                const playerRef = db.collection(LEADERBOARD).doc(pubKey)
                await playerRef.set({
                    score: player.score
                }, { merge: true })
            }
               
        } catch (err) {
            logger.error(err)
        }
    }

    public async topPlayer(realm:string, count:number): Promise<LeaderboardEntry[]> {
        let leaderBoard: LeaderboardEntry[] = []
        const leaderBoardRef = db.collection(LEADERBOARD)
        const topPlayer = await leaderBoardRef.orderBy('score', 'desc').limit(count).get()
        topPlayer.forEach(playerRaw => {
            const player = playerRaw.data() as Player
            leaderBoard.push({displayName: player.displayName, score:player.score})  
        })
        return leaderBoard
    }
}

export const leaderboard = new Leaderboard()