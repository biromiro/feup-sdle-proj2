import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createFromJSON } from '@libp2p/peer-id-factory'
import { multiaddr } from 'multiaddr'
import express from 'express'
import fs from 'fs'
import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'
import delay from 'delay'
import { fromString as arrayFromString } from "uint8arrays/from-string";
import { toString as arrayToString } from "uint8arrays/to-string";
import all from 'it-all'
import { pipe } from 'it-pipe'
import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { bootstrap } from '@libp2p/bootstrap'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import bodyParser from 'body-parser'

const PORT = 3000
const curr_username = process.argv[2]
let profile = undefined

const getCID = async (data) => {
  const bytes = json.encode({ username: data })
  const hash = await sha256.digest(bytes)
  const cid = CID.create(1, json.code, hash)
  return cid
}

const setUpProviders = async (cids) => {
  for (const cid of cids) {
    await node.contentRouting.provide(cid)
    console.log('Node %s is providing %s', node.peerId.toString(), cid.toString())
  }
}

const setUpEventListeners = async () => {
  node.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic == "_peer-discovery._p2p._pubsub") return
    const msg = JSON.parse(arrayToString(evt.detail.data))
    console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: (${msg.username})${msg.message}`)
  })
}

const createNode = (bootstrapers) => {
  return createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [
      tcp()
    ],
    streamMuxers: [
      mplex()
    ],
    connectionEncryption: [
      noise()
    ],
    pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    peerDiscovery: [
      bootstrap({
        interval: 60e3,
        list: bootstrapers
      }),
      pubsubPeerDiscovery({
        interval: 1000
      })
    ],
    dht: kadDHT({ enabled: true, randomWalk: { enabled: true } }),
  })
}

const genNode = async () => {

  const boostrapersIDs = JSON.parse(fs.readFileSync('./bootstrapers.json', 'utf8')).bootstrapers;
  const bootstraperFullMultiaddrs = []

  for (const boostraper of boostrapersIDs) {
    const boostraperMultiaddrs = boostraper.multiaddrs.map((multiaddr_) => multiaddr(multiaddr_));
    bootstraperFullMultiaddrs.push(...boostraperMultiaddrs)
  }

  const node = await createNode(bootstraperFullMultiaddrs);

  for (const boostraper of boostrapersIDs) {
    const peerID = await createFromJSON({id: boostraper.id});
    const boostraperMultiaddrs = boostraper.multiaddrs.map((multiaddr_) => multiaddr(multiaddr_));
    await node.peerStore.addressBook.add(peerID, boostraperMultiaddrs);
  }

  return node
}

const initializeNode = async (node) => {
  const curr_cid = await getCID(curr_username)
  await setUpProviders([curr_cid])
  try {
    const dht_profile = await node.contentRouting.get(arrayFromString(curr_username))
    console.log("Profile already exists in DHT")
    profile = JSON.parse(arrayToString(dht_profile))
    for (const following of profile.profile_info.following) {
      node.pubsub.subscribe(following)
    }
  } catch (e) {
    console.log("Profile does not exist in DHT")
    profile = {
      profile_info: {
        username: curr_username,
        following: [],
        followers: [],
      },
      posts: [
        {
          username: process.argv[2],
          message: `Hello World, I'm ${curr_username}`,
          date: new Date().toISOString()
        },
      ]
    }
    await node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  }
}

const node = await genNode()

console.log(`Node starting with id: ${node.peerId.toString()}`)

await node.start()

console.log(`Node started with id: ${node.peerId.toString()}`)

await setUpEventListeners()
// Wait for onConnect handlers in the DHT
await delay(5000)

await initializeNode(node)

const app = express();
app.use(bodyParser.json())

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.put("/follow/:username", async function (req, res) {
  let username = req.params.username;
  if (profile.profile_info.following.includes(username)) {
    res.send("Already following " + username);
    return
  }

  profile.profile_info.following.push(username)
  await node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  node.pubsub.subscribe(username)
  res.send("Followed " + username);
});

app.put("/unfollow/:username", async function (req, res) {
  let username = req.params.username;
  if (!profile.profile_info.following.includes(username)) {
    res.send("Not following " + username);
    return
  }
  profile.profile_info.following = profile.profile_info.following.filter((following) => following != username)
  await node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  node.pubsub.unsubscribe(username)

  res.send("Unfollowed " + username);
});

app.post("/snoot", async function (req, res) {
  const data = req.body;
  console.log(data)
  if (data.message == null) {
    res.send("No snoot provided");
    return;
  }
  const post = {
    type: "snoot",
    username: curr_username,
    message: data.message,
    date: new Date().toISOString()
  }
  // limit to k snoots on profile
  profile.posts.push(post);
  await node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  node.pubsub.publish(curr_username, arrayFromString(JSON.stringify(post)))
  res.send(profile.profile_info.username + " snooted " + `"${data.message}"`);
});

app.get("/profile/:username", async function (req, res) {
  let username = req.params.username;
  let profile = await node.contentRouting.get(arrayFromString(username))
  if(profile)
    res.send(JSON.parse(arrayToString(profile)))
  else
    res.send("No user found with username " + username);
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});

process.on('SIGINT', async () => {
  await node.stop()
  console.log('Node stopped')
  process.exit()
})