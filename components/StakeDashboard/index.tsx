import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import styles from "../../styles/Dashboard.module.css";
import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useOwnedNFTs,
  useSDK,
  useSigner,
} from "@thirdweb-dev/react";
import {
  BRONZE_NFT_ADDRESS,
  BRONZE_STAKING_ADDRESS,
  GOLD_NFT_ADDRESS,
  GOLD_STAKING_ADDRESS,
  SILVER_NFT_ADDRESS,
  SIVER_STAKING_ADDRESS,
} from "@/addresses";
import { ethers } from "ethers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/helpers/firebase-config";

const stakeABI = [
  {
    type: "function",
    name: "stake",
    inputs: [
      {
        type: "uint256[]",
        name: "_tokenIds",
        internalType: "uint256[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const StakeDashboard: FC = () => {
  const signer = useSigner();
  const provider = signer?.provider;
  const address = useAddress();

  const [activeBtn, setActiveBtn] = useState<number>(0);
  const [selectedNft, setSelectedNft] = useState<string>("golden");
  const [goldStakeInfo, setGoldStakeInfo] = useState<any>({});
  const [silverStakeInfo, setSilverStakeInfo] = useState<any>({});
  const [bronzeStakeInfo, setBronzeStakeInfo] = useState<any>({});
  const [toStakeEntered, setToStakeEntered] = useState<number>(0);
  const [toUnStakeEntered, setToUnStakeEntered] = useState<number>(0);
  const [accGoldInterest, setAccGoldInterest] = useState<number>(0);
  const [accSilverInterest, setAccSilverInterest] = useState<number>(0);
  const [accBronzeInterest, setAccBronzeInterest] = useState<number>(0);

  // nft staking contract address
  const { contract: goldStakingContract } = useContract(GOLD_STAKING_ADDRESS);
  const { contract: silverStakingContract } = useContract(
    SIVER_STAKING_ADDRESS
  );
  const { contract: bronzeStakingContract } = useContract(
    BRONZE_STAKING_ADDRESS
  );

  // nft contact address
  const { contract: goldNftContract } = useContract(GOLD_NFT_ADDRESS);
  const { contract: silverNftContract } = useContract(SILVER_NFT_ADDRESS);
  const { contract: bronzeNftContract } = useContract(BRONZE_NFT_ADDRESS);

  // owned nfts read
  const { data: goldOwnedNfts, refetch: refetchGoldOwnedNfts } = useOwnedNFTs(
    goldNftContract,
    address
  );
  const { data: silverOwnedNfts, refetch: refetchSilverOwnedNfts } =
    useOwnedNFTs(silverNftContract, address);
  const { data: bronzeOwnedNfts, refetch: refetchBronzeOwnedNfts } =
    useOwnedNFTs(bronzeNftContract, address);

  // approve for all read
  const { data: goldNftRead } = useContractRead(
    goldNftContract,
    "isApprovedForAll",
    [address, GOLD_STAKING_ADDRESS]
  );
  const { data: silverNftRead } = useContractRead(
    silverNftContract,
    "isApprovedForAll",
    [address, SIVER_STAKING_ADDRESS]
  );
  const { data: bronzeNftRead } = useContractRead(
    bronzeNftContract,
    "isApprovedForAll",
    [address, BRONZE_STAKING_ADDRESS]
  );

  // approve for all  write
  const { mutateAsync: setApprovalForAllGold } = useContractWrite(
    goldNftContract,
    "setApprovalForAll"
  );
  const { mutateAsync: setApprovalForAllSilver } = useContractWrite(
    silverNftContract,
    "setApprovalForAll"
  );
  const { mutateAsync: setApprovalForAllBronze } = useContractWrite(
    bronzeNftContract,
    "setApprovalForAll"
  );

  // stake functions
  const { mutateAsync: goldStakeHandler } = useContractWrite(
    goldStakingContract,
    "stake"
  );
  const { mutateAsync: silverStakeHandler } = useContractWrite(
    silverStakingContract,
    "stake"
  );
  const { mutateAsync: bronzeStakeHandler } = useContractWrite(
    bronzeStakingContract,
    "stake"
  );

  // unstake write
  const { mutateAsync: goldUnstaking } = useContractWrite(
    goldStakingContract,
    "withdraw"
  );
  const { mutateAsync: silverUnstaking } = useContractWrite(
    silverStakingContract,
    "withdraw"
  );
  const { mutateAsync: bronzeUnstaking } = useContractWrite(
    bronzeStakingContract,
    "withdraw"
  );

  // claim write
  const { mutateAsync: claimGoldRewards } = useContractWrite(
    goldStakingContract,
    "claimRewards"
  );
  const { mutateAsync: claimSilverRewards } = useContractWrite(
    silverStakingContract,
    "claimRewards"
  );
  const { mutateAsync: claimBronzeRewards } = useContractWrite(
    bronzeStakingContract,
    "claimRewards"
  );

  const getStakeInfoHandler = async () => {
    const goldStakingContract = new ethers.Contract(
      GOLD_STAKING_ADDRESS,
      abi,
      provider
    );
    let updatedGoldStakingContract = await goldStakingContract.getStakeInfo(
      address
    );
    setAccGoldInterest(
      +ethers.utils.formatUnits(
        updatedGoldStakingContract._rewards.toString(),
        18
      )
    );
    updatedGoldStakingContract = updatedGoldStakingContract._tokensStaked.map(
      (item: any) => item.toString()
    );
    setGoldStakeInfo(updatedGoldStakingContract);

    const silverStakingContract = new ethers.Contract(
      SIVER_STAKING_ADDRESS,
      abi,
      provider
    );
    let updatedSilverStakingContract = await silverStakingContract.getStakeInfo(
      address
    );
    setAccSilverInterest(
      +ethers.utils.formatUnits(
        updatedSilverStakingContract._rewards.toString(),
        18
      )
    );
    updatedSilverStakingContract =
      updatedSilverStakingContract._tokensStaked.map((item: any) =>
        item.toString()
      );
    setSilverStakeInfo(updatedSilverStakingContract);

    const bronzeStakingContract = new ethers.Contract(
      BRONZE_STAKING_ADDRESS,
      abi,
      provider
    );
    let updatedBronzeStakingContract = await bronzeStakingContract.getStakeInfo(
      address
    );
    setAccBronzeInterest(
      +ethers.utils.formatUnits(
        updatedBronzeStakingContract._rewards.toString(),
        18
      )
    );
    console.log(
      "rewardforBronze",
      ethers.utils.formatUnits(
        updatedBronzeStakingContract._rewards.toString(),
        18
      )
    );
    updatedBronzeStakingContract =
      updatedBronzeStakingContract._tokensStaked.map((item: any) =>
        item.toString()
      );
    setBronzeStakeInfo(updatedBronzeStakingContract);
  };

  useEffect(() => {
    if (!provider || !address) return;

    getStakeInfoHandler();
  }, [provider, address]);

  const handleClick = async (btnId: number) => {
    setActiveBtn(btnId);
  };

  const handleCancelClick = () => {
    setActiveBtn(0);
  };

  let selectedNftImage = "";
  let calculateAnualInterest = 50;
  let calculateDailyInterest = 0.2;
  let calculateUnstakeVaule = 0;
  let calculateNftsValue = goldOwnedNfts?.length || 0;

  if (selectedNft === "golden") {
    selectedNftImage = "/images/gold.jpeg";
    calculateAnualInterest = 50;
    calculateNftsValue = goldOwnedNfts?.length || 0;
    calculateDailyInterest = 0.2;
    calculateUnstakeVaule = goldStakeInfo?.length || 0;
  }
  if (selectedNft === "silver") {
    selectedNftImage = "/images/silver.png";
    calculateAnualInterest = 30;
    calculateNftsValue = silverOwnedNfts?.length || 0;
    calculateDailyInterest = 0.095;
    calculateUnstakeVaule = silverStakeInfo?.length || 0;
  }
  if (selectedNft === "bronze") {
    selectedNftImage = "/images/bronze.jpeg";
    calculateAnualInterest = 30;
    calculateNftsValue = bronzeOwnedNfts?.length || 0;
    calculateDailyInterest = 0.045;
    calculateUnstakeVaule = bronzeStakeInfo?.length || 0;
  }
  console.log("goldstakeinfo", goldStakeInfo);

  const stakeHandler = async () => {
    console.log("stakeHandler", selectedNft);
    // if toStakeEntered is greater than owned nfts then return
    if (
      !provider ||
      !address ||
      toStakeEntered == 0 ||
      toStakeEntered > calculateNftsValue
    )
      return;
    try {
      const nftsRef = collection(db, "nfts");
      const q = query(nftsRef, where("seller", "==", address.toLowerCase()));
      const querySnapshot = await getDocs(q);
      const nfts = querySnapshot.docs.map((doc) => doc.data());

      console.log("nfts", nfts);
      if (selectedNft === "golden") {
        if (!goldNftRead) {
          console.log("goldNftRead", goldNftRead);
          const data = await setApprovalForAllGold({
            args: [GOLD_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!goldOwnedNfts) return;
        // stake gold nft
        // take the first nfts from the array equal to toStakeEntered
        let availableTokens = goldOwnedNfts;
        let availableNFTsFromFirestore = nfts;

        console.log("availableTokens", availableTokens);
        console.log("availableNFTsFromFirestore", availableNFTsFromFirestore);

        // select nfts that are gold
        let goldNFTsFromFirestore = nfts.filter((item) => {
          return (
            item.assetContractAddress.toLowerCase() ==
              GOLD_NFT_ADDRESS.toLowerCase() && !item.soldAt
          );
        });

        console.log("goldNFTsFromFirestore", goldNFTsFromFirestore);

        // get nftids from firebase

        let nftIdsFromFirestore = goldNFTsFromFirestore.map((item) => {
          return +item.tokenId;
        });
        console.log("nftIdsFromFirestore", nftIdsFromFirestore);

        // remove nft ids from available tokens
        availableTokens = availableTokens.filter((item) => {
          return !nftIdsFromFirestore.includes(+item.metadata.id);
        });

        console.log("availableTokens", availableTokens);
        if (availableTokens.length < toStakeEntered) {
          alert(
            "You dont have enough nfts to stake or NFTs are listed for sale"
          );
          return;
        }
        // stake the nfts
        const goldStakeContract = new ethers.Contract(
          GOLD_STAKING_ADDRESS,
          stakeABI,
          signer
        );
        // calculate gas limit

        const goldStaking = await goldStakeContract.stake([
          availableTokens
            .slice(0, toStakeEntered)
            .map((item) => +item.metadata.id),
        ]);
        await goldStaking.wait();
        console.log("goldStaking", goldStaking);

        // await goldStakeHandler({
        //   args: [
        //     availableTokens
        //       .slice(0, toStakeEntered)
        //       .map((item) => item.metadata.id),
        //   ],
        // });
        alert("Staked Successfully");
      }
      if (selectedNft === "silver") {
        if (!silverNftRead) {
          const data = await setApprovalForAllSilver({
            args: [SIVER_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!silverOwnedNfts) return;

        let availableTokens = silverOwnedNfts;
        let availableNFTsFromFirestore = nfts;

        // select nfts that are silver
        let silverNFTsFromFirestore = nfts.filter((item) => {
          return (
            item.assetContractAddress.toLowerCase() ==
              SILVER_NFT_ADDRESS.toLowerCase() && !item.soldAt
          );
        });

        console.log("silverNFTsFromFirestore", silverNFTsFromFirestore);

        // get nftids from firebase

        let nftIdsFromFirestore = silverNFTsFromFirestore.map((item) => {
          return +item.tokenId;
        });
        console.log("nftIdsFromFirestore", nftIdsFromFirestore);

        // remove nft ids from available tokens
        availableTokens = availableTokens.filter((item) => {
          return !nftIdsFromFirestore.includes(+item.metadata.id);
        });

        console.log("availableTokens", availableTokens);
        if (availableTokens.length < toStakeEntered) {
          alert(
            "You dont have enough nfts to stake or NFTs are listed for sale"
          );
          return;
        }
        // stake the nfts
        const silverStakeContract = new ethers.Contract(
          SIVER_STAKING_ADDRESS,
          stakeABI,
          signer
        );
        const silverStaking = await silverStakeContract.stake([
          availableTokens
            .slice(0, toStakeEntered)
            .map((item) => +item.metadata.id),
        ]);
        await silverStaking.wait();
        console.log("silverStaking", silverStaking);

        // await silverStakeHandler({
        //   args: [
        //     availableTokens
        //       .slice(0, toStakeEntered)
        //       .map((item) => item.metadata.id),
        //   ],
        // });
        alert("Staked Successfully");
      }

      if (selectedNft === "bronze") {
        if (!bronzeNftRead) {
          const data = await setApprovalForAllBronze({
            args: [BRONZE_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!bronzeOwnedNfts) return;

        let availableTokens = bronzeOwnedNfts;
        let availableNFTsFromFirestore = nfts;

        // select nfts that are bronze
        let bronzeNFTsFromFirestore = nfts.filter((item) => {
          return (
            item.assetContractAddress.toLowerCase() ==
              BRONZE_NFT_ADDRESS.toLowerCase() && !item.soldAt
          );
        });

        console.log("bronzeNFTsFromFirestore", bronzeNFTsFromFirestore);

        // get nftids from firebase

        let nftIdsFromFirestore = bronzeNFTsFromFirestore.map((item) => {
          return +item.tokenId;
        });
        console.log("nftIdsFromFirestore", nftIdsFromFirestore);

        // remove nft ids from available tokens
        availableTokens = availableTokens.filter((item) => {
          return !nftIdsFromFirestore.includes(+item.metadata.id);
        });

        console.log("availableTokens", availableTokens);
        if (availableTokens.length < toStakeEntered) {
          alert(
            "You dont have enough nfts to stake or NFTs are listed for sale"
          );
          return;
        }
        // stake the nfts

        const bronzeContract = new ethers.Contract(
          BRONZE_STAKING_ADDRESS,
          stakeABI,
          signer
        );
        const bronzeStaking = await bronzeContract.stake([
          availableTokens
            .slice(0, toStakeEntered)
            .map((item) => +item.metadata.id),
        ]);
        await bronzeStaking.wait();
        console.log("bronzeStaking", bronzeStaking);

        // await bronzeStakeHandler({
        //   args: [
        //     availableTokens
        //       .slice(0, toStakeEntered)
        //       .map((item) => item.metadata.id),
        //   ],
        // });
        alert("Staked Successfully");
      }
      // refetch all nfts
      getStakeInfoHandler();
      refetchGoldOwnedNfts();
      refetchSilverOwnedNfts();
      refetchBronzeOwnedNfts();
    } catch (error) {
      console.log("error", error);
    }
  };

  const unstakeHandler = async () => {
    console.log("unstakeHandler", selectedNft);
    // if toStakeEntered is greater than owned nfts then return
    if (
      !provider ||
      !address ||
      toUnStakeEntered == 0 ||
      toUnStakeEntered > calculateUnstakeVaule
    )
      return;
    try {
      if (selectedNft === "golden") {
        if (!goldNftRead) {
          console.log("goldNftRead", goldNftRead);
          const data = await setApprovalForAllGold({
            args: [GOLD_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!goldStakeInfo) return;

        const data = await goldUnstaking({
          args: [goldStakeInfo.slice(0, toUnStakeEntered)],
        });
        alert("unstake success");
      }
      if (selectedNft === "silver") {
        if (!silverNftRead) {
          const data = await setApprovalForAllSilver({
            args: [SIVER_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!silverStakeInfo) return;
        // stake silver nft
        // take the first nfts from the array equal to toStakeEntered
        const data = await silverUnstaking({
          args: [silverStakeInfo.slice(0, toUnStakeEntered)],
        });
        alert("unstake success");
      }
      if (selectedNft === "bronze") {
        if (!bronzeNftRead) {
          const data = await setApprovalForAllBronze({
            args: [BRONZE_STAKING_ADDRESS, true],
          });
          console.info("contract call successs", data);
        }
        if (!bronzeStakeInfo) return;
        const data = await bronzeUnstaking({
          args: [bronzeStakeInfo.slice(0, toUnStakeEntered)],
        });
        alert("unstake success");
      }
      // refetch all nfts
      getStakeInfoHandler();
      refetchGoldOwnedNfts();
      refetchSilverOwnedNfts();
      refetchBronzeOwnedNfts();
    } catch (error) {
      console.log("error", error);
    }
  };

  let singleTypeInterestAccrued = 0;
  if (selectedNft === "golden") {
    singleTypeInterestAccrued = accGoldInterest;
  }
  if (selectedNft === "silver") {
    singleTypeInterestAccrued = accSilverInterest;
  }
  if (selectedNft === "bronze") {
    singleTypeInterestAccrued = accBronzeInterest;
  }

  let totalInterestAccured =
    accGoldInterest + accSilverInterest + accBronzeInterest;
  console.log("singleTypeInterestAccrued", singleTypeInterestAccrued);
  console.log("totalInterestAccured", totalInterestAccured);
  const claimRewardsHandler = async () => {
    if (!provider || !address) return;
    try {
      if (selectedNft === "golden") {
        const data = await claimGoldRewards({ args: [] });
      }
      if (selectedNft === "silver") {
        const data = await claimSilverRewards({ args: [] });
      }
      if (selectedNft === "bronze") {
        const data = await claimBronzeRewards({ args: [] });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <React.Fragment>
      <section className=" md:mt-10 mt-5">
        <div
          className={`mx-auto lg:p-[102px] p-4 relative rounded-[20px] ${styles.stakeInsights}`}
        >
          <div className="flex xl:flex-row justify-center gap-16 flex-wrap">
            <div className="  space-y-12">
              <Image
                src={selectedNftImage || "/images/gold.jpeg"}
                alt="nitfee"
                className="rounded-md"
                width={397}
                height={475}
              />
              <h1 className="text-center text-white text-3xl font-bold tracking-widest">
                {selectedNft?.toUpperCase() || "GOLDEN"} NFT
              </h1>
            </div>
            <div className="md:space-y-[86px] space-y-8">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-white uppercase">
                  EST. STAKING RETURN (APY){" "}
                </p>
                <span className="text-4xl font-bold text-white block ">
                  {calculateAnualInterest || "50"}%
                </span>
              </div>
              {/* 1st btn */}
              <div className="text-center space-y-5">
                {activeBtn !== 1 && (
                  <>
                    <p className="text-lg font-semibold text-white">
                      Available For Staking
                    </p>
                    <span className="text-4xl font-bold text-white block ">
                      {calculateNftsValue}
                    </span>
                    <button
                      className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                      onClick={() => handleClick(1)}
                    >
                      Stake
                    </button>
                  </>
                )}
                {activeBtn === 1 && (
                  <>
                    <label
                      htmlFor=""
                      className="flex justify-between items-center"
                    >
                      <span>Balance</span>
                      <span>{calculateNftsValue}</span>
                    </label>
                    <input
                      type="number"
                      className="py-[10px] bg-[#11171D] w-full"
                      value={toStakeEntered}
                      onChange={(e) => setToStakeEntered(+e.target.value)}
                    />
                    <div className="flex items-center justify-between gap-5">
                      <button
                        className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                        onClick={stakeHandler}
                      >
                        Stake
                      </button>
                      <button
                        className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
              {/* 2nd btn */}
              <div className="text-center space-y-5">
                {activeBtn !== 2 && (
                  <>
                    <p className="text-lg font-semibold text-white">
                      Amount Accumulated
                    </p>
                    <span className="text-4xl font-bold text-white block ">
                      {singleTypeInterestAccrued.toFixed(3)} CFX
                    </span>
                    <button
                      onClick={claimRewardsHandler}
                      className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                    >
                      Claim
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="md:space-y-[86px] space-y-8">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-white uppercase">
                  EST. DAILY INTREST (CFX)
                </p>
                <span className="text-4xl font-bold text-white block ">
                  {calculateDailyInterest}
                </span>
              </div>
              {/* 3rd btn */}
              <div className="text-center space-y-5">
                {activeBtn !== 3 && (
                  <>
                    <p className="text-lg font-semibold text-white">
                      Available For Unstaking
                    </p>
                    <span className="text-4xl font-bold text-white block ">
                      {calculateUnstakeVaule}
                    </span>
                    <button
                      className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                      onClick={() => handleClick(3)}
                    >
                      Unstake
                    </button>
                  </>
                )}
                {activeBtn === 3 && (
                  <>
                    <label
                      htmlFor=""
                      className="flex justify-between items-center"
                    >
                      <span>Balance</span>
                      <span> {calculateUnstakeVaule}</span>
                    </label>
                    <input
                      type="text"
                      className="py-[10px] bg-[#11171D] w-full"
                      value={toUnStakeEntered}
                      onChange={(e) => setToUnStakeEntered(+e.target.value)}
                    />
                    <div className="flex items-center justify-between gap-5">
                      <button
                        className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                        onClick={unstakeHandler}
                      >
                        Unstake
                      </button>
                      <button
                        className="stake-btn text-white block w-full font-semibold py-3 px-6 rounded-lg"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* stake cards */}
        <div className="mt-[32px] md:mt-[70px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div
            className="rounded-lg w-full h-full group cursor-pointer relative"
            onClick={() => {
              setSelectedNft("golden");
            }}
          >
            <img
              src={"/images/gold.jpeg"}
              className="w-full h-full object-cover rounded-md"
              alt="marketplan"
            />
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent hidden justify-center items-center group-hover:flex cursor-pointer">
              <div className="text-center">
                <p className="font-semibold md:text-3xl text-base ">Golden</p>
                <p className="text-white md:text-[18px] text-sm font-semibold">
                  {goldOwnedNfts?.length} NFTs
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-lg w-full h-full group cursor-pointer relative"
            onClick={() => setSelectedNft("silver")}
          >
            <img
              src={"/images/silver.png"}
              className="w-full h-full object-cover rounded-md"
              alt="marketplan"
            />
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent hidden justify-center items-center group-hover:flex cursor-pointer">
              <div className="text-center">
                <p className="font-semibold md:text-3xl text-base ">Silver</p>
                <p className="text-white md:text-[18px] text-sm font-semibold">
                  {silverOwnedNfts?.length} NFTs
                </p>
              </div>
            </div>
          </div>
          <div
            className="rounded-lg w-full h-full group cursor-pointer relative"
            onClick={() => setSelectedNft("bronze")}
          >
            <img
              src={"/images/bronze.jpeg"}
              className="w-full h-full object-cover rounded-md"
              alt="marketplan"
            />
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent hidden justify-center items-center group-hover:flex cursor-pointer">
              <div className="text-center">
                <p className="font-semibold md:text-3xl text-base ">Bronze</p>
                <p className="text-white md:text-[18px] text-sm font-semibold">
                  {bronzeOwnedNfts?.length} NFTs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default StakeDashboard;

const abi = [
  {
    inputs: [{ internalType: "address", name: "_staker", type: "address" }],
    name: "getStakeInfo",
    outputs: [
      { internalType: "uint256[]", name: "_tokensStaked", type: "uint256[]" },
      { internalType: "uint256", name: "_rewards", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];
