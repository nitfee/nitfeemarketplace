import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { NAVBAR } from "../../constants";
import Button from "../Button";
import logo from "../../public/images/logo.png";
import twitter from "../../public/images/twitter-logo.svg";
import userIcon from "../../public/images/ic_user.png";
import wallet from "../../public/images/wallet.svg";
import hamburger from "../../public/images/hamburger.svg";
import SlideDownMenu from "../SlideDownMenu";
import { useWalletConnectV1 } from "@thirdweb-dev/react";
import {
  ChainId,
  useAddress,
  useDisconnect,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { ADMIN } from "@/addresses";

const Navbar: FC = () => {
  const [color, setColor] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const address = useAddress();
  const metamask = useMetamask();
  const disconnect = useDisconnect();
  const [, switchNetwork] = useNetwork();
  const mismatch = useNetworkMismatch();
  const connectWithWalletConnect = useWalletConnectV1();

  // check if window.ethereum is present, if yes connect otherwise connect with walletconnect

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window?.ethereum) {
        setMetamaskInstalled(true);
      }
    }
  }, []);

  useEffect(() => {
    window?.addEventListener("scroll", changeColor);
    return () => window?.removeEventListener("scroll", changeColor);
  }, []);

  const changeColor = () => {
    if (window.scrollY >= 60) setColor(true);
    else setColor(false);
  };
  let walletBtn;
  if (address && !mismatch) {
    walletBtn = (
      <Button
        className="uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
        onClick={() => disconnect()}
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }
  if (address && mismatch) {
    walletBtn = (
      <Button
        className="uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
        onClick={() => switchNetwork && switchNetwork(1030)}
      >
        Switch Network
      </Button>
    );
  }
  if (!address) {
    walletBtn = (
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
        Connect
      </Button>
    );
  }

  return (
    <div
      className={`px-4 flex justify-between items-center lg:px-[78px] w-full fixed z-10 py-4  ${
        color ? "bg-night py-2" : "bg-transparent"
      }`}
    >
      <Link href="/">
        <div className="flex items-center gap-2">
          <Image
            src={logo}
            alt="NITFEE"
            className="w-[46px] h-[48px] lg:w-[72px] lg:h-[70px] object-contain"
          />
          <h1 className="text-2xl text-white lg:text-[32px] font-bold uppercase">NITFEE</h1>
        </div>
      </Link>
      {address?.toLowerCase() == ADMIN?.toLowerCase() && (
        <>
          <div className="hidden lg:flex gap-9">
            <Link href={"/"} className="text-base font-bold text-white uppercase">
              Home
            </Link>

            <Link href={"/collection/new"} className="text-base font-bold text-white uppercase">
              Post Collection
            </Link>
          </div>
        </>
      )}

      <div className="hidden lg:flex gap-5">
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
        {address && (
          <Link href={`/user/${address}`}>
            <Button
              className="uppercase text-base text-white flex gap-2 items-center"
              type="transparent"
            >
              <Image
                src={userIcon}
                alt="marketplan nitfee discord"
                className="w-6 h-6 object-contain"
              />
              Profile
            </Button>
          </Link>
        )}
        {walletBtn}
      </div>
      {/* // Mobie screeen */}
      <div className="lg:hidden">
        <Image
          src={hamburger}
          alt=""
          className="object-contain"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      {isOpen && <SlideDownMenu menu={NAVBAR} callback={setIsOpen} />}
    </div>
  );
};

export default Navbar;
