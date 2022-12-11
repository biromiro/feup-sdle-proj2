import * as actionTypes from "./actionTypes";

let initialState = {
  auth: false,
  token: null,
  userId: null,
  loading: false,
  error: null,
  imageURL: null,
  bio: null,
  username: null,
  successMessage: null,
  email: null,
  postedTweet: null,
  port: null,
  searchUser: true,
};

const Reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SEARCH_USER:
      return {
        ...state,
        searchUser: true,
      };
    case actionTypes.SEARCH_TOPIC:
      return {
        ...state,
        searchUser: false,
      }
    case actionTypes.AUTH_START:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        token: action.token,
        auth: true,
        userId: action.userId,
        imageURL: action.imageURL,
        username: action.username,
        bio: action.bio,
        email: action.email,
        port: action.port,
      };
    case actionTypes.AUTH_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case actionTypes.SAVE_SUCCESS:
      return {
        ...state,
        imageURL: action.imageURL,
        username: action.username,
        bio: action.bio,
        email: action.email,
        message: action.message,
        port: action.port,
      };

    case actionTypes.RESET_POSTED_TWEET:
      return {
        ...state,
        postedTweet: null,
      };

    case actionTypes.TWEET_SUCCESS:
      return {
        ...state,
        postedTweet: true,
      };
    case actionTypes.TWEET_FAIL:
      return {
        ...state,
        postedTweet: false,
      };

    case actionTypes.RESET_ERROR:
      return {
        ...state,
        error: null,
      };
    case actionTypes.SET_LOGOUT:
      return {
        initialState,
      };
    case "SET_COMMENT":
      return {
        ...state,
        commentSent: action.value,
      };
    default:
      return state;
  }
};

export default Reducer;
