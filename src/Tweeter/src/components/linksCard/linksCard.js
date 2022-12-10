import React from "react";
import "./linksCard.css";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";

const LinksCard = (props) => {
  let userId = useParams().user_id;
  if (typeof userId === "undefined") {
    userId = props.userId;
  }

  return (
    <div className="linkCard">
      <NavLink className="link" to={'/explore'}/*to={`/profile/${userId}`}*/>
        Users
      </NavLink>
      <NavLink exact className="link" to={'/explore'}/*to={`/profile/retweets/${userId}`}*/>
        Topics
      </NavLink>
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
  };
};

export default connect(mapStateToProps, null)(LinksCard);
