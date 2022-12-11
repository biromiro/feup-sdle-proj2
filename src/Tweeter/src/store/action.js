import axios from "axios";
import * as actionTypes from "./actionTypes";

export const searchUser = () => {
  return {
    type: actionTypes.SEARCH_USER,
  };
};

export const searchTopic = () => {
  return {
    type: actionTypes.SEARCH_TOPIC,
  };
};

export const authStart = () => {
  return {
    type: actionTypes.AUTH_START,
  };
};

export const authSuccess = (res) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    token: 'ok',
    //userId: res._id,
    //imageURL: res.profile_image,
    username: res.username,
    //bio: res.bio,
    port: res.port,
  };
};

export const saveSuccess = (res) => {
  return {
    type: actionTypes.SAVE_SUCCESS,
    //imageURL: res.profile_image,
    username: res.username,
    //bio: res.bio,
    message: res.message,
    port: res.port,
  };
};

export const saveDetails = (details) => {
  const button = document.querySelector("#saveDetails");
  return (dispatch, getState) => {
    let url = `http://127.0.0.1:${getState().port}/saveProfile`;
    axios
      .post(url, details)
      .then((response) => {
        dispatch(saveSuccess(response.data));
        button.disabled = false;
      })
      .catch((error) => {
        dispatch(authFail(error.message));
        button.disabled = false;
      });
  };
};

export const authFail = (error) => {
  return {
    type: actionTypes.AUTH_FAIL,
    error: error,
  };
};

export const auth = (username, method) => {
  return (dispatch) => {
    dispatch(authStart());
    const authData = {
      username: username,
    };
    let url = "http://127.0.0.1:3001/get-node";
    axios
      .post(url, authData)
      .then((response) => {
        if (response.status === 400 || response.status === 500){
          throw response
        } 
        else{
          console.log(response.data)
          dispatch(authSuccess(response.data));
        }
      })
      .catch((error) => {
        console.log(error)
        dispatch(authFail(error.response.data.message));
      });
  };
};

export const postTweet = (tweet) => {
  return (dispatch, getState) => {
    let url = `http://127.0.0.1:${getState().port}/snoot`;
    axios({
      method: "post",
      url: url,
      data: tweet,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then(dispatch({ type: actionTypes.TWEET_SUCCESS }))
      .catch(dispatch({ type: actionTypes.TWEET_FAIL }));
  };
};
