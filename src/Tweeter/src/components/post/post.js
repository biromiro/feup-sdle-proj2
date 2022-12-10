import React, { useState, useEffect } from "react";
import "./post.css";
import Comment from "../comment/comment";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserImage from "../../Images/johndoe.png";

const Post = (props) => {
  let date = new Date(props.datetime);
  let navigate = useNavigate();

  const [liked, setLiked] = useState(props.liked);
  const [likes, setLikes] = useState(props.likes);
  const [retweeted, setRetweeted] = useState(props.retweeted);
  const [retweets, setretweets] = useState(props.retweets);
  const [saved, setSaved] = useState(props.saved);
  const [saves, setSaves] = useState(props.saves);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentsent] = useState(null);

  const handleComment = (event) => {
    setComment(event.target.value);
  };

  const sendComment = () => {
    setComment("");
    let data = new FormData();
    data.append("caption", comment);
    let url = `https://tweeter-test-yin.herokuapp.com/${props.post_id.$oid}/comments`;
    axios({
      method: "post",
      url: url,
      data: data,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: props.token,
      },
    })
      .then((res) => {
        setCommentsent(!commentSent);
        props.onSendComment(commentSent);
        navigate(`/${props.username}/${props.post_id.$oid}`);
      })
      .catch((err) => console.log(false));
  };

  const likePost = () => {
    setLiked(!liked);
    let url = `https://tweeter-test-yin.herokuapp.com/${props.post_id.$oid}/like`;
    axios({
      method: "get",
      url: url,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: props.token,
      },
    })
      .then((res) => {
        setLiked(res.data.liked);
        setLikes(res.data.likes);
      })
      .catch((err) => setLiked(!liked));
  };

  const retweetPost = () => {
    setRetweeted(!retweeted);
    let url = `https://tweeter-test-yin.herokuapp.com/${props.post_id.$oid}/retweet`;
    axios({
      method: "get",
      url: url,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: props.token,
      },
    })
      .then((res) => {
        setRetweeted(res.data.retweeted);
        setretweets(res.data.retweeted);
      })
      .catch((err) => console.log(err));
  };

  return (
    <article className="post">
      {commentSent === false ? (
        <p className="tweetFail">An error occured. Please try again.</p>
      ) : null}
      <header className="postingDetails">
        <img className="posterImage" src={props.user?.profile_image ? props.user.profile_image : UserImage} />
        <div>
          <Link
            to={`/profile/${props.user}`}
            className="posterName"
          >
            {props.user}
          </Link>
          <p className="postingDate">
            {date.getDate()} {date.toLocaleString("en", { month: "long" })} at{" "}
            {date.getUTCHours()}:{date.getUTCMinutes()}
          </p>
        </div>
      </header>
      <div
        className="tweet"
      >
      {props.caption}

      </div>
      <img className="postImage" src={props.image} />
      {/*<div className="engageLinks">
        <a
          className="engageLink"
          style={retweeted ? { color: "#27AE60" } : { color: "initial" }}
          onClick={retweetPost}
        >
          <span className="material-icons-outlined engageLink">autorenew</span>
          <span>{retweeted ? "Retweeted" : "Retweet"}</span>
        </a>
        <a
          className="engageLink"
          style={liked ? { color: "#EB5757" } : { color: "black" }}
          onClick={likePost}
        >
          <span className="material-icons-outlined engageLink">
            favorite_border
          </span>
          <span>{liked ? "Liked" : "Like"}</span>
        </a>
      </div>*/}
    </article>
  );
};

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    error: state.error,
    token: state.token,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSendComment: (commentSent) =>
      dispatch({ type: "SET_COMMENT", value: commentSent }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Post);
