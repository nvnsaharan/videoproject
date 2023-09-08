import React, { useState } from 'react';
import { Button, Modal } from 'antd';
interface LeaveButtonProps {
  onLeaveClick: () => void;
  onEndClick: () => void;
  isHost: boolean;
}

const LeaveButton = (props: LeaveButtonProps) => {
  const { onLeaveClick, onEndClick, isHost } = props;

  const [isModalOpen, setisModalOpen] = useState(false)

  return (<>
       <Button
          className="end-button"
          ghost={true}
          onClick={isHost ? () => setisModalOpen(true) : onLeaveClick}
          title="Leave session">
          Leave Call
        </Button>
        <Modal 
          title="Host Leave" 
          open={isModalOpen}
          onOk={onLeaveClick} 
          onCancel={() => setisModalOpen(false)} 
          footer={[
            <Button type="text" danger onClick={() => setisModalOpen(false)}>
              Cancel
            </Button>,
            <Button danger onClick={onLeaveClick}>
              Leave Meeting
            </Button>,
            <Button
              type="primary" 
              danger
              onClick={onEndClick}
            >
              End Meeting
            </Button>,
          ]}
          >
          Host can end the meeting.
        </Modal>
      </>)
};

export { LeaveButton };
