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

const curr_username = process.argv[2]

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

const createNode = () => {
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
    dht: kadDHT({ enabled: true, randomWalk: { enabled: true } }),
  })
}

const node = await createNode();

const boostrapersIDs = JSON.parse(fs.readFileSync('./bootstrapers.json', 'utf8')).bootstrapers;

for (const boostraper of boostrapersIDs) {
  const peerID = await createFromJSON({id: boostraper.id});
  const boostraperMultiaddrs = boostraper.multiaddrs.map((multiaddr_) => multiaddr(multiaddr_));
  await node.peerStore.addressBook.add(peerID, boostraperMultiaddrs);
  //await node.dial(peerID);
}

console.log(`Node starting with id: ${node.peerId.toString()}`)

await node.start()

console.log(`Node started with id: ${node.peerId.toString()}`)

node.addEventListener('peer:discovery', (peer) => {
  console.log(`Discovered: ${peer.detail.id.toString()}`)
})

node.pubsub.addEventListener("message", (evt) => {
  console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: ${evt.detail.data}`)
})


// Wait for onConnect handlers in the DHT
await delay(5000)

const curr_cid = await getCID(curr_username)
await setUpProviders([curr_cid])

// wait for propagation
await delay(300)

const app = express();
const maddress = node.getMultiaddrs().at(-1).nodeAddress()
const port = maddress.port
app.set('port', port+10);

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/multiaddrs", function (req, res) {
  res.send(node.getMultiaddrs().map((multiaddr_) => multiaddr_.toString()));
});

app.get("/subscribe", function (req, res) {
  const topic = req.query.topic;
  if (topic == null) {
    res.send("No topic provided");
    return;
  }
  node.pubsub.subscribe(topic)
  res.send("Subscribed to topic " + topic);
});

app.get("/unsubscribe", function (req, res) {
  const topic = req.query.topic;
  if (topic == null) {
    res.send("No topic provided");
    return;
  }
  node.pubsub.unsubscribe(topic)
  res.send("Unsubscribed to topic " + topic);
});

app.get("/publish", function (req, res) {
  const topic = req.query.topic;
  if (topic == null) {
    res.send("No topic provided");
    return;
  }
  const data = req.query.data;
  if (data == null) {
    res.send("No data provided");
    return;
  }
  node.pubsub.publish(topic, data)
  res.send("Published to topic " + topic);
});

app.get("/username", function (req, res) {
  res.send(curr_username);
});

app.listen(app.get('port'), function () {
  console.log(`Example app listening on port ${app.get('port')}!`);
});
