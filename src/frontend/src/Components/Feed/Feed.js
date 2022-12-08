import React, { useCallback, useEffect, useState } from "react";
import "./Feed.css";
import Post from "./Post/Post";
import BoopBox from "./Boop/BoopBox";
import FlipMove from "react-flip-move";
import { useInterval } from './Utils';
// codificado duro por agora
const PORT = 57238;
const base_url = `http://localhost:${PORT}`;

function Feed() {
  const [posts, setPosts] = useState([]);

  const updatePosts = useCallback((data) => {
    const newPostsSorted = [...data, ...posts].sort((a, b) => a.date < b.date ? 1 : -1);
    const unique = newPostsSorted.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.id === value.id
    ))
  )
    setPosts(unique);
  }, [posts]);

  useEffect(() => {
    fetch(`${base_url}/timeline`, { method: "GET" })
      .then((res) => (res.status === 200 ? res.json() : "No posts to show"))
      .then((result) => {
        console.log(result)
        setPosts(result)
      })
      .catch((err) => console.log(err));
  }, []);

  useInterval(() => {
    fetch(`${base_url}/newSnoots`)
    .then((res) => (res.status === 200 ? res.json() : "No posts to show"))
      .then((result) => {
        console.log(result)
        updatePosts(result);
      })
      .catch((err) => console.log(err));
  }, 5000);


  
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
      </FlipMove>
    </div>
  );
}

export default Feed;
