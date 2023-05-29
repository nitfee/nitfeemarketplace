import { db } from "@/helpers/firebase-config";
import {
  MediaRenderer,
  useAddress,
  useListing,
  useSDK,
} from "@thirdweb-dev/react";
import { utils } from "ethers";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MarketplaceAddr } from "../../addresses";
import styles from "../../styles/Home.module.css";

const ListingPage: NextPage = () => {
  const [contract, setContract] = useState<any>(null);
  const [minNextBid, setMinNextBid] = useState<any>(null);
  const [winningBid, setWinningBid] = useState<any>(null);
  const [secondsTillEnd, setSecondsTillEnd] = useState<any>(null);
  const [winnerAddress, setWinnerAddress] = useState("");
  const [swappiData, setSwappiData] = useState<any>(null);
  const [alreadySold, setAlreadySold] = useState(0);
  const router = useRouter();
  const address = useAddress();
  const sdk = useSDK();

  const { listingId } = router.query as { listingId: string };

  useEffect(() => {
    if (!sdk) return;
    const getContract = async () => {
      const contract = await sdk.getContract(MarketplaceAddr, "marketplace");
      setContract(contract);
      // get listing data from firebase
      const q = query(
        collection(db, "nfts"),
        where("listingId", "==", +listingId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.assetContractAddress.toLowerCase() ==
          "0xbbdba5043a73e87533b9378e58dea577a872dc04"
        ) {
          setSwappiData(data);
          console.log(data, "swappiData");
        }
        if (data.soldAt) {
          setAlreadySold(data.soldAt);
        }
      });
    };
    getContract();
  }, [sdk]);

  const {
    data: listing,
    isLoading: loadingListing,
    error: listingError,
  } = useListing(contract, listingId) as any;

  console.log(listing, "listingData");
  console.log(loadingListing, "loadingListing");
  console.log(listingError, "listingError");

  const [bidAmount, setBidAmount] = useState<string>("");

  console.log("contractt", contract);

  console.log(listing, "listingData");
  const createBidHandler = async () => {
    if (
      !contract ||
      secondsTillEnd < 0 ||
      bidAmount < minNextBid ||
      secondsTillEnd < 0 ||
      !secondsTillEnd
    )
      return;
    try {
      let tx: any = await contract.auction.makeBid.prepare(
        listingId,
        bidAmount
      );
      const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
      tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
      tx = await tx.execute(); // Execute the transaction
      alert("Bid created successfully!");
      minimumNextBid();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  async function buyNft() {
    if (!listing) return;

    try {
      let tx: any = await contract?.buyoutListing.prepare(listingId, 1);
      const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
      tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
      tx = await tx.execute(); // Execute the transaction
      // get the nft from nfts collection in firebase and add soldAt field

      const q = query(
        collection(db, "nfts"),
        where("listingId", "==", +listingId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          soldAt: new Date().getTime(),
          buyer: address?.toLowerCase(),
        });
      });

      // remove nft from array nfts containing nft token ids in collection "collections"

      const q2 = query(
        collection(db, "collections"),
        where(
          "collectionAddress",
          "==",
          listing?.assetContractAddress?.toLowerCase()
        )
      );
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(async (doc) => {
        const data = doc.data();
        await updateDoc(doc.ref, {
          listingCount: data?.listingCount - 1,
        });
      });

      alert("NFT bought successfully!");
      router.push("/");
    } catch (error: any) {
      console.log("errror", error.message);
      if (error.message.includes("is no longer valid")) {
        deleteListingHandler();
      }
      alert(error);
    }
  }

  const cancelListingHandler = async () => {
    try {
      if (!contract) return;
      if (listing?.type === 0) {
        let tx: any = await contract.direct.cancelListing.prepare(listingId);
        const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
        tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
        tx = await tx.execute(); // Execute the transaction

        console.log(tx, "txResult");

        // delete data from firebase
        const q = query(
          collection(db, "nfts"),
          where("listingId", "==", +listingId)
        );
        // get doc id

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // delete it from array nfts containing nft token ids in collection "collections"

        const q2 = query(
          collection(db, "collections"),
          where(
            "collectionAddress",
            "==",
            listing?.assetContractAddress?.toLowerCase()
          )
        );
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach(async (doc) => {
          const data = doc.data();
          await updateDoc(doc.ref, {
            listingCount: data.listingCount - 1,
          });
        });
        alert("Listing cancelled successfully!");
        router.push("/");
      } else if (listing?.type === 1) {
        let tx: any = await contract.auction.cancelListing.prepare(listingId);
        const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
        await tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
        tx = await tx.execute(); // Execute the transaction

        console.log(tx, "txResult");

        // delete data from firebase
        const q = query(
          collection(db, "nfts"),
          where("listingId", "==", +listingId)
        );
        // get doc id

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // delete it from array nfts containing nft token ids in collection "collections"

        const q2 = query(
          collection(db, "collections"),
          where(
            "collectionAddress",
            "==",
            listing?.assetContractAddress?.toLowerCase()
          )
        );
        const querySnapshot2 = await getDocs(q2);
        querySnapshot2.forEach(async (doc) => {
          const data = doc.data();
          await updateDoc(doc.ref, {
            listingCount: data?.listingCount - 1,
          });
        });

        alert("Listing cancelled successfully!");
      }
    } catch (e) {
      alert(e);
    }
  };
  console.log("minnextbidd", minNextBid);
  console.log("contractt", contract);

  function formatTime(seconds: number) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    let result = "";
    if (days > 0) {
      result += `${days}d `;
    }
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (minutes > 0) {
      result += `${minutes}m `;
    }
    if (remainingSeconds > 0) {
      result += `${Math.floor(remainingSeconds)}s`;
    }
    return result.trim();
  }

  const minimumNextBid = async () => {
    const minimumNextBid = await contract.auction.getMinimumNextBid(listingId);
    console.log(minimumNextBid, "minimumNextBid");
    setMinNextBid(minimumNextBid.displayValue);
  };
  const getWinningBid = async () => {
    const winningBid = await contract.auction.getWinningBid(listingId);
    if (!winningBid) {
      setWinningBid("0");
      return;
    }
    console.log("getWinningBid", winningBid);
    console.log(
      utils.formatEther(winningBid.pricePerToken.toString()),
      "winningBid"
    );
    setWinnerAddress(winningBid.buyerAddress);
    setWinningBid(utils.formatEther(winningBid.pricePerToken.toString()));
  };

  //calcTime every 5 seconds

  let interval: any;
  useEffect(() => {
    if (listing?.type == 1) {
      interval = setInterval(() => {
        console.log("runningrun");
        setSecondsTillEnd(
          (+listing?.endTimeInEpochSeconds.toString() * 1000 -
            new Date().getTime()) /
            1000
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [listing]);

  useEffect(() => {
    if (listing?.type === 1) {
      setSecondsTillEnd(
        (+listing?.endTimeInEpochSeconds.toString() * 1000 -
          new Date().getTime()) /
          1000
      );
      minimumNextBid();
      getWinningBid();
    }
  }, [listing]);

  const deleteListingHandler = async () => {
    console.log("deleteListingHandler", listingId);
    try {
      // delete data from firebase
      const q = query(
        collection(db, "nfts"),
        where("listingId", "==", +listingId)
      );
      // get doc id
      let fetchedDocData: any;

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        fetchedDocData = doc.data();
        await deleteDoc(doc.ref);
      });
      const q2 = query(
        collection(db, "collections"),
        where(
          "collectionAddress",
          "==",
          fetchedDocData?.assetContractAddress?.toLowerCase()
        )
      );
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(async (doc) => {
        const data = doc.data();
        await updateDoc(doc.ref, {
          listingCount: data.listingCount - 1,
        });
      });
      router.push("/");
    } catch (e) {
      console.log("delete error", e);
    }
  };

  if (loadingListing) {
    return <div className={styles.loadingOrError}>Loading...</div>;
  }

  if (!listing && listingError) {
    if (listingError.message.includes("Could not find listing")) {
      console.log(listingError.message, "listingErrorrr");
      deleteListingHandler();
    }
  }

  if (!listing) {
    return <div className={styles.loadingOrError}>Listing not found</div>;
  }
  const transferBackHandler = async () => {
    try {
      await contract.auction.closeListing(listingId, address);
      console.log("NFT transferred back to you successfuly");
      // remove nft from firebase
      const q = query(
        collection(db, "nfts"),
        where("listingId", "==", +listingId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      // delete it from array nfts containing nft token ids in collection "collections"

      const q2 = query(
        collection(db, "collections"),
        where(
          "collectionAddress",
          "==",
          listing?.assetContractAddress?.toLowerCase()
        )
      );
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(async (doc) => {
        const data = doc.data();
        await updateDoc(doc.ref, {
          listingCount: data.listingCount - 1,
        });
      });
      alert("Transfer successful!");

      router.push("/");
    } catch (e) {
      console.log(e);
      console.log(e);
      alert("Transfer Failed!");
    }
  };

  const transferToBuyerHandler = async () => {
    try {
      const tx = await contract.auction.closeListing(listingId, winnerAddress);
      await contract.auction.closeListing(listingId, address);

      console.log("NFT sold successfuly");

      // add soldAt to firebase
      const q = query(
        collection(db, "nfts"),
        where("listingId", "==", +listingId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, {
          soldAt: new Date().getTime(),
          buyer: winnerAddress,
        });
      });
      router.push("/");
    } catch (e) {
      console.log(e);
      alert("Transfer Failed!");
    }
  };

  let ownerButton;
  if (listing.sellerAddress?.toLowerCase() == address?.toLowerCase()) {
    if (
      listing.type == 0 &&
      listing.sellerAddress?.toLowerCase() == address?.toLowerCase()
    ) {
      ownerButton = (
        <button
          className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
          onClick={cancelListingHandler}
          //todo cancel sale
        >
          Cancel Listing
        </button>
      );
    }
    if (listing.type == 1 && winningBid > 0 && secondsTillEnd < 0) {
      ownerButton = (
        <div className="flex w-full gap-3 md:flex-row flex-col">
          <button
            className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
            onClick={transferBackHandler}
            //todo cancel sale
          >
            Cancel Sale
          </button>
          <button
            style={{ background: "#1f2b49b3" }}
            className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
            onClick={transferToBuyerHandler}
            //todo cancel sale
          >
            Execute Sale ({winningBid})
          </button>
        </div>
      );
    }
    if (
      listing.type == 1 &&
      (!winningBid || winningBid <= 0) &&
      secondsTillEnd < 0
    ) {
      ownerButton = (
        <button
          className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
          onClick={cancelListingHandler}
          //todo cancel sale
        >
          Close Sale
        </button>
      );
    }
    if (listing.type == 1 && (!winningBid || winningBid == 0)) {
      ownerButton = (
        <button
          className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
          onClick={transferBackHandler}
          //todo conclude sale
        >
          Cancel Listing
        </button>
      );
    }
    if (listing.type == 1 && winningBid > 0 && secondsTillEnd > 0) {
      ownerButton = (
        <button
          className="uppercase font-bold border-none text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full xl:mr-5 max-w-[618px]"
          disabled
        >
          Winning Bid ({winningBid})
        </button>
      );
    }
  }

  return (
    <div className={`${styles.container} mb-10`}>
      <h2 className="font-extrabold md:text-[64px] text-[42px] leading-[77px] tracking-wide md:mt-[190px] md:mb-[100px] mt-28 mb-12">
        Item details
      </h2>

      <div className={styles.listingContainer}>
        <div className={styles.leftListing}>
          <MediaRenderer
            src={swappiData ? swappiData.image : listing.asset.image}
            className="w-[552px] h-auto max-w-full"
            width="552"
            height="552"
          />
        </div>

        <div className={styles.rightListing}>
          <div className="flex md:justify-between justify-center w-full">
            <h1 className="font-extrabold md:text-[48px] text-[32px] leading-[58px] tracking-wide mb-4">
              {swappiData ? swappiData.name : listing.asset.name}
            </h1>
            {listing.type == 1 && (
              <>
                {secondsTillEnd > 0 ? (
                  <p className="pt-3 md:flex hidden">
                    Closing in {formatTime(secondsTillEnd)}
                  </p>
                ) : (
                  <p className="text-red-400 pt-3 md:flex hidden">
                    Listing Inactive
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex md:mb-10 mb-6">
            <p className="text-[#B2B2B2] font-medium text-xl leading-6 tracking-wide mr-5">
              Current Price:
            </p>
            <p className="font-extrabold text-[22px] leading-7 tracking-wide text-gradient">
              {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
              {listing.buyoutCurrencyValuePerToken.symbol}
            </p>
          </div>
          <div
            className={`w-full relative max-w-[618px] h-auto md:min-h-[500px] min-h-[300px] bg-[#16192A] border-2 border-[#2E3150] rounded-xl md:pt-12 ${
              listing.type == 1 ? "pt-10" : "pt-4"
            }  md:pb-8 pb-4  md:px-10 px-5 md:mb-10 mb-5`}
          >
            {listing.type == 1 && (
              <>
                {secondsTillEnd > 0 ? (
                  <p className="pt-3 md:hidden absolute top-1 right-6">
                    Closing in {formatTime(secondsTillEnd)}
                  </p>
                ) : (
                  <p className="text-red-400 pt-3 md:hidden absolute top-1 right-6">
                    Listing Inactive
                  </p>
                )}
              </>
            )}
            <p className="text-[#878788] font-medium text-xl leading-9 tracking-wide capitalize md:mb-7 mb-3.5">
              {listing?.asset?.description}
            </p>
            <div className="flex items-center">
              <Image
                src="/images/dummy_person.png"
                alt="person-img"
                width={64}
                height={64}
                className="mr-4 md:w-16 md:h-16 h-12 w-12"
              />
              <div>
                <p className="font-medium md:text-xl text-base md:leading-6 leading-4 mb-2">
                  @
                  {listing.sellerAddress?.slice(0, 6) +
                    "..." +
                    listing.sellerAddress?.slice(36, 40)}
                </p>
                <p className="font-medium text-[15px] leading-[16px] text-[#878788]">
                  Owner
                </p>
              </div>
            </div>
            <div className="mt-7">
              <p>
                <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                  Token ID:
                </b>
                <span className="text-[#878788] font-normal md:text-xl text-base ">
                  {listing.asset.id || "N/A"}
                </span>
              </p>
            </div>
            <div className="mt-2">
              <p>
                <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                  Listing Type:
                </b>
                <span className="text-[#878788] font-normal md:text-xl text-base ">
                  {listing.type == 0 ? "Fixed Price" : "Auction"}
                </span>
              </p>
            </div>
            <div className="mt-2">
              {alreadySold > 0 && (
                <p>
                  <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                    Sold At:
                  </b>
                  <span className="text-[#878788] font-normal md:text-xl text-base ">
                    {new Date(alreadySold)?.toLocaleString()}
                  </span>
                </p>
              )}
            </div>
            <hr className="md:my-6 my-3.5 border border-slate-700" />
            <div className="">
              {
                <div className="mt-2">
                  <p>
                    <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                      Listing Date:
                    </b>
                    <span className="text-[#878788] font-normal md:text-xl text-base ">
                      {listing.type == 0
                        ? new Date(
                            +listing?.startTimeInSeconds?.toString() * 1000
                          )?.toLocaleString()
                        : new Date(
                            +listing?.startTimeInEpochSeconds?.toString() * 1000
                          )?.toLocaleString()}
                    </span>
                  </p>
                </div>
              }

              {listing.type == 1 && (
                <div className="mt-2">
                  <p>
                    <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                      Closing Date:
                    </b>
                    <span className="text-[#878788] font-normal md:text-xl text-base ">
                      {listing.type == 1 &&
                        new Date(
                          +listing?.endTimeInEpochSeconds.toString() * 1000
                        ).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
              {listing.type == 1 &&
                address?.toLowerCase() ==
                  listing?.sellerAddress?.toLowerCase() && (
                  <div className="mt-2">
                    <p>
                      <b className="font-extrabold md:text-xl text-base leading-6 capitalize tracking-wide mr-2">
                        Winning Bid
                      </b>
                      <span className="text-[#878788] font-normal md:text-xl text-base ">
                        {winningBid}
                      </span>
                    </p>
                  </div>
                )}
            </div>
          </div>

          {
            <div className="flex gap-5 items-center w-full xl:pr-10 md:flex-row flex-col">
              {address?.toLowerCase() ==
              listing.sellerAddress?.toLowerCase() ? (
                ownerButton
              ) : (
                <button
                  style={{ borderStyle: "none" }}
                  className="uppercase font-bold text-base text-white gap-2 px-6 py-3 rounded-xl walletConnectButton  text-center !flex !items-center !justify-center flex-1 md:w-auto w-full  max-w-[618px]"
                  onClick={buyNft}
                  disabled={secondsTillEnd < 0 || alreadySold > 0}
                >
                  {alreadySold > 0 ? (
                    "Sold Out"
                  ) : (
                    <span>
                      BUY IT NOW ({" "}
                      {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
                      {listing.buyoutCurrencyValuePerToken.symbol})
                    </span>
                  )}
                </button>
              )}

              {address?.toLowerCase() !==
                listing?.sellerAddress?.toLowerCase() &&
                listing.type !== 0 && (
                  <>
                    <p className="text-slate-500 md:flex hidden">|</p>
                    <p className="text-slate-500 md:hidden">OR</p>

                    <div
                      className="md:w-auto w-full"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <input
                        type="text"
                        name="bidAmount"
                        className={styles.textInput}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Amount"
                        style={{ marginTop: 0, marginLeft: 0, width: 128 }}
                        value={bidAmount}
                        disabled={secondsTillEnd < 0}
                      />

                      <button
                        className={`${styles.mainButton} ml-2`}
                        onClick={createBidHandler}
                        disabled={secondsTillEnd < 0}
                        style={{
                          borderStyle: "none",
                          width: "fit-content",
                        }}
                      >
                        Bid Now
                      </button>
                    </div>
                  </>
                )}
            </div>
          }
          <div className="h-6 flex justify-end w-full">
            {listing.type == 1 &&
              minNextBid &&
              +bidAmount < +minNextBid &&
              address?.toLowerCase() !==
                listing?.sellerAddress?.toLowerCase() && (
                <p className="text-right w-full mt-2 pr-3">
                  Minimum next bid: {minNextBid}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
