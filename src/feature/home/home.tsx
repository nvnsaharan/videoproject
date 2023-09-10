/* eslint-disable no-restricted-globals */
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Video from '../video/video';
import VideoSingle from '../video/video-single';
import Chat from '../chat/chat';
import './home.scss';
import zoomContext from '../../context/zoom-context';

interface HomeProps extends RouteComponentProps {
  meetingEnded: boolean;
  status: string;
  onLeaveOrJoinSession: () => void;
  isSupportGalleryView: boolean;
  galleryViewWithoutSAB: boolean;
}
const Home: React.FunctionComponent<HomeProps> = (props) => {
  const [chatVisible, setChatVisible] = useState(false)
  const [chatUser, setChatUser] = useState<Number>(0)
  const { status, isSupportGalleryView, galleryViewWithoutSAB, meetingEnded } = props;

  const zmClient = useContext(zoomContext);

  useEffect(() => {
    const handleTabClose = async (event: { preventDefault: () => void; returnValue: string; }) => {
      event.preventDefault();
      console.log('beforeunload event triggered');
      await zmClient.leave()
      return (event.returnValue =
        'Are you sure you want to exit?');
    };
    window.addEventListener('beforeunload', handleTabClose);
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const handleChatDiv = (userId:Number) => {
    console.log("not else",userId)
    if(userId === 0){
      setChatVisible(false)
      setChatUser(0)
    } else {
      console.log(userId)
      setChatUser(userId)
      setChatVisible(true)
    }
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
      {isSupportGalleryView ? <Video handleChatDiv={handleChatDiv} /> : <VideoSingle handleChatDiv={handleChatDiv} />}
      { zmClient.isHost() ? (chatVisible ? <Chat chatUser={chatUser} /> : "") : "" }
    </>
  );
};
export default Home;
