import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { createFromJSON } from '@libp2p/peer-id-factory'
import { multiaddr } from 'multiaddr'
import express from 'express'
import cors from 'cors'
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
import { v4 as uuidv4 } from 'uuid';
import { mdns } from '@libp2p/mdns'

const curr_username = process.argv[2]
const provider_info_channels = ['__$provider_info_1__','__$provider_info_2__','__$provider_info_3__']
let profile = {
  last_updated: new Date().toISOString(),
  profile_info: {
    username: curr_username,
    following: [],
    followers: [],
  },
  posts: []
}
let timeline = []
let newSnoots = []

const updateProfileDate = () => {
  profile.last_updated = new Date().toISOString()
}

const saveProfileLocally = () => {
  fs.writeFile(`../network_nodes/profiles/${curr_username}.json`, JSON.stringify(profile), (err) => {
    if (err) {
      console.log('Error saving profile locally: ' + err)
    }
  })
}

const saveProfileAndDie = () => {
  fs.writeFile(`../network_nodes/profiles/${curr_username}.json`, JSON.stringify(profile), (err) => {
    if (err) {
      console.log('Error saving profile locally: ' + err)
    }
    process.exit(0)
  })
}

const loadLocalProfile = () => {
  try {
    const data = fs.readFileSync(`../network_nodes/profiles/${curr_username}.json`)
    return JSON.parse(data)
  } catch (err) {
    console.log('Error loading local profile: ' + err)
    return undefined
  }
}

const getCID = async (data) => {
  const bytes = json.encode({ username: data })
  const hash = await sha256.digest(bytes)
  const cid = CID.create(1, json.code, hash)
  return cid
}

const setUpProviders = async (cids) => {
  for (const cid of cids) {
    node.contentRouting.provide(cid)
    console.log('Node %s is providing %s', node.peerId.toString(), cid.toString())
  }
}

const snootHandler = (msg) => {
  const snoot = {
    id: msg.id,
    username: msg.username,
    message: msg.message,
    topic: msg.topic,
    date: msg.date
  }
  timeline.unshift(snoot)
  newSnoots.unshift(snoot)
}

const followHandler = (msg) => {
  if (curr_username == msg.follows) {
    profile.profile_info.followers.push(msg.username)
    updateProfileDate()
    saveProfileLocally()
    node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  }
}

const unfollowHandler = (msg) => {
  if (curr_username == msg.unfollows) {
    profile.profile_info.followers = profile.profile_info.followers.filter((follower) => follower != msg.username)
    updateProfileDate()
    saveProfileLocally()
    node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  }
}

const setUpEventListeners = async () => {
  node.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic == "_peer-discovery._p2p._pubsub") return
    const msg = JSON.parse(arrayToString(evt.detail.data))

    if (msg.type == "snoot") {
      console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: (${msg.username})${msg.message}`)
      snootHandler(msg)
    } else if (msg.type == "follow") {
      console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: ${msg.username} is now following ${msg.follows}`)
      followHandler(msg)
    } else if (msg.type == "unfollow") {
      console.log(`Node ${node.peerId.toString()} received message on topic ${evt.detail.topic}: ${msg.username} is no longer following ${msg.unfollows}`)
      unfollowHandler(msg)
    }
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
    pubsub: gossipsub({ allowPublishToZeroPeers: true, emitSelf: true }),
    peerDiscovery: [
      /*mdns({
        interval: 1000,
        enabled: true
      }),*/
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
  //get current path
  const path = process.cwd()
  console.log("PATH : ", path);
  const boostrapersIDs = JSON.parse(fs.readFileSync('../network_nodes/bootstrapers.json', 'utf8')).bootstrapers;
  const bootstraperFullMultiaddrs = []

  for (const boostraper of boostrapersIDs) {
    const boostraperMultiaddrs = boostraper.multiaddrs.map((multiaddr_) => multiaddr(multiaddr_));
    bootstraperFullMultiaddrs.push(...boostraperMultiaddrs)
  }

  const node = await createNode(bootstraperFullMultiaddrs);

  for (const boostraper of boostrapersIDs) {
    const peerID = await createFromJSON({id: boostraper.id});
    const boostraperMultiaddrs = boostraper.multiaddrs.map((multiaddr_) => multiaddr(multiaddr_));
    node.peerStore.addressBook.add(peerID, boostraperMultiaddrs);
  }

  return node
}

