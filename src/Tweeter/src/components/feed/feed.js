import { render } from "@testing-library/react";
import Post from "../post/post";
import React from "react";
import axios from "axios";
import { connect } from "react-redux";
import Spinner from "../spinner/spinner";

class Feed extends React.Component {
  state = {
    tweets: [],
    loading: true,
  };

  componentDidMount() {
    let url = `http://127.0.0.1:${this.props.port}/timeline`;
    axios({
      method: "get",
      url: url,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: this.props.token,
      },
    })
      .then((res) =>{
        this.setState(() => {
          return { tweets: res.data, loading: false };
        })
      }
      )
      .catch((err) => this.setState({ error: true, loading: false }));

    this.interval = setInterval(() => {
      console.log(this.props)
      fetch(`http://127.0.0.1:${this.props.port}/newSnoots`)
      .then((res) => (res.status === 200 ? res.json() : "No posts to show"))
        .then((result) => {
          const newPostsSorted = [...result, ...this.state.tweets].sort((a, b) => a.date < b.date ? 1 : -1);

          const unique = newPostsSorted.filter((value, index, self) =>
          index === self.findIndex((t) => (
            t.id === value.id
          )))

          this.setState(() => {
            return { tweets: unique, loading: false };
          })
        })
        .catch((err) => console.log(err));
    }, 5000);
  }
  
  componentWillUnmount(){
    clearInterval(this.interval)
  }

  render() {
    return (
      <section>
        {this.state.error && (
          <p style={{ display: "flex", justifyContent: "center" }}>
            Sorry, an error occured. Please try again.
          </p>
        )}
        {this.state.tweets.map((post, index) => (
          <Post
            user={post.username}
            caption={post.message}
            image={post.post_urls ? post.post_urls[0] : null}
            comments={post.comments}
            retweets={post.retweets}
            datetime={post.date}
            post_id={post.id}
            liked={post.liked}
            likes={post.likes}
            retweeted={post.retweeted}
            saved={post.saved}
            saves={post.bookmarks}
            key={index}
          />
        ))}
        {this.state.loading && <Spinner />}
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    port: state.port,
    imageURL: state.imageURL,
    username: state.username,
    token: state.token,
    auth: state.auth,
  };
};

export default connect(mapStateToProps, null)(Feed);
