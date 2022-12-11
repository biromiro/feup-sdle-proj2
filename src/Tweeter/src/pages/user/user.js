import React from "react";
import UserHeader from "../../components/userHeader/userHeader";
import ProfileCard from "../../components/profileCard/profileCard";
import Container from "../../components/container/container";
import Header from "../../components/header/header";
import ProfileContainer from "../../components/profileContainer/profileContainer";
import Tweets from "../../components/tweets/tweets";
import { useParams } from "react-router-dom";


const User = props => {
  
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

export default User;
