import React from "react";
import { Link } from "react-router-dom";
import "./profilebackdrop.css";
import { connect } from "react-redux";

const ProfileDropdown = (props) => {
  return (
    <div className="profileDropdown">
      <React.Fragment>
        <Link className="dropdownLink" to={`/profile/tweets/${props.username}`}>
          <span className="material-icons-outlined">account_circle</span>
          My Profile
        </Link>
        <Link to="/settings" className="dropdownLink">
          <span className="material-icons-outlined">settings</span>Settings
        </Link>
      </React.Fragment>
      <Link to="/" className="dropdownLink logout" onClick={props.logout}>
        <span className="material-icons-outlined">logout</span>Logout
      </Link>
    </div>
  );
};

let port = undefined;

const mapStateToProps = (state) => {
  port = state.port;
  return {
    userId: state.userId,
    username: state.username,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => {
      dispatch({ type: "SET_LOGOUT" })
      fetch(`http://localhost:${port}/logout`, {
        method: "POST",
        credentials: "include",
      })
        .then((res) => {
          console.log(res)
          if (res.success) {
            dispatch({ type: "SET_LOGOUT" })
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDropdown);
