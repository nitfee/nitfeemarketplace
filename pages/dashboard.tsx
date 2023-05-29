import React, { useEffect, useState } from "react";
import stakeHandImage from "../public/images/stake-hand-img.png";
import Image from "next/image";
import styles from "../styles/Dashboard.module.css";
import StakeDashboard from "@/components/StakeDashboard";
import { ethers } from "ethers";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { wrappedConfluxAddr } from "@/addresses";

export default function Dashboard() {
  const [exchangeInput, setExchangeInput] = useState("");
  const [balance, setBalance] = useState(0);
  const address = useAddress();
  const signer = useSigner();
  const provider = signer?.provider;

  const getBalance = async () => {
    const wcfxContract = new ethers.Contract(
      wrappedConfluxAddr,
      [
        {
          constant: true,
          inputs: [{ name: "", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      provider,
    );
    const result = await wcfxContract.balanceOf(address);
    setBalance(+(result.toString() / 10 ** 18).toFixed(4));
    console.log("balance", result.toString());
  };

  useEffect(() => {
    if (!address) return;
    try {
      getBalance();
    } catch (e) {
      console.log(e);
    }
  }, [address]);

  const convertToCFXHandler = async () => {
    if (!exchangeInput) {
      alert("Please enter amount");
      return;
    }
    if (+balance < +exchangeInput) {
      alert("Insufficient balance");
      return;
    }
    const wcfxContract = new ethers.Contract(
      wrappedConfluxAddr,
      [
        {
          constant: false,
          inputs: [{ name: "wad", type: "uint256" }],
          name: "withdraw",
          outputs: [],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      signer,
    );
    const res = await wcfxContract.withdraw(ethers.utils.parseEther(exchangeInput));
    await res.wait();

    console.log("res", res);
    if (res) {
      alert("Successfully converted to CFX");
    }
    await getBalance();
  };

  return (
    <React.Fragment>
      <div className="flex flex-col overflow-hidden justify-center bg-[url('/images/stake-hero-img.png')] bg-cover min-[1440px]:bg-cover bg-no-repeat h-[700px] lg:h-[884px] xl:min-h-[884px] lg:px-48 px-4 relative">
        <div
          className={`absolute w-[803px] h-[600px] left-[100px] lg:left-[329px] ${styles.heroShadow}`}
        ></div>
        <Image
          src={stakeHandImage}
          alt=""
          className="z-[2] absolute bottom-24 lg:-bottom-20 left-0"
        />
        <h1 className="uppercase text-[100px] lg:text-[200px] leading-[85px] text-center lg:text-left font-bold  stake-text md:leading-[230px] relative z-[3]">
          STAKE
        </h1>
        <h1 className="lg:text-[180px] text-[96px] text-center leading- lg:text-left font-bold nft-text  md:leading-[200px] relative z-[3]">
          your NFT
        </h1>
      </div>
      <div
        className={`relative z-[5] w-full h-[587px] -mt-[500px] lg:-mt-[400px] flex items-end px-4 lg:px-48 ${styles.textAfterHero}`}
      >
        <h2 className="font-semibold text-[20px] text-center lg:text-left lg:text-[27px] text-white">
          Explore rare and valuable digital assets on our NFT marketplace. Buy, sell, and earn
          rewards with low fees and an easy-to-use platform. Join our community of NFT enthusiasts
          today.
        </h2>
      </div>

      <StakeDashboard />

      {/* Burn tokens */}
      <section className="px-4 lg:px-[133px] mt-24 mb-40">
        <div className="bg-no-repeat flex-col items-center space-y-5 md:space-y-10 md:p-9 p-4 text-center relative bg-[#11171D]/80 md:bg-[url('/images/burn-token.jpg')] bg-cover rounded-[20px] md:min-h-[302px]">
          <div className="absolute inset-0 bg-black/80 md:flex hidden z-[6]"></div>
          <h2 className="uppercase text-2xl md:text-4xl md:relative md:z-[7] text-bold">
            Exchange WCFX/CFX
          </h2>
          <div className="flex justify-center relative z-50 gap-5">
            <div className="flex-1 max-w-[300px]">
              <input
                value={exchangeInput}
                type="number"
                onChange={(e) => setExchangeInput(e.target.value)}
                className="flex-1 py-2.5 rounded w-full px-2 text-black"
                placeholder="Enter WCFX amount"
              />
              <p className="text-left">Balance: {+balance}CFX</p>
            </div>
            <button
              onClick={convertToCFXHandler}
              className="stake-btn text-white md:relative md:z-[7] text-base font-semibold py-3 px-6 rounded-lg uppercase max-h-11"
            >
              convert to CFX
            </button>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
