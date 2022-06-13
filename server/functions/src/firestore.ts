import * as admin from "firebase-admin";
const serviceAccount = require("../permissions.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://poap-3b601.firebaseio.com",
})

export const db = admin.firestore();
export const firebase = admin


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
