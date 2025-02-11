import { Box } from "@mui/joy";
import { TagCard } from "@components/TagCard";
import Slider, { CustomArrowProps } from "react-slick";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { Tag } from "@queries/tags/types";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../TopAssetsCarousel/slickCarousel.css";
import React from "react";

type Props = {
  tags: Tag[];
  selectedTag: string;
  handleChangeTag: (value: string) => void;
};

const NO_FILTERING_TAG = {
  name: "All assets",
  tag_id: "all_assets",
  owner_id: "",
  created: "",
  contents: null,
  page_priority: null,
};

const NextArrow: React.FC<CustomArrowProps & { isDisabled: boolean }> = ({
  onClick,
  isDisabled,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "absolute",
        right: "-40px",
        top: "15px",
        zIndex: "1",
        cursor: isDisabled ? "default" : "pointer",
        bgcolor: "#fff",
        display: "flex",
        borderRadius: "50%",
        padding: "3px",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      <LucideChevronRight color="#0b0d0e" />
    </Box>
  );
};

const PrevArrow: React.FC<CustomArrowProps & { isDisabled: boolean }> = ({
  onClick,
  isDisabled,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        left: "-40px",
        top: "15px",
        zIndex: "1",
        cursor: isDisabled ? "default" : "pointer",
        display: "flex",
        bgcolor: "#fff",
        borderRadius: "50%",
        padding: "3px",
        opacity: isDisabled ? 0.5 : 1,
      }}
      onClick={onClick}
    >
      <LucideChevronLeft color="#0b0d0e" />
    </Box>
  );
};

export const TagsPanel: React.FC<Props> = ({
  tags,
  selectedTag,
  handleChangeTag,
}) => {
  const sliderRef = React.useRef<Slider>(null);
  const [isPrevDisabled, setIsPrevDisabled] = React.useState(true);
  const [isNextDisabled, setIsNextDisabled] = React.useState(false);

  const handleBeforeChange = (_: number, newIndex: number) => {
    if (sliderRef.current) {
      //@ts-ignore
      const totalSlides = sliderRef.current.innerSlider.state.slideCount;
      setIsPrevDisabled(newIndex === 0);
      setIsNextDisabled(newIndex === totalSlides - 1);
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    initialSlide: 0,
    nextArrow: <NextArrow isDisabled={isNextDisabled} />,
    prevArrow: <PrevArrow isDisabled={isPrevDisabled} />,
    beforeChange: handleBeforeChange,
    variableWidth: true,
  };

  return tags && tags.length > 0 ? (
    <Box component="div" className="slider-container" p="0 40px">
      <Slider ref={sliderRef} {...settings}>
        {tags
          .filter((tag) => tag?.page_priority !== 0)
          .sort((a, b) => (b?.page_priority ?? 0) - (a?.page_priority ?? 0))
          .map((tag) => (
            <Box key={tag.tag_id} onClick={() => handleChangeTag(tag.name)}>
              <TagCard tag={tag} selectedTag={selectedTag} />
            </Box>
          ))}
        <Box onClick={() => handleChangeTag(NO_FILTERING_TAG.name)}>
          <TagCard tag={NO_FILTERING_TAG} selectedTag={selectedTag} />
        </Box>
      </Slider>
    </Box>
  ) : null;
};
