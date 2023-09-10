import React, { useCallback, useContext, useState } from 'react'
import { useParticipantsChange } from '../video/hooks/useParticipantsChange';
import zoomContext from '../../context/zoom-context';
import { ZoomClient, MediaStream, Participant } from '../../index-types';
import { Button, Tooltip } from 'antd';
import Avatars from 'react-avatar';
import './SideParticipentBar.scss'

interface Props {
  handlePinVideo: Function;
  pinnedVideo: Number;
}
const SideParticipentBar : React.FunctionComponent<Props> = (props) => {
  const {handlePinVideo, pinnedVideo} = props
  const zmClient = useContext(zoomContext);
  const [participentList, setParticipentList] = useState<Participant[]>([])

  const onParticipantsChange = useCallback(
    (participants: Participant[]) => {
      const currentUser = zmClient.getCurrentUserInfo();
      if (currentUser && participants.length > 0) {
        setParticipentList(participants)
      }
    },
    [zmClient]
  );
  useParticipantsChange(zmClient, onParticipantsChange);
  return (
    <div className='sidebar-list'>
      {
        participentList.map((user) => (
          user.userId !== pinnedVideo ?
            <Tooltip key={user.userId} placement="right" title={user.displayName}>
              <Button onClick={() => handlePinVideo(user.userId)} className='side-bar-button'>
                <Avatars className='side-bar-avatar' name={user.displayName} />
              </Button>
            </Tooltip>
          :
            <Tooltip key={user.userId} placement="right" title={user.displayName}>
              <Button onClick={() => handlePinVideo(user.userId)} className='side-bar-button side-bar-button-border'>
                <Avatars className='side-bar-avatar' name={user.displayName} />
              </Button>
            </Tooltip>
        ))
      }
      
    </div>
  )
}

export default SideParticipentBar