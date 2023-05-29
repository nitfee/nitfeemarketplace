import Image from "next/image";
import React, { FC } from "react";
import Button from "../Button";
import userIcon from "../../public/images/user-icon.png";

interface ICardProps {
  name: string | number | null | undefined;
  price: string | number | null | undefined;
  symbol: string;
  user: string;
  image: string | null | undefined;
  onClick: () => void;
  listerId: string | null | undefined;
  soldOut?: boolean;
}

const Card: FC<ICardProps> = ({
  name,
  image,
  price,
  symbol,
  user,
  onClick,
  listerId,
  soldOut,
}) => {
  // if image is video, render video
  let isVideo = false;

  if (image?.includes("mp4")) {
    isVideo = true;
  }
  return (
    <div
      className="w-full h-[455px] md:w-[280px] lg:h-[550px]"
      onClick={onClick}
    >
      <div className="">
        {!isVideo ? (
          <img
            src={
              image ||
              "https://ipfs.thirdwebcdn.com/ipfs/QmXodQe3XXXhL55wfbLt3T2kAhXuBbHp1TLHcqyEjYBC9w/img_subdao.png"
            }
            alt=""
            className="w-full md:w-[280px] h-[370px] rounded-[20px] object-cover"
          />
        ) : (
          image && (
            <video
              src={image}
              className="w-[280px] h-[370px] rounded-[14px] object-cover"
              autoPlay
              loop
              muted
            />
          )
        )}
      </div>
      <div className="flex justify-center relative bottom-[75px]">
        <div className="w-[85%] md:w-[240px] h-[155px] bg-[#F2F2F2] rounded-3xl p-4 flex flex-col justify-between">
          <div className="flex justify-between gap-4">
            <h5 className=" capitalize font-extrabold text-textBlack">
              {name}
            </h5>
            <h5 className="nft-price text-[18px] font-extrabold uppercase">
              {price}
              {symbol}
            </h5>
          </div>
          <div className="flex gap-[10px] items-center">
            <Image
              src={userIcon}
              alt="marketplan"
              className="w-9 h-9 rounded-full object-contain"
            />
            <h3 className="capitalize text-xl font-medium text-textBlack">
              {" "}
              {listerId?.slice(0, 6).concat("...").concat(listerId?.slice(-4))}
            </h3>
          </div>
          <Button>{soldOut ? "Sold Out" : "Buy it now"}</Button>
        </div>
      </div>
    </div>
  );
};

export default Card;
