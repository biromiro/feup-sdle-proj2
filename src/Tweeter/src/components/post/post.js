import React, { useState} from "react";
import "./post.css";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import UserImage from "../../Images/johndoe.png";

const Post = (props) => {
  let date = new Date(props.datetime);
  const [commentSent] = useState(null);

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
      {props.topic !== "" ? (<div
        className="topic"
      >
        {props.topic}
      </div>) : null }
      <div
        className="tweet"
      >
      {props.caption}

      </div>
      <img className="postImage" src={props.image} />
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
