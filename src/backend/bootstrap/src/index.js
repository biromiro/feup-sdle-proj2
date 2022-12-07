import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createFromJSON } from '@libp2p/peer-id-factory'
//import { mdns } from '@libp2p/mdns'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import fs from 'fs'

const bootstrapVals = JSON.parse(fs.readFileSync(`./keys/${process.argv[2]}.json`, 'utf8'));

const peerID = await createFromJSON(bootstrapVals.peerID)

const bootstrap = await createLibp2p({
  peerId: peerID,
  addresses: {
    listen: [`/ip4/0.0.0.0/tcp/${bootstrapVals.port}`]
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
  peerDiscovery:[
    pubsubPeerDiscovery({
      interval: 1000,
    })
  ],
  relay: {
    enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
    hop: {
      enabled: true // Allows you to be a relay for other peers
    }
  }
})

console.log(`libp2p bootstrap starting with id: ${bootstrap.peerId.toString()}`)

await bootstrap.start()

const bootstrapMultiaddrs = bootstrap.getMultiaddrs()

console.log(`Bootstrap Multiaddrs: ${bootstrapMultiaddrs}`)

process.on('SIGINT', async () => {
  await bootstrap.stop()
  process.exit()
})