// for deploy first cd into functions folder in terminal
// firebase deploy

import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import { itemManager } from "./itemManager"
import { leaderboard } from "./leaderboard";


const app = express();
app.use(cors({origin: true}));
exports.feedthecat = functions.https.onRequest(app)

// Leaderboard Management

app.get("/handshake", async (req: any, res: any) => {
  const response = await leaderboard.handshake(req.query.pubKey, req.query.displayName)
  return res.status(200).send(response)
})

app.get("/leaderboard", async (req: any, res: any) => {
  const response = await leaderboard.topPlayer(req.query.realm, 5)
  return res.status(200).send(response)
})

// app.get("/getscore", async (req: any, res: any) => {
//   const response = leaderboard.getScore(req.query.pubKey)
//   return res.status(200).send(response)
// })

// Realm Management

app.get("/getrealmstate", async (req: any, res: any) => {
  const realm = req.query.realm
  if(!realm || realm == "") return
  
  const realmDoc = await itemManager.getRealmState(realm)
  return res.status(200).send(realmDoc)
})

app.get("/updateposition", async (req: any, res: any) => {
  const q = req.query
  if(!q.realm || q.realm == "") return  
  itemManager.updatePosition(q.realm, q.itemID, q.x, q.y, q.z)
  return res.status(200).send(true)
})

app.get("/deliveritem", async (req: any, res: any) => {
  const q = req.query
  if (!q.itemID || !q.realm) return 
  const deliveryResponse = await itemManager.deliverItem(q.realm, q.itemID, q.pubKey)
  return res.status(200).send(deliveryResponse)
})








// try { } catch { } example
// app.get("/test", async (req: any, res: any) => {
//    const event = req.query.event
//   const signatures = db.collection("Signatures-" + event);

//   try {
//     await signatures.doc("/" + "New Signature" + "/").create({
//       id: "newSignature.id",
//       name: "newSignature.name",
//     });
//     return res.status(200).send("Signed book!");
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send(error);
//   }
// });
