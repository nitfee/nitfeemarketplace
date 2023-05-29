import React, { FC } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Card from "../Card";
import { useRouter } from "next/router";

interface INftCarouselProps {
  listing?:
    | {
        name: string | number | null | undefined;
        price: string | number | null | undefined;
        symbol: string;
        user: string;
        image: string | null | undefined;
      }[]
    | any;
}

const NftCarousel: FC<INftCarouselProps> = ({ listing }) => {
  const { push } = useRouter();

  return (
    <Slider
      {...settings}
      className="grid grid-rows-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
    >
      {listing?.map((item: any) => (
        <Card
          key={item.name}
          name={item.name}
          price={item.buyoutPricePerToken}
          symbol={"CFX"}
          user={"@user"}
          image={item.image}
          listerId={item.seller}
          onClick={() => push(`/listing/${item.listingId}`)}
          soldOut={item.soldAt || false}
        />
      ))}
    </Slider>
  );
};

export default NftCarousel;
const settings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 4,
  initialSlide: 0,
  arrows: false,
  responsive: [
    {
      breakpoint: 1325,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: true,
        dots: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        dots: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        arrows: true,
      },
    },
    {
      breakpoint: 480,
      settings: {
        dots: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: 0,
        arrows: true,
      },
    },
  ],
};
