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

  const doctorConsultationLines = [
    "Hello, I'm Naveen, how can I help you today?",
    "Please tell me more about your symptoms and when they started.",
    "Have you experienced any changes in your medical history since our last visit?",
    "Let's discuss any medications or treatments you're currently using.",
    "Are you experiencing any pain or discomfort? If so, please describe it.",
    "It's important to understand your concerns fully, so please feel free to ask any questions.",
    "Based on your symptoms, I'm considering [possible diagnosis].",
    "Here are the treatment options available, and we can discuss the pros and cons of each.",
    "Let's create a personalized care plan tailored to your needs and preferences.",
    "Remember, I'm here to support you, so don't hesitate to reach out if you have any concerns or if your condition changes."
  ];

  const { advancedSwitch, toggleAdjustVolume, toggleFarEndCameraControl } = useAdvancedFeatureSwitch(
    zmClient,
    mediaStream,
    visibleParticipants
  );
  const networkQuality = useNetworkQuality(zmClient);
  const [infoDivVisible, setInfoDivVisible] = useState(false)

  const handleInfoDivVisible = () => {
    setInfoDivVisible(!infoDivVisible)
  }

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
      <div
        className={classnames('share-container', {
          'in-sharing': isSharing
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${shareViewDimension.width}px`,
            height: `${shareViewDimension.height}px`
          }}
        >
          <canvas className={classnames('share-canvas', { hidden: isStartedShare })} ref={shareRef} />
          {mediaStream?.isStartShareScreenWithVideoElement() ? (
            <video
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames('share-canvas', {
                hidden: isRecieveSharing
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames('video-container', {
          'in-sharing': isSharing
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
      <VideoFooter handleChatDiv={props.handleChatDiv} handleInfoDivVisible={handleInfoDivVisible} className="video-operations" sharing shareRef={selfShareRef} />
      {infoDivVisible ? 
        <Draggable>
          <div>
            {doctorConsultationLines.map((line, index) => <div className='suggested-text' key={index}>{line}</div>)}
          </div>
        </Draggable> : ""}
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
