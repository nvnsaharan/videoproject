import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import classNames from 'classnames';
import { UpOutlined } from '@ant-design/icons';
import { IconFont } from '../../../component/icon-font';
import { getAntdDropdownMenu, getAntdItem } from './video-footer-utils';
const { Button: DropdownButton } = Dropdown;
const { Item: MenuItem } = Menu;
interface LeaveButtonProps {
  onLeaveClick: () => void;
  onEndClick: () => void;
  isHost: boolean;
}

const LeaveButton = (props: LeaveButtonProps) => {
  const { onLeaveClick, onEndClick, isHost } = props;

  return <Button
          className="end-button"
          ghost={true}
          onClick={onLeaveClick}
          title="Leave session"
        >Leave Call</Button>
};

export { LeaveButton };
