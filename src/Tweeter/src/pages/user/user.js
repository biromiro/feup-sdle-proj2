import React, { useEffect } from "react";
import UserHeader from "../../components/userHeader/userHeader";
import ProfileCard from "../../components/profileCard/profileCard";
import Container from "../../components/container/container";
import Header from "../../components/header/header";
import LinksCard from "../../components/linksCard/linksCard";
import ProfileContainer from "../../components/profileContainer/profileContainer";
import SideBar from "../../components/sidebar/sidebar";
import Tweets from "../../components/tweets/tweets";
import { useParams } from "react-router-dom";
import Media from "../../components/tweets/media";
import Likes from "../../components/tweets/likes";
import Retweets from "../../components/tweets/retweets";


const User = props => {
  let exact = useParams().exact;
  
  return (
    <div>
      <Header />
      <UserHeader>
        <ProfileCard username={useParams().user_id}/>
      </UserHeader>
      <Container>
        <ProfileContainer>
          <Tweets/>
        </ProfileContainer>
      </Container>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    imageURL: state.imageURL,
    username: state.username,
    bio: state.bio,
  };
};

export default User;
