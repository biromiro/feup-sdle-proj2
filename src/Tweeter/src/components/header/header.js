import React, { useState } from "react";
import "./header.css";
import Tweeter from "../../Images/snooter.png";
import UserImage from "../../Images/johndoe.png";
import ProfileDropdown from "../profilebackdrop/profilebackdrop";
import { Link, NavLink } from "react-router-dom";
import { connect } from "react-redux";

const Header = (props) => {
  const [showDropdown, setshowDropdown] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="homePage">
        <img src={Tweeter} className="tweeter" />
        {/* <h1 className="appName">Tweeter</h1> */}
      </Link>
      <nav className="navBar">
        <NavLink className="navLink" to="/">
          Home
        </NavLink>
        <NavLink className="navLink" to="/explore">
          Explore
        </NavLink>
      </nav>
      <div className="userProfile">
        <a
          className="userSummary"
          onClick={() => setshowDropdown(!showDropdown)}
        >
          <img src={props.imageURL ? props.imageURL : UserImage} className="userImage" />
          <a className="username">{props.username}</a>
        </a>
        {showDropdown ? <ProfileDropdown /> : null}
      </div>
    </header>
  );
};

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    error: state.error,
  };
};

export default connect(mapStateToProps, null)(Header);
