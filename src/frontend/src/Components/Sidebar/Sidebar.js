import React from 'react';
import './Sidebar.css'
import TouchAppIcon from '@mui/icons-material/TouchApp';
import HomeIcon from '@mui/icons-material/Home';
import TagIcon from '@mui/icons-material/Tag';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import Sideitem from './Sideitem/Sideitem';

function Sidebar() {
  return (
    <>
      <div className="sidebar">
          <div className="logo">
            <TouchAppIcon />
          </div>
          <Sideitem Icon={HomeIcon} Name="Home" active />
          <Sideitem Icon={TagIcon} Name="Explore" />
          <Sideitem Icon={NotificationsNoneIcon} Name="Notifications" />
          <Sideitem Icon={MailOutlinedIcon} Name="Messages" />
          <Sideitem Icon={BookmarkBorderOutlinedIcon} Name="Bookmarks" />
          <Sideitem Icon={FormatListBulletedOutlinedIcon} Name="Lists" />
          <Sideitem Icon={PersonOutlineOutlinedIcon} Name="Profile" />
          <Sideitem Icon={MoreHorizOutlinedIcon} Name="More" />
          <button className="boop">Boop!</button>
      </div>
    </>
  );
}

export default Sidebar