import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import ZoomContext from '../../context/zoom-context';
import ZoomMediaContext from '../../context/media-context';
import Avatar from './components/avatar';
import VideoFooter from './components/video-footer';
import Pagination from './components/pagination';
import { useCanvasDimension } from './hooks/useCanvasDimension';
import { useGalleryLayout } from './hooks/useGalleryLayout';
import { usePagination } from './hooks/usePagination';
import { useActiveVideo } from './hooks/useAvtiveVideo';
import { useShare } from './hooks/useShare';
import { useLocalVolume } from './hooks/useLocalVolume';
import './video.scss';
import { isShallowEqual } from '../../utils/util';
import { useSizeCallback } from '../../hooks/useSizeCallback';
import { useAdvancedFeatureSwitch } from './hooks/useAdvancedFeatureSwith';
import RemoteControlPanel, { RemoteControlIndication } from './components/remote-control';
import { useCameraControl } from './hooks/useCameraControl';
import { useNetworkQuality } from './hooks/useNetworkQuality';
import Draggable from 'react-draggable';
import SideParticipentBar from '../sidebar/SideParticipentBar';

interface  VideoContainerProps{
  handleChatDiv: Function;
}

const VideoContainer: React.FunctionComponent<VideoContainerProps> = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady }
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0
  });
  const [pinnedVideo, setPinnedVideo] = useState<Number>(0)

  const handlePinVideo = (userId : Number) => {
    if(pinnedVideo == userId){
      setPinnedVideo(0)
      props.handleChatDiv(0)
    } else {
      console.log(userId)
      props.handleChatDiv(userId)
      setPinnedVideo(userId)
    }
  }
  
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize
    }
  );
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);

  const { userVolumeList, setLocalVolume } = useLocalVolume();
  const {
    isControllingFarEnd,
    currentControlledUser,
    isInControl,
    giveUpControl,
    stopControl,
    turnDown,
    turnRight,
    turnLeft,
    turnUp,
    zoomIn,
    zoomOut,
    switchCamera
  } = useCameraControl(zmClient, mediaStream);

  const { advancedSwitch, toggleAdjustVolume, toggleFarEndCameraControl } = useAdvancedFeatureSwitch(
    zmClient,
    mediaStream,
    visibleParticipants
  );
  const networkQuality = useNetworkQuality(zmClient);

  const isSharing = isRecieveSharing || isStartedShare;
  useEffect(() => {
    if (isSharing && shareContainerRef.current) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerDimension;
      const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
      setShareViewDimension({
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio)
      });
    }
  }, [isSharing, sharedContentDimension, containerDimension]);

  const onShareContainerResize = useCallback(({ width, height }) => {
    _.throttle(() => {
      setContainerDimension({ width, height });
    }, 50)();
  }, []);
  useSizeCallback(shareContainerRef.current, onShareContainerResize);
  useEffect(() => {
    if (!isShallowEqual(shareViewDimension, sharedContentDimension)) {
      mediaStream?.updateSharingCanvasDimension(shareViewDimension.width, shareViewDimension.height);
    }
  }, [mediaStream, sharedContentDimension, shareViewDimension]);
  const onAdvancedFeatureToggle = useCallback(
    (userId: number, key: string) => {
      if (key === 'volume') {
        toggleAdjustVolume(userId);
      } else if (key === 'farend') {
        if (isControllingFarEnd) {
          giveUpControl();
        } else {
          mediaStream?.requestFarEndCameraControl(userId);
        }
        // toggleFarEndCameraControl(userId);
      }
    },
    [toggleAdjustVolume, giveUpControl, mediaStream, isControllingFarEnd]
  );
  return (
    <div className="viewport">
      {zmClient.isHost() ? 
        <SideParticipentBar 
        handlePinVideo={handlePinVideo}
        pinnedVideo={pinnedVideo}
        />  : ""}
      {/* <div
        className={classnames('share-container', {
          'in-sharing': pinnedVideo
        })}
      >
          <canvas className={classnames('share-canvas')} ref={shareRef} />
          {visibleParticipants.map((user, index) => {
            if(user.userId === pinnedVideo){
              if (index > videoLayout.length - 1) {
                return null;
              }
              return (
                <Avatar
                  participant={user}
                  participantId={user.userId}
                  handlePinVideo={handlePinVideo}
                  key={user.userId}
                  isActive={activeVideo === user.userId}
                  volume={userVolumeList.find((u) => u.userId === user.userId)?.volume}
                  setLocalVolume={setLocalVolume}
                  advancedFeature={advancedSwitch[`${user.userId}`]}
                  onAdvancedFeatureToggle={onAdvancedFeatureToggle}
                  isUserCameraControlled={isControllingFarEnd}
                  networkQuality={networkQuality[`${user.userId}`]}
                />
              )
            }
          })}
      </div> */}
      <div
        className={classnames('video-container', {
          // 'in-sharing': pinnedVideo
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            const { width, height, x, y } = dimension;
            const { height: canvasHeight } = canvasDimension;
            return (
              <Avatar
                participant={user}
                participantId={user.userId}
                handlePinVideo={handlePinVideo}
                key={user.userId}
                isActive={activeVideo === user.userId}
                volume={userVolumeList.find((u) => u.userId === user.userId)?.volume}
                setLocalVolume={setLocalVolume}
                advancedFeature={advancedSwitch[`${user.userId}`]}
                onAdvancedFeatureToggle={onAdvancedFeatureToggle}
                isUserCameraControlled={isControllingFarEnd}
                networkQuality={networkQuality[`${user.userId}`]}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`
                }}
              />
            );
          })}
        </ul>
      </div>
      <VideoFooter handleChatDiv={props.handleChatDiv} className="video-operations" sharing shareRef={selfShareRef} />
      {isControllingFarEnd && (
        <RemoteControlPanel
          turnDown={turnDown}
          turnLeft={turnLeft}
          turnRight={turnRight}
          turnUp={turnUp}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          switchCamera={switchCamera}
          controlledName={currentControlledUser.displayName}
        />
      )}
      {isInControl && <RemoteControlIndication stopCameraControl={stopControl} />}
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isSharing} />}
    </div>
  );
};

export default VideoContainer;
