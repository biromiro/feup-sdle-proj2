import React, { Component } from "react";
import "./createtweet.css";
import * as actions from "../../store/action";
import { connect } from "react-redux";
import * as actionTypes from "../../store/actionTypes";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import UserImage from "../../Images/johndoe.png";

class CreateTweet extends Component {
  state = {
    showpermission: false,
    tweet: {
      message: null,
      file: null,
    },
    permission: 1,
    tweetimageURL: null,
    postedTweet: null,
  };

  setPermission = (value) => {
    this.setState({ permission: value });
  };

  componentDidUpdate() {
    if (this.props.postedTweet || !this.props.postedTweet) {
      setTimeout(() => this.setState({ postedTweet: null }), 3000);
    }
  }

  postTweet = (event) => {
    const button = document.querySelector("#tweetButton");
    const textarea = document.querySelector("#tweetMessage");
    textarea.value = '';
    button.disabled = true;
    event.preventDefault();
    const data = this.state.tweet;

    console.log(data)

    let url = `http://localhost:${this.props.port}/snoot`;
    console.log(url)
    axios({
      method: 'post',
      url: url,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    })
      .then((res) => {
        console.log(res)
        button.disabled = false;
        //this.props.navigate(`/${res.username}/${res.id}`);
        this.setState({ postedTweet: true});
      })
      .catch((err) => {
        console.log(err)
        this.setState({ postedTweet: false });
        button.disabled = false;
      });
  };

  setImage = () => {
    const imageurl = URL.createObjectURL(this.state.tweet.file);
    this.setState(() => {
      return { tweetimageURL: imageurl };
    });
  };

  onImageChange = (event) => {
    this.setState(() => {
      return {
        tweet: {
          ...this.state.tweet,
          file: event.target.files[0],
        },
      };
    }, this.setImage);
  };

  setpermission = () => {
    this.setState({ showpermission: !this.state.showpermission });
  };

  handleNewTweet = (event) => {
    this.setState({
      tweet: { ...this.state.tweet, message: event.target.value },
    });
  };

  handleNewTopic = (event) => {
    this.setState({
      tweet: { ...this.state.tweet, topic: event.target.value },
    });
  }

  handleKeyDown(e) {
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
    const limit = 100;
    // In case you have a limitation
    e.target.style.height = `${Math.max(e.target.scrollHeight, limit)}px`;
  }

  render() {
    return (
      <React.Fragment>
        {this.state.postedTweet === true ? (
          <p className="tweetSuccess">Tweet posted successfully.</p>
        ) : null}
        {this.state.postedTweet === false ? (
          <p className="tweetFail">An error occured.</p>
        ) : null}
        <div className="createTweet">
          <p>Say something</p>
          <textarea
                id="tweetTopic"
                placeholder="Topic..."
                className="tweetBox"
                onChange={this.handleNewTopic}
                maxLength="50"
                />
          <div className="newtweetInput">
            <img className="posterImage" src={this.props.imageURL ? this.props.imageURL : UserImage} />
            <div className="tweetbox">
              <textarea
                id="tweetMessage"
                placeholder="What???s happening?"
                className="tweetBox"
                onChange={this.handleNewTweet}
                onKeyDown={this.handleKeyDown}
                maxLength="250"
              />
              <img src={this.state.tweetimageURL} width="100%" />
            </div>
          </div>
          <div className="newtweetIcons">
            <button id="tweetButton" onClick={this.postTweet}>
              Snoot
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    error: state.error,
    postedTweet: state.postedTweet,
    token: state.token,
    port: state.port,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmitTweet: (tweet) => dispatch(actions.postTweet(tweet)),
    onResetPostedTweet: () =>
      dispatch({ type: actionTypes.RESET_POSTED_TWEET }),
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
)(withHooksHOC(CreateTweet));