const initAsProvider = async (node) => {
  // Wait for onConnect handlers in the DHT
  await delay(5000)

  const curr_cid = await getCID(curr_username)
  await setUpProviders([curr_cid])
}
    

const initializeNode = async (node) => {
  await initAsProvider(node)
  await setUpEventListeners()
  const local_profile = loadLocalProfile()
  console.log("Local profile: ", local_profile ? local_profile : "None")
  try {
    const dht_profile = JSON.parse(arrayToString(await node.contentRouting.get(arrayFromString(curr_username))))
    console.log("Profile already exists in DHT")
    if (local_profile.last_updated > dht_profile.last_updated) {
      console.log("Local profile is more recent than DHT profile")
      profile = local_profile
      updateProfileDate()
      node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
    } else {
      console.log("DHT profile is more recent than local profile")
      profile = dht_profile
      saveProfileLocally()
    }
    for (let post of profile.posts) {
      snootHandler(post)
    }
    for (const following of profile.profile_info.following) {
      node.pubsub.subscribe(following)
    }
  } catch (e) {
    console.log("Profile does not exist in DHT")
    if (local_profile) {
      console.log("Local profile exists")
      profile = local_profile
    } else {
      console.log("Local profile does not exist")
    }
    updateProfileDate()
    saveProfileLocally()
    node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
  }
  node.pubsub.subscribe(curr_username)
  await initializeTimeline(node)
}

const removeFromTimeline = (username) => {
  timeline = timeline.filter((snoot) => snoot.username != username)
}

