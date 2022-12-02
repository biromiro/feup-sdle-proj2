import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { floodsub } from '@libp2p/floodsub'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import fs from 'fs'

const relay = await createLibp2p({
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0'
    ]
  },
  transports: [tcp()],
  streamMuxers: [mplex()],
  connectionEncryption: [noise()],
  pubsub: gossipsub({ allowPublishToZeroPeers: true }),
  peerDiscovery: [
    pubsubPeerDiscovery({
      interval: 1000
    })
  ],
  relay: {
    enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
    hop: {
      enabled: true // Allows you to be a relay for other peers
    }
  }
})

console.log(`libp2p relay starting with id: ${relay.peerId.toString()}`)

await relay.start()

const relayMultiaddrs = relay.getMultiaddrs().toString()

fs.writeFile('relayMultiaddrs.txt', relayMultiaddrs, function (err) {
  if (err) return console.log(err);
  console.log('Saved Relay Multiaddrs!');
});