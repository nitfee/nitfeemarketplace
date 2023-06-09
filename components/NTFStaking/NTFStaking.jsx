import React, { useEffect, useState } from "react";
import {
  ARP,
  AUDIT,
  AVAILABLE_CURRENCY,
  CHOOSE_TYPE,
  CLAIM,
  DAILY_REWARDS,
  DASHBOARD_TITLE,
  ESTIMATED_REWARD,
  MAX,
  PENDING_REWARDS,
  PUBLIC,
  SELF,
  SELF_PRICE,
  SELF_STAKING,
  SELF_STATS,
  STAKE,
  TOTAL_STAKED,
  TOTAL_STAKING,
  TOTAL_SUPPLY,
  UNSTAKE,
  WHITELIST,
} from "@/constants";
import Button from "@/components/Button";
import Image from "next/image";
import NTFABI from "@/helpers/NTFABI.json";
import { ethers } from "ethers";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { NTFContract, NTFStaking } from "@/addresses";
import {
  useContract,
  useContractWrite,
  useContractRead,
} from "@thirdweb-dev/react";

export default function Staking() {
  const [ntfWalletBalance, setNtfWalletBalance] = useState(0);
  const [allowence, setAllowence] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState(0);

  const signer = useSigner();
  const provider = signer?.provider;
  const address = useAddress();
  let earnedRewards = 0;
  let isDisabled = false;
  let stakedSupply = 0;
  let aprValue = 0;
  let dailyRewards = 0;
  let rewardSupply = 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchInitialData();
    }
  }, [address, provider]);

  const { contract } = useContract(NTFStaking);
  const { mutateAsync: stake } = useContractWrite(contract, "stake");
  const { data: userStakeInfo, refetch: fetchStakeInfo } = useContractRead(
    contract,
    "getStakeInfo",
    [address]
  );
  const { mutateAsync: withdraw } = useContractWrite(contract, "withdraw");
  const { mutateAsync: claimRewards } = useContractWrite(
    contract,
    "claimRewards"
  );
  const { data: totalStakingBalance, refetch: refetchStakingTokenBalance } =
    useContractRead(contract, "stakingTokenBalance");

  const { data: rewardTokenBalance, refetch: refetchRewardTokenBalance } =
    useContractRead(contract, "getRewardTokenBalance");

  function convertToWei(decimalValue, decimals) {
    const weiValue = ethers.utils.parseUnits(decimalValue.toString(), decimals);
    return weiValue;
  }

  let stakeHandler = async () => {
    try {
      if (!provider || !address || stakeAmount == 0) return;
      if (+allowence < +stakeAmount) {
        const tokenContract = new ethers.Contract(NTFContract, NTFABI, signer);
        const estimatedGas = await tokenContract.estimateGas.approve(
          NTFStaking,
          ethers.constants.MaxUint256
        );
        const tx = await tokenContract.approve(
          NTFStaking,
          ethers.constants.MaxUint256,
          {
            gasLimit: estimatedGas || 250000,
          }
        );
        await tx.wait();
        setAllowence(ethers.constants.MaxUint256);
      }
      const amountToStake = convertToWei(+stakeAmount, 18);
      const data = await stake({ args: [amountToStake] });
      console.log("stake data", data);
      alert("Stake Success");
      await fetchInitialData();
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  let unstakeHandler = async () => {
    try {
      if (!provider || !address || unstakeAmount == 0) return;
      const amountToUnstake = convertToWei(unstakeAmount, 18);
      await withdraw({ args: [amountToUnstake] });
      alert("Unstake Success");
      await fetchInitialData();
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const fetchInitialData = async () => {
    if (!address || !provider) return;
    const ntfContract = new ethers.Contract(NTFContract, NTFABI, provider);
    ntfContract.balanceOf(address).then((res) => {
      console.log("restoken", res.toString());
      setNtfWalletBalance(+ethers.utils.formatEther(res.toString()));
    });

    ntfContract.allowance(address, NTFStaking).then((res) => {
      setAllowence(res.toString() / 10 ** 18);
      console.log("restoken2222", res.toString() / 10 ** 18);
    });
    await fetchStakeInfo();
    await refetchRewardTokenBalance();
    await refetchStakingTokenBalance();
  };
  console.log("userStakeInfo", userStakeInfo);
  let tokensStakedAlready = userStakeInfo?._tokensStaked
    ? Number(ethers.utils.formatEther(userStakeInfo?._tokensStaked)).toFixed(2)
    : 0;
  let earnedRewardsAlready = userStakeInfo?._rewards
    ? Number(ethers.utils.formatEther(userStakeInfo?._rewards))
    : 0;
  console.log("earnedRewardsAlready", earnedRewardsAlready);
  const totalStakingNTF = totalStakingBalance?.toString() / 10 ** 18 || 0;

  let claimHandler = async () => {
    if (+earnedRewardsAlready == 0 || !provider || !address) {
      return;
    }
    try {
      await claimRewards({ args: [] });
      alert("Claim Success");
      await fetchInitialData();
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  return (
    <>
      <div className="paddingX h-full xl:bg-[url('/web_assets/Stake-now-bg.svg')] bg-no-repeat bg-right bg-contain xl:h-[821px] md:mt-[125px] px-5">
        <div
          className="mt-[30px] text-white text-center md:text-left  font-medium text-[32px] md:text-[60px] md:mt-0  stakingTitle"
          dangerouslySetInnerHTML={{ __html: DASHBOARD_TITLE }}
        />
        {/* // ----First Box---- */}
        <div className="mt-[30px] grid grid-cols-1 gap-[30px] xl:grid-cols-4 min-[1400px]:grid-cols-7  md:mt-[60px]">
          <div className="borderGradient py-[44px] flex flex-col items-center justify-center md:block xl:col-span-2 min-[1400px]:col-span-3 md:px-[45px] md:py-[55px]">
            <h3 className="font-bold text-[26px]  mb-[25px] text-center md:mb-[50px] md:text-[32px]">
              {SELF_STAKING}
            </h3>
            <div>
              <div className="md:flex justify-between lg:justify-around">
                {/* // Stake */}
                <div className="md:max-w-[200px]">
                  <p className="text-white text-lg font-bold capitalize mb-[10px]">
                    {AVAILABLE_CURRENCY}
                  </p>
                  <div className="flex justify-between items-center text-white text-lg font-bold capitalize mb-[30px] md:text-xl">
                    <p>{+ntfWalletBalance?.toFixed(2)} NTF</p>
                    <p
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => setStakeAmount(+ntfWalletBalance)}
                    >
                      {MAX}
                    </p>
                  </div>
                  <div className="flex gap-1.5 md:justify-start justify-center">
                    <div
                      className="w-[43px] h-[43px] border border-white rounded text-[28px] flex justify-center items-center cursor-pointer select-none"
                      onClick={() => {
                        if (stakeAmount > 0) setStakeAmount(+stakeAmount - 1);
                      }}
                    >
                      -
                    </div>
                    <input
                      type={"number"}
                      className="numberInput px-1 w-[91px] h-[43px] border border-white bg-transparent rounded text-[24px] text-center outline-none"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <div
                      className="w-[43px] h-[43px] border border-white rounded text-[28px] flex justify-center items-center cursor-pointer select-none"
                      onClick={() => {
                        if (stakeAmount < ntfWalletBalance)
                          setStakeAmount(+stakeAmount + 1);
                        console.log("stakeAmount", stakeAmount);
                      }}
                    >
                      +
                    </div>
                  </div>
                  <Button
                    type={
                      stakeAmount > 0 && !isDisabled ? "primary" : "lightButton"
                    }
                    className="font-bold text-lg uppercase  flex justify-center items-center mt-[30px] w-full"
                    onClick={stakeHandler}
                  >
                    {STAKE}
                  </Button>
                </div>
                {/* // Unstake */}
                <div className="mt-10 md:max-w-[200px] md:mt-0">
                  <p className="text-white text-lg font-bold capitalize mb-[10px]">
                    {TOTAL_STAKED}
                  </p>
                  <div className="flex justify-between items-center text-white text-xl font-bold capitalize mb-[30px]">
                    <p>{tokensStakedAlready} NTF</p>
                    <p
                      className="text-primary cursor-pointer hover:underline"
                      onClick={() => setUnstakeAmount(tokensStakedAlready)}
                    >
                      {MAX}
                    </p>
                  </div>
                  <div className="flex gap-1.5 md:justify-start justify-center">
                    <div
                      className="w-[43px] h-[43px] border border-white rounded text-[28px] flex justify-center items-center cursor-pointer select-none"
                      onClick={() => {
                        if (unstakeAmount > 0)
                          setUnstakeAmount(+unstakeAmount - 1);
                      }}
                    >
                      -
                    </div>
                    <input
                      type={"number"}
                      className="numberInput px-1 w-[91px] h-[43px] border border-white bg-transparent rounded text-[24px] text-center outline-none"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                    />
                    <div
                      className="w-[43px] h-[43px] border border-white rounded text-[28px] flex justify-center items-center cursor-pointer select-none"
                      onClick={() => {
                        if (unstakeAmount < tokensStakedAlready)
                          setUnstakeAmount(+unstakeAmount + 1);
                      }}
                    >
                      +
                    </div>
                  </div>
                  <Button
                    className="font-bold text-lg uppercase flex justify-center items-center mt-[30px] w-full"
                    type={
                      unstakeAmount > 0 && !isDisabled
                        ? "primary"
                        : "lightButton"
                    }
                    onClick={unstakeHandler}
                  >
                    {UNSTAKE}
                  </Button>
                </div>
              </div>
              {/* // Pending rewards and claim */}
              <div className="mt-[55px] md:flex justify-between lg:justify-around md:mt-[45px]">
                <p className="text-white text-lg font-medium capitalize mb-[25px] md:mb-[10px]">
                  {PENDING_REWARDS}: {/* round off upto 3 decimals */}
                  {userStakeInfo?._rewards &&
                    Number(
                      +ethers.utils.formatEther(userStakeInfo?._rewards)
                    ).toFixed(3)}{" "}
                  WCFX
                </p>
                <div className="flex justify-center md:block">
                  <Button
                    type={
                      earnedRewards > 0 && !isDisabled
                        ? "primary"
                        : "lightButton"
                    }
                    className="font-bold text-lg uppercase flex justify-center items-center gap-1.5 w-[141px]"
                    onClick={claimHandler}
                  >
                    <Image
                      src={"/icons/claimIcon.svg"}
                      alt={CLAIM}
                      width={16}
                      height={14}
                    />
                    {CLAIM}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* ---------Second Box---------- */}
          <div className="xl:col-span-2 min-[1400px]:col-span-4">
            <div className="md:grid grid-cols-2 gap-10">
              {/* // Total staking */}
              <div className="borderGradient flex flex-col lg:items-center xl:items-start px-[32px] py-[36px]">
                <p className="font-bold text-xl mb-5 text-white">
                  {TOTAL_STAKING}
                </p>
                <p className="font-bold text-[32px] gradientTitle">
                  {totalStakingNTF} {"NTF"}
                </p>
              </div>
              {/* // Estimated reward */}
              <div className="backgroundGradient flex justify-center items-center px-[32px] py-[36px] mt-[22px] md:mt-0">
                <div>
                  <p className="font-bold text-xl mb-5  text-white">
                    {ESTIMATED_REWARD}
                  </p>
                  <p className="font-bold text-[32px] text-white">
                    {195}%<sub className="text-base ml-2">{ARP}</sub>
                  </p>
                </div>
              </div>
            </div>
            {/* // ---------Stats-------- */}
            <div>
              <div className="borderGradient p-[32px] my-[30px] text-white">
                <p className="text-[28px] font-bold mb-5">{SELF_STATS}</p>
                <div className="flex gap-5 md:gap-0 justify-between items-center flex-wrap">
                  <div>
                    <p className="text-xl">{SELF_PRICE}</p>
                    <p className="text-2xl font-bold">$0.0039</p>
                  </div>
                  <div>
                    <p className="text-xl capitalize">{DAILY_REWARDS}</p>
                    <p className="text-2xl font-bold">0.08 WCFX/1000 NTF</p>
                  </div>
                  <div>
                    <p className="text-xl capitalize">{TOTAL_SUPPLY}</p>
                    <p className="text-2xl font-bold">
                      {rewardTokenBalance
                        ? Number(
                            ethers.utils.formatEther(rewardTokenBalance)
                          ).toFixed(2)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="flex justify-center md:block">
              <Button
                type={"primary"}
                className="font-bold text-lg uppercase flex justify-center items-center gap-1.5 w-[140px] mb-10 md:mb-0"
              >
                <Image src={"/icons/claimIcon.svg"} alt={AUDIT} width={16} height={14} />
                {AUDIT}
              </Button>
            </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
