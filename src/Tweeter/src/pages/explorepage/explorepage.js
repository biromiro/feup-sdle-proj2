import React from "react";
import Container from "../../components/container/container";
import SideBar from "../../components/sidebar/sidebar";
import HomeContainer from "../../components/homeContainer/homeContainer";
import Header from "../../components/header/header";
import Explore from "../../components/explore/explore";
import LinksCard from "../../components/linksCard/linksCard";

const ExplorePage = (props) => {
  return (
    <div>
      <Header />
      <Container>
        <SideBar>
          <LinksCard />
        </SideBar>
        <HomeContainer>
          <Explore />
        </HomeContainer>
      </Container>
    </div>
  );
};

export default ExplorePage;
