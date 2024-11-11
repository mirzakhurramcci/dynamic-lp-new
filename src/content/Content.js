import { useState } from "react";
import React from "react";
import ContentCloseBar from "./ContentCloseBar";

const Videos = ({ content }) => {
  // VideoPlay function
  const [isVideoPlay, setisVideoPlay] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(-1);

  const toggleVideoPlay = (data) => {
    setisVideoPlay(true);
    setSelectedVideoId(data - 1);
  };
  const closeHandler = () => {
    setisVideoPlay(false);
  };
  const showIframe = () => {
    if (selectedVideoId < 0) return <> </>;

    const video = content[selectedVideoId];
    return (
      <>
        <ContentCloseBar handleClose={closeHandler} />
        <iframe
          title={video.title}
          className="VideoPlayBox price-points-normal"
          src={video.link}
          height="420"
          width="360"
        ></iframe>
      </>
    );
  };

  return (
    <>
      {isVideoPlay && selectedVideoId > -1 && showIframe()}
      <div className="content-icon">
        {
          // use content State Variable For Get Data Use JavaScript Map Mathod
          content
            ? content.map(function (data) {
                return (
                  // eslint-disable-next-line
                  <a
                    onClick={() => toggleVideoPlay(data.id)}
                    key={data.id}
                    style={{ margin: "15px" }}
                  >
                    <img
                      className="content-icon-img"
                      width={data.dimensions}
                      src={data.thumbnail}
                      alt={data.title}
                      style={{ marginTop: "15px" }}
                    />
                  </a>
                );
              })
            : ""
        }
      </div>
    </>
  );
};
export default Videos;
