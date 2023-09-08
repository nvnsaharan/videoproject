/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Video from '../video/video';
import VideoSingle from '../video/video-single';
import VideoNonSAB from '../video/video-non-sab';
import Chat from '../chat/chat';
import './home.scss';

interface HomeProps extends RouteComponentProps {
  meetingEnded: boolean;
  status: string;
  onLeaveOrJoinSession: () => void;
  isSupportGalleryView: boolean;
  galleryViewWithoutSAB: boolean;
}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const [chatVisible, setChatVisible] = useState(false)
  const { status, isSupportGalleryView, galleryViewWithoutSAB, meetingEnded } = props;

  const handleChatDiv = () => {
    setChatVisible(!chatVisible)
  }
  const history = useHistory()
  useEffect(() => {
    if (meetingEnded){
      history.push('/meeting-ended')
    }
  }, [meetingEnded])
  

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
