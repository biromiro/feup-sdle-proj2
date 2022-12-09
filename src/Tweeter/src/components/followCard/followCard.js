import React, { useEffect, useState } from "react";
import UserProfile from "../userProfile/userProfile";
import "./followCard.css";
import axios from "axios";
import { connect } from "react-redux";

const FollowCard = (props) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let url = `http://localhost:${props.port}/recommendations`;
    axios({
      method: "get",
      url: url,
    })
      .then((res) => {
        console.log(res)
        setUsers(res.data);
      })
      .catch((err) => setError(true));
  }, [props.port]);

  return (
    <section className="suggestedUsers">
      <p>Who to follow</p>
      {users.map((user, index) => (
        <UserProfile
          username={user?.username}
          bio={user?.bio}
          userId={user?.username}
          profile_image={user?.profile_image}
          you_follow={user?.you_follow}
          followers={user?.followers}
          user={user}
          key={index}
        />
      ))}
      {error && (
        <p style={{ display: "flex", justifyContent: "center" }}>
          Sorry, an error occured. Please try again.
        </p>
      )}
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    error: state.error,
    token: state.token,
    port: state.port,
  };
};

export default connect(mapStateToProps, null)(FollowCard);
