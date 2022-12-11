import HomePage from "./pages/homePage/homePage";
import ExplorePage from "./pages/explorepage/explorepage";
import LoginPage from "./pages/login/login";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SignupPage from "./pages/auth/signup";
import { connect } from "react-redux";
import User from "./pages/user/user";
import React from "react";

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    refresh: () => dispatch({ type: "REFRESH" }),
  };
};

const Tweeter = (props) => {
  let location = useLocation();

  return (
    <Routes>
      <Route path="register" element={<Navigate to="/signup" />} />
      {
        props.auth ? <Route path="signup" element={<Navigate to="/settings"/>} />
        :
        <Route path="signup" element={<SignupPage />} />

      }
      {props.auth ? (
        <Route exact path="/" element={<HomePage />} />
      ) : (
        <Route
          path="/"
          element={<Navigate to="/signin" state={{ from: location }} />}
        />
      )}
      {props.auth ? (
        <Route path="/explore" element={<ExplorePage />} />
      ) : (
        <Route
          path="/explore"
          element={<Navigate to="/signin" state={{ from: location }} />}
        />
      )}
      {props.auth ? (
        <Route
          path="/login"
          element={<Navigate to="/" replace state={{ from: location }} />}
        />
      ) : (
        <Route path="/login" element={<LoginPage />} />
      )}
      {props.auth ? (
        <Route
          path="/profile/:user_id"
          element={<User />}
          key={location.key}
        />
      ) : (
        <Route
          path="/profile/:user_id"
          element={<Navigate to="/signin" replace state={{ from: location }} />}
        />
      )}
      <Route path="/signin" element={<LoginPage />} />
      <Route />
    </Routes>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Tweeter);
