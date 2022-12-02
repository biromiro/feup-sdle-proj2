import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { bootstrap } from '@libp2p/bootstrap'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import fs from 'fs'

const createNode = async (bootstrapers) => {
  const node = await createLibp2p({
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
    ]
  })

  return node
}

const relayMultiaddrs = []

fs.readFileSync('../bootstrap/relayMultiaddrs.txt', 'utf8').split(',').forEach((bootstraper) => {
  relayMultiaddrs.push(bootstraper);
});

const node = await createNode(relayMultiaddrs);

node.addEventListener('peer:discovery', (evt) => {
  console.log(`Peer ${node.peerId.toString()} discovered: ${evt.detail.id.toString()}`)
})

console.log(`Node starting with id: ${node.peerId.toString()}`)

await node.start()
