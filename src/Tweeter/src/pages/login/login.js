import React from "react";
import Tweeter from "../../Images/tweeter.svg";
import "./login.css";
import Auth from "../../components/auth/auth";
import Loader from "../../components/loader/loader";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import * as actions from "../../store/action";
import { useNavigate, useLocation } from "react-router-dom";

class LoginPage extends React.Component {
  state = {
    error: false,
    requestBody: {
      username: "",
      password: "",
    },
  };

  inputChangedHandler = (event) => {
    const updatedFormBody = {
      ...this.state.requestBody,
    };
    updatedFormBody[event.target.name] = event.target.value;
    this.setState({ requestBody: updatedFormBody });
  };

  submitHandler = (event) => {
    event.preventDefault();
    const formdata = this.state.requestBody;
    //this.props.onAuth(formdata["username"], formdata["password"]);
    this.props.onAuth(formdata["username"]);
  };

  componentDidUpdate() {
    if (this.props.error) {
      setTimeout(this.props.onResetError, 2000);
    }
    if (this.props.auth) {
      // setTimeout(() => this.props.logout, 1000);
      if (this.props.location.state?.from) {
        this.props.navigate(this.props.location.state.from);
      }
    }
  }

  render() {
    let errorMessage = <p style={{ color: "red" }}>{this.props.error}</p>;
    return (
      <Auth>
        {this.props.loading ? <Loader /> : null}
        <div className="signupPage">
          <Link to="/">
            <img src={Tweeter} className="tweeterHome" />
          </Link>
          <p>Join thousands of tweeps from around the world </p>
          <p>Happening now. Join Tweeter today.</p>
          {errorMessage}
          <form onSubmit={this.submitHandler}>
            <i className="material-icons-outlined">person</i>
            <input
              name="username"
              type="username"
              placeholder="Username"
              onMouseOver={() => this.setState({ focus: { username: true } })}
              onChange={this.inputChangedHandler}
            />
            {/*<i className="material-icons-outlined">lock</i>
            <input
              name="password"
              type="password"
              placeholder="Password"
              onMouseOver={() => this.setState({ focus: { password: true } })}
              onMouseLeave={() => this.setState({ focus: { password: false } })}
              onChange={this.inputChangedHandler}
            />
    <button>Start tweeting now</button>*/}
          </form>
          {/* <div>
          {/* <p>or continue with these social profile</p> */}
          {/* <i class="fa fa-google"></i>
                <i class="fa fa-facebook"></i>
                <i class="fa fa-twitter"></i>
                <i class="fa fa-github"></i> 
        </div> 
          <p>
            Don't have an account yet? <Link to="/signup">Register</Link>
          </p>*/}
        </div>
      </Auth>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    loading: state.loading,
    error: state.error,
    auth: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAuth: (username) => dispatch(actions.auth(username, false)),
    onResetError: () => dispatch({ type: "RESET_ERROR" }),
    logout: () => dispatch({ type: "SET_LOGOUT" }),
  };
};

const withHooksHOC = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    return <Component navigate={navigate} location={location} {...props} />;
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withHooksHOC(LoginPage));