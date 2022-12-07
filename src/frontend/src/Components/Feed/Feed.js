import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./Feed.css";
import Post from "./Post/Post";
import BoopBox from "./Boop/BoopBox";
import FlipMove from "react-flip-move";

// codificado duro por agora
const PORT = 51735;
const url = `http://localhost:${PORT}/timeline`;

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(url)
      .then((response) => {
        if(response.data == "No posts to show") return;
        setPosts(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  return (
    <div className="feed">
      <div className="feed__header">
        <h2>Home</h2>
      </div>

      <BoopBox />
      
      <FlipMove>
        {posts.map((post) => (
          <Post
            key={post.message}
            displayName={post.username}
            username={post.username}
            verified={post.verified}
            text={post.message}
            avatar={post.avatar}
            image={post.image}
          />
        ))}
        <Post
          text="AOTY! QUE POG!"
          username="mirobiro"
          displayName="buno"
          avatar="https://images-ext-1.discordapp.net/external/gF6yhcFy39G1VNdzxl-g74HaQSMDrVLNTBbalodAeLc/https/pbs.twimg.com/profile_images/1550063839798038529/lZRZQMP0.png"
          image="https://media.pitchfork.com/photos/61649694110e7cd222907396/1:1/w_600/Black-Country-New-Road.jpg">
        </Post>
      </FlipMove>
    </div>
  );
}

export default Feed;
