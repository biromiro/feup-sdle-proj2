import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./bio.css";
import UserImage from "../../Images/johndoe.png";

const Bio = (props) => {
  return (
    <div className="bioComponent">
      <img src={props.imageURL ? props.imageURL : UserImage} />
      <p>{props.username}</p>
      <p>{props.bio}</p>
      <Link to={`/profile/${props.username}`}>View full profile</Link>
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
