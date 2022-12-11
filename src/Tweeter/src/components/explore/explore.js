import { useEffect, useState } from "react";
import axios from "axios";
import { connect } from "react-redux";
import Bio from "../bio/bio";
import Spinner from "../spinner/spinner";
import Post from "../post/post";

const Explore = (props) => {
  const [keyword, setKeyword] = useState("");
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const [search, setSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topicPosts, setTopicPosts] = useState([]);

  useEffect(() => {
    if (keyword === "") {
      setUser({});
      setTopicPosts([]);
      return;
    }
    if (props.searchUser) {
      setLoading(true);
      let url = `http://127.0.0.1:${props.port}/profile/${keyword}`;
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((res) =>{
          setLoading(false);
          setError(false);
          setUser(res.data.profile_info);
        }
        )
        .catch((err) => {
          if (err.response.status !== 404) {
            console.log(err)
            setError(true);
          }
          setLoading(false);
          });
    }
    else {
      setLoading(true);
      let url = `http://127.0.0.1:${props.port}/topic/${keyword}`;
      axios({
        method: "get",
        url: url,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then((res) =>{
          setLoading(false);
          setError(false);
          setTopicPosts(res.data);
          console.log(res.data);
        }
        )
        .catch((err) => {
          if (err.response.status !== 404) {
            console.log(err)
            setError(true);
          }
          setLoading(false);
          });
    }
  }, [search]);

  useEffect(() => {
    setUser({});
    setTopicPosts([]);
    setError(false);
    setLoading(false);
  }, []);

  return (
    <div>
      <form
        className="searchbox"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(!search);
        }}
      >
        <span className="material-icons-outlined searchIcon">search</span>
        <input
          type="search"
          placeholder="Search"
          className="searchBox"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="searchButton">Search</button>
      </form>
      <section>
        {loading && <Spinner />}
        {!loading && error && (
          <p style={{ display: "flex", justifyContent: "center" }}>
            Sorry, an error occured. Please try again.
          </p>
        )}
        {!loading && !error && ((Object.keys(user).length === 0 && props.searchUser) || (topicPosts.length === 0 && !props.searchUser)) && (
          <p style={{ display: "flex", justifyContent: "center" }}>
            No results found.
          </p>
        )}
        {/*!loading &&
          posts.map((post, index) => (
            <Post
              user={post.user}
              caption={post.caption}
              image={post.post_urls[0]}
              comments={post.comments}
              retweets={post.retweets}
              datetime={post.createdAt}
              post_id={post._id}
              liked={post.liked}
              likes={post.likes}
              retweeted={post.retweeted}
              saved={post.saved}
            />
          ))*/}
        {!loading && Object.keys(user).length !== 0 && props.searchUser &&
          (
            <Bio
              _bio={user?.bio}
              _imageURL={user?.profile_image}
              _userId={user.username}
              _username={user.username}
            />
          )}
        {!loading && topicPosts.length !== 0 && !props.searchUser &&
          (
            topicPosts.map((post, index) => (
              <Post
                user={post.username}
                datetime={post.date}
                caption={post.message}
                key={index}
              />
            ))
          )}
      </section>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    token: state.token,
    port: state.port,
    searchUser: state.searchUser,
  };
};

export default connect(mapStateToProps, null)(Explore);