const updateTimeline = async (node, users) => {
  for (const following of users) {
    try {
      let profile = await node.contentRouting.get(arrayFromString(following))
      timeline.push(...JSON.parse(arrayToString(profile)).posts)
    } catch (e) {
      console.log(`Could not get profile for ${following}`)
    }

  }
  timeline.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const initializeTimeline = async (node) => {
  await updateTimeline(node, profile.profile_info.following)
  node.pubsub.subscribe(curr_username)
}

const getProviders = async (username) => {
  const cid = await getCID(username)
  console.log(`CID(${username}): ${cid}`)
  try {
    const providers = await all(node.contentRouting.findProviders(cid, { timeout: 3000, maxNumProviders: 5 }))
    return providers
  } catch (e) {
    console.log(`Could not find providers for ${username}`)
    return []
  }
}

const sendMessageIfNoProviders = async (username, message) => {
  const providers = await getProviders(username)
  for (const provider of providers) {
    try {
      const connection = await node.dial(provider.id)
      console.log(`Found connection (${connection.id}) for ${username} at ${provider.id}`)
      return
    } catch (e) {
      console.log(e)
      continue
    }
  }
  const random_provider_info_channel = provider_info_channels[Math.floor(Math.random() * provider_info_channels.length)];
  node.pubsub.publish(random_provider_info_channel, arrayFromString(JSON.stringify(message)))
  console.log(`No providers for ${username}, sending message to provider info channel`)
}

const node = await genNode()

console.log(`Node starting with id: ${node.peerId.toString()}`)

await node.start()

console.log(`Node started with id: ${node.peerId.toString()}`)

await initializeNode(node)

const app = express();
const maddress = node.getMultiaddrs().at(-1).nodeAddress()
const port = maddress.port

app.set('port', port+10);
app.use(bodyParser.json())
app.use(cors())
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.put("/follow/:username", function (req, res) {
  let username = req.params.username;
  if (profile.profile_info.following.includes(username)) {
    res.status(404)
    res.send("Already following " + username);
    return
  }

  profile.profile_info.following.push(username)
  node.pubsub.subscribe(username)

  const followMessage = {
    type: "follow",
    username: curr_username,
    follows: username
  }

  node.pubsub.publish(username, arrayFromString(JSON.stringify(followMessage)))

  sendMessageIfNoProviders(username, followMessage)
  updateTimeline(node, [username])
  
  res.status(200)
  res.send(followMessage);
  
  updateProfileDate()
  saveProfileLocally()
  node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
});

app.put("/unfollow/:username", function (req, res) {
  let username = req.params.username;
  if (!profile.profile_info.following.includes(username)) {
    res.status(404)
    res.send("Not following " + username);
    return
  }
  profile.profile_info.following = profile.profile_info.following.filter((following) => following != username)
  node.pubsub.unsubscribe(username)

  const unfollowMessage = {
    type: "unfollow",
    username: curr_username,
    unfollows: username
  }

  node.pubsub.publish(username, arrayFromString(JSON.stringify(unfollowMessage)))

  sendMessageIfNoProviders(username, unfollowMessage)
  removeFromTimeline(username)

  res.status(200)
  res.send(unfollowMessage);
  updateProfileDate()
  saveProfileLocally()
  node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
});

app.post("/snoot", function (req, res) {
  const data = req.body;
  console.log(data)
  if (data.message == null) {
    res.status(404)
    res.send("No snoot provided");
    return;
  }
  const post = {
    type: "snoot",
    id: uuidv4(),
    username: curr_username,
    message: data.message,
    topic: data.topic,
    date: new Date().toISOString()
  }
  // limit to k snoots on profile
  profile.posts.push(post);
  node.pubsub.publish(curr_username, arrayFromString(JSON.stringify(post)))

  res.status(200)
  res.send(post);
  updateProfileDate()
  saveProfileLocally()
  node.contentRouting.put(arrayFromString(curr_username), arrayFromString(JSON.stringify(profile)))
});

app.get("/profile/:username", async function (req, res) {
  let username = req.params.username;
  try {
    let profile = await node.contentRouting.get(arrayFromString(username))
    res.status(200)
    res.send(JSON.parse(arrayToString(profile)))
  } catch (e) {
    res.status(404)
    res.send("No user found with username " + username);
  }

});

app.get("/timeline", function (req, res) {
  res.status(200)
  res.send(timeline);
});

app.get("/topic/:topic", async function (req, res) {
  let topic = req.params.topic;
  const topicPosts = [];
  for (let post of timeline) {
    if (post.topic == topic) {
      topicPosts.push(post);
    }
  }
  res.status(200);
  res.send(topicPosts);
});

app.get('/newSnoots', async function(req, res) {
if (newSnoots.length !== 0)
    console.log("Sent new Snoots")
  res.status(200)
  res.send(newSnoots)
  newSnoots = []
});

app.post('/logout', async function(req, res) {
  await node.stop()
  console.log('Logged out and stopped node')
  res.status(200).send("Logged out")
  saveProfileAndDie()
});

//create a port for getting following recommendations
app.get('/recommendations', async function(req, res) {
  let recommendations = []
  for (const following of profile.profile_info.following) {
    let saveProfile = profile.profile_info.following;
    try {
      let profile = await node.contentRouting.get(arrayFromString(following))
      let following_following = JSON.parse(arrayToString(profile)).profile_info;
      for (const following_following_user of following_following.following) {
          if (!saveProfile.includes(following_following_user) && !recommendations.includes(following_following_user) && following_following_user !== curr_username) {
          recommendations.push(following_following_user)
        }
      }
    } catch (e) {
      console.log(`Could not get profile for ${following}`)
    }
  }
  console.log('Recommendations', recommendations);
  res.status(200)
  res.send(recommendations)
});

app.listen(app.get('port'), function () {
  console.log(`Example app listening on port ${app.get('port')}!`);
});

process.send({ port: app.get('port') })

process.on('SIGINT', async () => {
  await node.stop()
  console.log('Node stopped')
  process.exit()
})