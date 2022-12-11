import React from "react";
import "./linksCard.css";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { useState } from "react";
import * as actionTypes from "../../store/actionTypes";
import * as actions from "../../store/action";
import { act } from "react-dom/test-utils";


const LinksCard = (props) => {
  
  let userId = useParams().user_id;
  if (typeof userId === "undefined") {
    userId = props.userId;
  }
  console.log(props.searchUser);

  return (
    <div className="linkCard">
      <input
        type='button'
        className={'link' + (props.searchUser ? ' active' : '')}
        value='User'
        onClick={() => props.onSetUser()}
        key='User'/>
      <input
        type='button'
        className={'link' + (props.searchUser ? '' : ' active')}
        value='Topics'
        onClick={() => props.onSetTopic()}
        key='Topics'/>
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
    searchUser: state.searchUser,
    onSearchChange: state.onSearchChange
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetUser: () => dispatch(actions.searchUser()),
    onSetTopic: () => dispatch(actions.searchTopic()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LinksCard);
