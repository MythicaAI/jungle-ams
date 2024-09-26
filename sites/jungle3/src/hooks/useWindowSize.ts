import React from "react";

export const useWindowSize = () => {
  const [currentWidth, setCurrentWidth] = React.useState(window.innerWidth);
  const [currentHeight, setCurrentHeight] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
      setCurrentHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    currentWidth,
    currentHeight,
  };
};
