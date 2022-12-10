import axios from "axios";
import React, { useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import HeaderImage from "../../Images/traveller.jpg";
import "./userProfile.css";

const UserProfile = (props) => {
  const [youfollow, setYoufollow] = useState(props.you_follow);

  const handleFollow = () => {
    let url = `http://localhost:${props.port}/follow/${props.username}`;
    if (youfollow) {
      url = `http://localhost:${props.port}/unfollow/${props.username}`;
    }
    axios
      .put(url)
      .then((response) => {
        console.log(response)
        setYoufollow(!youfollow);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <section className="suggestedUserProfile">
      <div>
        <img src={props.profile_image ?  props.profile_image : HeaderImage}></img>
        <div>
          <Link to={`/profile/${props.username}`}>{props.username}</Link>
        </div>
        <button onClick={handleFollow}>
          {youfollow ? "Following" : "Follow"}
        </button>
      </div>
      <p>{props.bio}</p>
      {/* <img src={HeaderImage}/> */}
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    port: state.port,
  };
};

export default connect(mapStateToProps, null)(UserProfile);
