import { useContext, useRef, useState, useCallback } from 'react';
import { AudioMutedOutlined, CheckOutlined, PushpinOutlined } from '@ant-design/icons';
import type { NetworkQuality } from '@zoom/videosdk';
import { IconFont } from '../../../component/icon-font';
import classNames from 'classnames';
import './avatar.scss';
import { Participant } from '../../../index-types';
import ZoomContext from '../../../context/zoom-context';
import { useHover } from '../../../hooks';
import type { AdvancedFeatureSwitch } from '../video-types';
import { getAntdItem } from './video-footer-utils';
import Avatars from 'react-avatar';
interface AvatarProps {
  participant: Participant;
  participantId: number;
  style?: { [key: string]: string };
  isActive: boolean;
  className?: string;
  volume?: number;
  isUserCameraControlled?: boolean;
  advancedFeature?: AdvancedFeatureSwitch;
  networkQuality?: NetworkQuality;
  onAdvancedFeatureToggle?: (userId: number, key: string) => void;
  setLocalVolume?: (userId: number, volume: number) => void;
  handlePinVideo: Function;
}
const networkQualityIcons = ['bad', 'bad', 'normal', 'good', 'good', 'good'];
const Avatar = (props: AvatarProps) => {
  const {
    participant,
    participantId,
    style,
    isActive,
    className,
    volume,
    advancedFeature,
    isUserCameraControlled,
    networkQuality,
    setLocalVolume,
    onAdvancedFeatureToggle,
    handlePinVideo
  } = props;
  const [isDropdownVisible, setIsDropdownVisbile] = useState(false);
  const { displayName, audio, muted, bVideoOn, userId } = participant;
  const avatarRef = useRef(null);
  const isHover = useHover(avatarRef);
  const zmClient = useContext(ZoomContext);
  const onSliderChange = (value: number) => {
    setLocalVolume?.(userId, value);
  };
  const menu = [];
  if (advancedFeature?.adjustVolumn.enabled) {
    menu.push(
      getAntdItem('Adjust volume locally', 'volume', advancedFeature?.adjustVolumn.toggled && <CheckOutlined />)
    );
  }
  if (advancedFeature?.farEndCameraControl.enabled) {
    menu.push(getAntdItem(isUserCameraControlled ? 'Give up camera control' : 'Control far end camera', 'farend'));
  }
  const onDropDownVisibleChange = useCallback((visible) => {
    setIsDropdownVisbile(visible);
  }, []);
  const onMenuItemClick = ({ key }: { key: string }) => {
    onAdvancedFeatureToggle?.(userId, key);
    setIsDropdownVisbile(false);
  };
  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive }, className)}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
      ref={avatarRef}
    >
      {(bVideoOn || (audio === 'computer' && muted)) && (
        <div className="corner-name">
          {audio === 'computer' && muted && <AudioMutedOutlined style={{ color: '#f00' }} />}
          {bVideoOn && networkQuality !== undefined && (
            <IconFont
              type={`icon-network-${
                networkQualityIcons[
                  Math.min(networkQuality?.downlink ?? Number.MAX_VALUE, networkQuality?.uplink ?? Number.MAX_VALUE)
                ]
              }`}
            />
          )}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn &&
      <div>
        <Avatars name={displayName} />
        <div className="corner-name">
          <span>{displayName}</span>
        </div>
      </div> }
      {isHover &&
         (
          <div className="hover-pin-botton">
            <PushpinOutlined onClick={() => handlePinVideo(participantId)} />
          </div>
      )}
    </div>
  );
};

export default Avatar;
