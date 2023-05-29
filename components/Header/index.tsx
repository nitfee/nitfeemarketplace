import Image from "next/image";
import React, { Fragment, useEffect } from "react";
import handImage from "../../public/images/hand-image.png";
import handImageSm from "../../public/images/hero-hand-sm.png";
import Button from "../Button";
import twitter from "../../public/images/twitter-logo.svg";
import wallet from "../../public/images/wallet.svg";
import {
  useAddress,
  useDisconnect,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
  useWalletConnectV1,
} from "@thirdweb-dev/react";
import Link from "next/link";

const Header = () => {
  const address = useAddress();
  const disconnect = useDisconnect();
  const metamask = useMetamask();
  const mismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const connectWithWalletConnect = useWalletConnectV1();
  const [metamaskInstalled, setMetamaskInstalled] = React.useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window?.ethereum) {
        setMetamaskInstalled(true);
      }
    }
  }, []);

  let connectBtn;
  if (!address) {
    connectBtn = (
      <Button
        className="uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
        onClick={() => {
          if (metamaskInstalled) {
            metamask();
          } else {
            connectWithWalletConnect();
          }
        }}
      >
        Connect Wallet
      </Button>
    );
  } else if (address && !mismatch) {
    connectBtn = (
      <Button
        className="uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
        onClick={() => disconnect()}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  } else if (address && mismatch) {
    connectBtn = (
      <Button
        className="uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
        onClick={() => switchNetwork && switchNetwork(1030)}
      >
        Switch Network
      </Button>
    );
  }

  return (
    <Fragment>
      <div className="hidden lg:flex  justify-center items-end lg:bg-[url('/images/header-bg-img.png')] bg-cover  min-[1440px]:bg-cover bg-top bg-no-repeat  w-full h-[884px] xl:h-[884px]  relative">
        <Image src={handImage} alt="nitee conflux espace" className="relative z-[1]" />
        <h1 className="nitfee-text uppercase text-[200px] font-bold absolute top-[18%] ">NITFEE</h1>
        <h1 className="conflux-text text-[180px] font-bold absolute z-[2] top-[45%]">
          Conflux Espace
        </h1>
        <div className="absolute z-[2] top-[75%] flex justify-center">
          <h2 className="font-semibold text-[27px] text-white w-[1026px]">
            Explore rare and valuable digital assets on our NFT marketplace. Buy, sell, and earn
            rewards with low fees and an easy-to-use platform. Join our community of NFT enthusiasts
            today.
          </h2>
        </div>
      </div>
      {/* Mobile screen */}
      <div className="bg-[url('/images/img-hero-sm.png')] bg-cover bg-no-repeat w-full h-screen relative flex justify-center lg:hidden">
        <Image
          src={handImageSm}
          alt="Nitfee market place"
          className="hand-img-sm absolute bottom-0"
        />
        <h1 className="nitfee-text-sm uppercase text-[100px] font-bold absolute top-[8%] ">
          NITFEE
        </h1>
        <h1 className="conflux-text-sm text-[96px] leading-[96px] font-bold absolute top-[22%] break-words text-center">
          Conflux Espace
        </h1>
        <div className={`z-[1] absolute lg:hidden ${address ? "top-[62%]" : "top-[66%]"}`}>
          <div className="flex gap-6 items-center">
            {address && (
              <Link href="/dashboard">
                <Button
                  className="uppercase text-base text-white flex gap-2 items-center"
                  type="transparent"
                >
                  Staking
                </Button>
              </Link>
            )}
            {connectBtn}
          </div>
          <div className="mt-4 flex justify-center">
            {address && (
              <Link href={`/user/${address}`}>
                <p className="font-medium text-white px-6 py-3 rounded-xl border border-[#696969] w-[154px]">
                  {address?.slice(0, 6).concat("...").concat(address?.slice(-4))}
                </p>
              </Link>
            )}
          </div>
        </div>

        <div className="absolute z-[1] top-[80%] flex justify-center">
          <h2 className="font-semibold text-[20px] text-white w-full text-center">
            Explore rare and valuable digital assets on our NFT marketplace. Buy, sell, and earn
            rewards with low fees and an easy-to-use platform. Join our community of NFT enthusiasts
            today.
          </h2>
        </div>
      </div>
    </Fragment>
  );
};

export default Header;
