import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./bio.css";
import UserImage from "../../Images/johndoe.png";

const Bio = (props) => {
  return (
    <div className="bioComponent">
      <img src={props._imageURL ? props._imageURL : UserImage} />
      <p>{props._username ? props._username : props.username}</p>
      <p>{props._bio ? props._bio : props.bio}</p>
      <Link to={`/profile/${props._username ? props._username : props.username}`}>View full profile</Link>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    bio: state.bio,
    userId: state.userId,
  };
};

export default connect(mapStateToProps, null)(Bio);
