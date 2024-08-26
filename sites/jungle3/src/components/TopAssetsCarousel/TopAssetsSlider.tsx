import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider, { CustomArrowProps } from "react-slick";
import { Box } from "@mui/joy";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { AssetTopResponse } from "../../types/apiTypes";
import { PackageViewCard } from "../PackageViewCard";

import "./slickCarousel.css";

const NextArrow: React.FC<CustomArrowProps> = ({ onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "absolute",
        right: "10px",
        top: "10px",
        zIndex: "1",
        cursor: "pointer",
        bgcolor: "white",
        display: "flex",
        borderRadius: "50%",
        padding: "3px",
      }}
    >
      <LucideChevronRight />
    </Box>
  );
};

const PrevArrow: React.FC<CustomArrowProps> = ({ onClick }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        left: "10px",
        top: "10px",
        zIndex: "1",
        cursor: "pointer",
        display: "flex",
        bgcolor: "white",
        borderRadius: "50%",
        padding: "3px",
      }}
      onClick={onClick}
    >
      <LucideChevronLeft />
    </Box>
  );
};

type Props = {
  assets: AssetTopResponse[];
};

export const TopAssetsSlider: React.FC<Props> = ({ assets }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  return assets && assets.length > 0 ? (
    <Box component="div" className="slider-container">
      <Slider {...settings}>
        {assets.map((asset) => (
          <Box key={asset.asset_id}>
            <PackageViewCard
              sxStyles={{
                minHeight: "200px",
                justifyContent: "flex-end",
              }}
              av={asset}
              isTopAsset
            />
          </Box>
        ))}
      </Slider>
    </Box>
  ) : null;
};
