import React, { useEffect, useState } from "react";
import "./profileCard.css";
import { connect } from "react-redux";
import axios from "axios";
import {
  useParams,
  useSearchParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Spinner from "../spinner/spinner";
import UserImage from "../../Images/johndoe.png";

const ProfileCard = (props) => {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [profile_image, setprofile_image] = useState("");
  const [bio, setBio] = useState("");
  const username = useParams().user_id;
  const self = props.username === username;
  const port = props.port;
  const [youfollow, setYoufollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleFollow = () => {
    let url = `http://localhost:${port}/follow/${username}`;
    if (youfollow) {
      url = `http://localhost:${port}/unfollow/${username}`;
    }
    axios
      .put(url)
      .then((response) => {
        console.log(response)
        if (youfollow) {
          setFollowers(followers - 1);
        } else {
          setFollowers(followers + 1);
        }
        setYoufollow(!youfollow);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    let url = `http://localhost:${port}/profile/${username}`;
    axios
      .get(url)
      .then((response) => {
        console.log(response)
        setFollowers(response.data.profile_info.followers.length);
        setFollowing(response.data.profile_info.following.length);
        setprofile_image(response.data.profile_image);
        setBio(response.data.bio);
        setYoufollow(response.data.you_follow);
        setLoading(false);
      })
      .catch((error) => {
        setError(true);
      });
  }, [username, port]);
  
  return (
    <div className="profileCard">
      {loading && !error && <Spinner />}
      {error && (
        <p style={{ display: "flex", justifyContent: "center" }}>
          Sorry, an error occured. Please try again.
        </p>
      )}
      {!loading && (
        <React.Fragment>
          <img className="profileImage" src={profile_image ? profile_image : UserImage} />
          <div className="Bio">
            <div className="flexDisplay">
              <p className="userName">{username}</p>
              <p className="stats">
                <span className="amount">{following}</span> following
              </p>
              <p className="stats">
                <span className="amount">{followers}</span> followers
              </p>
            </div>
            <p className="about">{bio}</p>
          </div>
          {!self && (
            <button className="followButton" onClick={handleFollow}>
              {youfollow ? "Following" : "Follow"}
            </button>
          )}
        </React.Fragment>
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    bio: state.bio,
    token: state.token,
    userId: state.userId,
    port: state.port,
  };
};

export default connect(mapStateToProps, null)(ProfileCard);
