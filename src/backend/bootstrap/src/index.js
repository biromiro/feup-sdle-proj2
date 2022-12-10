import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createFromJSON } from '@libp2p/peer-id-factory'
import { fromString as arrayFromString } from "uint8arrays/from-string";
import { toString as arrayToString } from "uint8arrays/to-string";
import { mdns } from '@libp2p/mdns'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import fs from 'fs'

const provider_info_channel = `__$provider_info_${process.argv[2]}__`
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
    mdns({
      interval: 1000,
      enabled: true
    }),
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

const followHandler = async (msg) => {
  const profile = await bootstrap.contentRouting.get(arrayFromString(msg.follows))
  const parsedProfile = JSON.parse(arrayToString(profile))
  parsedProfile.profile_info.followers.push(msg.username)
  bootstrap.contentRouting.put(arrayFromString(msg.follows), arrayFromString(JSON.stringify(parsedProfile)))
}

const unfollowHandler = async (msg) => {
  const profile = await bootstrap.contentRouting.get(arrayFromString(msg.unfollows))
  const parsedProfile = JSON.parse(arrayToString(profile))
  profile.profile_info.followers = profile.profile_info.followers.filter((follower) => follower != msg.username)
  bootstrap.contentRouting.put(arrayFromString(msg.unfollows), arrayFromString(JSON.stringify(parsedProfile)))
}

const setUpEventListeners = async () => {
  bootstrap.pubsub.subscribe(provider_info_channel)

  bootstrap.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic == "_peer-discovery._p2p._pubsub") return
    const msg = JSON.parse(arrayToString(evt.detail.data))

    if (msg.type == "follow") {
      console.log(`Node ${bootstrap.peerId.toString()} received message on topic ${evt.detail.topic}: ${msg.username} is now following ${msg.follows}`)
      followHandler(msg)
    } else if (msg.type == "unfollow") {
      console.log(`Node ${bootstrap.peerId.toString()} received message on topic ${evt.detail.topic}: ${msg.username} is no longer following ${msg.unfollows}`)
      unfollowHandler(msg)
    }
  })
}

await bootstrap.start()

await setUpEventListeners()

const bootstrapMultiaddrs = bootstrap.getMultiaddrs()

console.log(`Bootstrap Multiaddrs: ${bootstrapMultiaddrs}`)

process.on('SIGINT', async () => {
  await bootstrap.stop()
  process.exit()
})