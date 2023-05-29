import Image from "next/image";
import React, { FC } from "react";
import Button from "../Button";

interface INftCardProps {
  name: string | number | null | undefined;
  price: string | number | null | undefined;
  symbol: string;
  user: string;
  image: string;
  type: string | null | undefined;
  onClick: () => void;
  sold?: boolean;
}

const NftCard: FC<INftCardProps> = ({
  name,
  image,
  price,
  symbol,
  user,
  onClick,
  type,
  sold,
}) => {
  const isVideo = image?.includes("mp4");
  return (
    <div
      className="nft-card flex flex-shrink-0 flex-grow-0 basis-[300px] md:flex-shrink-[auto] md:flex-grow-[auto] md:basis-[auto] flex-col items-center gap-[27px] px-[10px] py-[15px]  w-[297px] h-[425px] rounded-[20px] bg-[#FFFFFF1A] lg:mb-11"
      onClick={onClick}
    >
      {image && !isVideo ? (
        <img
          src={image}
          alt={""}
          className="w-[276px] h-[307px] rounded-[14px] object-cover"
        />
      ) : (
        //  render a video
        <video
          src={image}
          className="w-[276px] h-[307px] rounded-[14px] object-cover"
          autoPlay
          loop
          muted
        />
      )}
      <div className="w-full">
        <div className="flex justify-between">
          <h4 className="font-medium text-white mb-0 capitalize">{name}</h4>
          <h4 className="nft-price text-lg font-bold  mb-0">
            {price} {symbol}
          </h4>
        </div>
        <p className="text-xs font-normal text-white">{user}</p>
      </div>
      {!isVideo && (
        <>
          {sold ? (
            <Button className="hidden text-[19px] font-medium text-white rounded-xl w-full py-4  collect-button">
              Sold Out
            </Button>
          ) : (
            <Button className="hidden text-[19px] font-medium text-white rounded-xl w-full py-4  collect-button">
              {type ? "List NFT" : "Collect Now"}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default NftCard;
