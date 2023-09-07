/* eslint-disable no-restricted-globals */
import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Video from '../video/video';
import VideoSingle from '../video/video-single';
import VideoNonSAB from '../video/video-non-sab';
import Chat from '../chat/chat';
import './home.scss';

interface HomeProps extends RouteComponentProps {
  status: string;
  onLeaveOrJoinSession: () => void;
  isSupportGalleryView: boolean;
  galleryViewWithoutSAB: boolean;
}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const [chatVisible, setChatVisible] = useState(false)
  const { status, isSupportGalleryView, galleryViewWithoutSAB } = props;

  const handleChatDiv = () => {
    setChatVisible(!chatVisible)
  }

  let actionText;
  if (status === 'connected') {
    actionText = 'Leave';
  } else if (status === 'closed') {
    actionText = 'Join';
  }
  return (
    <>
      {isSupportGalleryView ? <Video handleChatDiv={handleChatDiv} /> : galleryViewWithoutSAB ? <VideoNonSAB handleChatDiv={handleChatDiv} /> : <VideoSingle handleChatDiv={handleChatDiv} />}
      { chatVisible ? <Chat /> : "" }
      
    </>
  );
};
export default Home;
