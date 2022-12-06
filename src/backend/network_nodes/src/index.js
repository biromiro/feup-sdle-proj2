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

const profile = {
  profile_info: {
    username: process.argv[2]
  },
  posts: [
    {
      username: process.argv[2],
      message: `Hello World, I'm ${process.argv[2]}`,
      date: new Date().toISOString()
    },
  ]
}

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
    console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: ${arrayToString(evt.detail.data)}`)
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
  const curr_cid = await getCID(profile.profile_info.username)
  await setUpProviders([curr_cid])
  await node.contentRouting.put(arrayFromString(profile.profile_info.username), arrayFromString(JSON.stringify(profile)))
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
const maddress = node.getMultiaddrs().at(-1).nodeAddress()
const port = maddress.port
app.set('port', port+10);

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/follow/:username", function (req, res) {
  let username = req.params.username;
  node.pubsub.subscribe(username)
  res.send("Followed " + username);
});

app.get("/unfollow/:username", function (req, res) {
  let username = req.params.username;
  node.pubsub.unsubscribe(username)
  res.send("Unfollowed " + username);
});

app.get("/snoot", function (req, res) {
  const data = req.query.data;
  if (data == null) {
    res.send("No data provided");
    return;
  }
  node.pubsub.publish(profile.profile_info.username, arrayFromString(data))
  res.send(profile.profile_info.username + " snooted " + `"${data}"`);
});

app.get("/profile/:username", async function (req, res) {
  let username = req.params.username;
  let profile = await node.contentRouting.get(arrayFromString(username))
  if(profile)
    res.send(JSON.parse(arrayToString(profile)))
  else
    res.send("No user found with username " + username);
});

app.listen(app.get('port'), function () {
  console.log(`Example app listening on port ${app.get('port')}!`);
});

process.on('SIGINT', async () => {
  await node.stop()
  console.log('Node stopped')
  process.exit()
})