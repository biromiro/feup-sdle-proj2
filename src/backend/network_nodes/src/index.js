import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createFromJSON } from '@libp2p/peer-id-factory'
import { multiaddr } from 'multiaddr'
//import { mdns } from '@libp2p/mdns'
//import { bootstrap } from '@libp2p/bootstrap'
//import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import fs from 'fs'
import { createHash } from 'crypto'
import express from 'express'
import { CID } from 'multiformats/cid'
import all from 'it-all'

/*console.log(process.argv[2])
const usernameHashed = createHash('md5').update(process.argv[2]).digest('hex');
console.log(usernameHashed)
const cid = CID.parse(usernameHashed)
console.log(cid)*/

const app = express();
app.use(express.json());

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
}

console.log(`Node starting with id: ${node.peerId.toString()}`)

await node.start()

console.log(`Node started with id: ${node.peerId.toString()}`)

node.addEventListener('peer:discovery', (peer) => {
  console.log(`Discovered: ${peer.detail.id.toString()}`)
})

/*
app.post('/sub', subHandler)
app.post('/unsub', unsubHandler)
app.post('/pub', pubHandler)

app.listen(PORT, () => {
  console.log(`Backend listening on ${node.getMultiaddrs().at(-1)}`);
});*/