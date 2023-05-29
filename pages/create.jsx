import { useRouter } from "next/router";
import { MarketplaceAddr } from "../addresses";
import { useState } from "react";
import Button from "../components/Button";
import { useAddress, useContract, useSigner } from "@thirdweb-dev/react";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase-config";
import { useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";

// useActiveChain, useSwitchChain, useChainId

const Create = () => {
  // Next JS Router hook to redirect to other pages
  const router = useRouter();
  const { colectionAddr, tokenID } = router.query;
  const [active, setActive] = useState("directListing");
  const [tokenId, setTokenId] = useState("");
  const [directPrice, setDirectPrice] = useState("");
  const [buyoutPrice, setBuyoutPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [startLoading, setStartLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState([]);

  const addr = useAddress();
  const signer = useSigner();
  const address = addr?.toLowerCase();
  const provider = signer?.provider;

  const { contract } = useContract(MarketplaceAddr, "marketplace");

  function secondsBetweenDates(date) {
    const now = new Date().getTime();
    const selected = new Date(date).getTime();
    const diff = Math.abs(selected - now);
    const seconds = Math.floor(diff / 1000);
    console.log("secondsss", seconds);
    return seconds;
  }

  async function handleCreateListing(e) {
    try {
      e.preventDefault();
      if (!signer || !contract) return;
      setStartLoading(true);
      // Data of the listing you want to create
      if (active === "directListing") {
        setStartLoading(true);
        const listing = {
          // address of the NFT contract the asset you want to list is on
          assetContractAddress: colectionAddr?.toLowerCase(),
          // token ID of the asset you want to list
          tokenId: tokenId,
          // when should the listing open up for offers
          startTimestamp: new Date(),
          // how long the listing will be open for
          listingDurationInSeconds: secondsBetweenDates(duration),
          // how many of the asset you want to list
          quantity: 1,
          // address of the currency contract that will be used to pay for the listing
          currencyContractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          // how much the asset will be sold for
          buyoutPricePerToken: +directPrice,
        };

        console.log("listing", listing);

        let alreadyListed = false;
        // query nfts collection to check if token is already listed. check for assetContractAddress and tokenId

        const q1 = query(
          collection(db, "nfts"),
          where("assetContractAddress", "==", colectionAddr?.toLowerCase()),
          where("tokenId", "==", tokenId)
        );

        const querySnapshot = await getDocs(q1);

        querySnapshot.forEach((doc) => {
          if (!doc.data().soldAt) alreadyListed = true;
        });

        if (alreadyListed) {
          alert("Already listed");
          setStartLoading(false);
          return;
        }
        let tx = await contract.direct.createListing.prepare(listing);
        console.log("reached here");
        const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
        tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
        tx = await tx.execute(); // Execute the transaction
        const receipt = tx.receipt; // the transaction receipt
        const listingId = tx.id; // the id of the newly created listing
        console.log("receiptreceipt", receipt);
        console.log("listingIdlistingId", listingId);

        // fetch the listing from the blockchain
        let listingData = await contract.direct.getListing(listingId);

        console.log("listingDataaa", listingData);
        let litstingName = listingData?.asset?.name || "";
        let listingImage = listingData?.asset?.image || "";

        if (
          colectionAddr?.toLowerCase() ==
          "0xbbdba5043a73e87533b9378e58dea577a872dc04"
        ) {
          console.log("swappi calling");
          const contract = new ethers.Contract(
            colectionAddr?.toLowerCase(),
            [
              {
                inputs: [
                  { internalType: "uint256", name: "tokenId", type: "uint256" },
                ],
                name: "tokenURI",
                outputs: [{ internalType: "string", name: "", type: "string" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            provider
          );
          const tokenData = await contract.tokenURI(tokenId);
          console.log("tokenData", tokenData);
          let metadata = await axios.get("/api/swappi", {
            params: { uri: tokenData },
          });
          console.log("result dawtaaa", metadata.data.data);
          litstingName = metadata.data.data.name;
          listingImage = metadata.data.data.image;
        }

        // add listing to firebase
        console.log("going to add this to firebase", {
          ...listing,
          name: litstingName,
          image: listingImage,
          seller: address,
          listingId: +listingId.toString(),
          type: "direct",
        });

        const docRef = await addDoc(collection(db, "nfts"), {
          ...listing,
          name: litstingName,
          image: listingImage,
          seller: address,
          listingId: +listingId.toString(),
          type: "direct",
        });

        const q = query(
          collection(db, "collections"),
          where("collectionAddress", "==", colectionAddr?.toLowerCase())
        );
        const querySnapshot1 = await getDocs(q);

        querySnapshot1.forEach(async (doc) => {
          const docRef = doc.ref;
          const docData = doc.data();
          const listingCount = docData?.listingCount || 0;
          await updateDoc(docRef, {
            listingCount: listingCount + 1,
          });
        });
        setStartLoading(false);
        router.push("/");
      } else {
        // Data of the auction you want to create
        const auction = {
          // address of the contract the asset you want to list is on
          assetContractAddress: colectionAddr?.toLowerCase(),
          // token ID of the asset you want to list
          tokenId: tokenId,
          // when should the listing open up for offers
          startTimestamp: new Date(),
          // how long the listing will be open for
          listingDurationInSeconds: secondsBetweenDates(duration),
          // how many of the asset you want to list
          quantity: 1,
          // address of the currency contract that will be used to pay for the listing
          currencyContractAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          // how much people would have to bid to instantly buy the asset
          buyoutPricePerToken: +buyoutPrice,
          // the minimum bid that will be accepted for the token
          reservePricePerToken: +reservePrice,
        };
        console.log("auction list called", auction);
        //get collection with collection address
        let alreadyListed = false;
        // query nfts collection to check if token is already listed. check for assetContractAddress and tokenId

        const q1 = query(
          collection(db, "nfts"),
          where("assetContractAddress", "==", colectionAddr?.toLowerCase()),
          where("tokenId", "==", tokenId)
        );

        const querySnapshot = await getDocs(q1);

        querySnapshot.forEach((doc) => {
          if (!doc.data().soldAt) alreadyListed = true;
        });

        if (alreadyListed) {
          alert("Already listed");
          setStartLoading(false);
          return;
        }
        let tx = await contract.auction.createListing.prepare(auction);
        const gasLimit = await tx.estimateGasLimit(); // Estimate the gas limit
        tx.setGasLimit(Math.floor(gasLimit.toString() * 1.6));
        tx = await tx.execute(); // Execute the transaction
        const receipt = tx.receipt; // the transaction receipt
        const listingId = tx.id; // the id of the newly created listing
        console.log("receiptreceipt", receipt);
        console.log("listingIdlistingId", listingId);
        console.log("receiptreceipt", receipt);
        console.log("listingIdlistingId", listingId);

        // fetch the listing from the blockchain
        const listingData = await contract.auction.getListing(listingId);
        console.log("listingData", listingData);

        console.log("listingDataaa", listingData);
        let litstingName = listingData?.asset?.name || "";
        let listingImage = listingData?.asset?.image || "";

        if (
          colectionAddr?.toLowerCase() ==
          "0xbbdba5043a73e87533b9378e58dea577a872dc04"
        ) {
          console.log("swappi calling");
          const contract = new ethers.Contract(
            colectionAddr?.toLowerCase(),
            [
              {
                inputs: [
                  { internalType: "uint256", name: "tokenId", type: "uint256" },
                ],
                name: "tokenURI",
                outputs: [{ internalType: "string", name: "", type: "string" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            provider
          );
          const tokenData = await contract.tokenURI(tokenId);
          console.log("tokenData", tokenData);
          let metadata = await axios.get("/api/swappi", {
            params: { uri: tokenData },
          });
          console.log("result dawtaaa", metadata.data.data);
          litstingName = metadata.data.data.name;
          listingImage = metadata.data.data.image;
        }

        // add listing to firebase

        const docRef = await addDoc(collection(db, "nfts"), {
          ...auction,
          name: litstingName,
          image: listingImage,
          seller: address,
          listingId: +listingId.toString(),
          type: "auction",
        });

        const q = query(
          collection(db, "collections"),
          where("collectionAddress", "==", colectionAddr?.toLowerCase())
        );
        const querySnapshot1 = await getDocs(q);

        querySnapshot1.forEach(async (doc) => {
          const docRef = doc.ref;
          const docData = doc.data();
          const listingCount = docData?.listingCount || 0;
          await updateDoc(docRef, {
            listingCount: listingCount + 1,
          });
        });

        setStartLoading(false);
        router.push("/");
      }
    } catch (error) {
      setStartLoading(false);
      console.error("error", error);
    }
  }

  useEffect(() => {
    // if (!colectionAddr) router.push("/");
  }, [colectionAddr]);

  useEffect(() => {
    if (!tokenID) return;
    if (tokenID) setTokenId(tokenID);
  }, [tokenID]);

  useEffect(() => {
    if (!colectionAddr || !address) return;
    setStartLoading(true);
    axios
      .get(
        `https://evmapi.confluxscan.net/nft/tokens?contract=${colectionAddr}&owner=${address}&sort=DESC&sortField=latest_update_time&cursor=0&skip=0&limit=100&withBrief=false&withMetadata=false`
      )
      .then((res) => {
        console.log("api res", res);
        let list = res.data.result.list;
        console.log("listlist", list);
        list = list.filter(
          (item) =>
            item.contract?.toLowerCase() === colectionAddr?.toLowerCase()
        );
        console.log("listlist", list);
        setAvailableTokens(list);
        setTokenId(list[0].tokenId);
        setStartLoading(false);
      })
      .catch((err) => {
        console.log("errerr", err);
        setStartLoading(false);
      });
    setStartLoading(false);
  }, [colectionAddr, address]);

  console.log("tokenId", tokenId);

  return (
    <div className="px-4 pt-[80px] lg:pt-[150px] flex justify-center mb-6">
      {/* Form Section */}
      <div className="flex flex-col justify-center gap-10 items-center w-full lg:w-[50%]">
        <h1 className="conflux-text text-center text-3xl lg:text-5xl lg:mb-10 ">
          Sell your NFT to the Nitfee Market
        </h1>
        <div className="flex flex-col md:flex-row gap-6">
          <Button
            type={active === "directListing" ? "square" : "transparent"}
            onClick={() => setActive("directListing")}
          >
            Direct Listing
          </Button>
          <Button
            onClick={() => setActive("auctionList")}
            type={active === "auctionList" ? "square" : "transparent"}
          >
            Auction Listing
          </Button>
        </div>
        <div className="w-full flex flex-col gap-7">
          <div className="w-full">
            <p>Collection Address</p>
            <input
              type="text"
              name="colectionAddr"
              placeholder="NFT Contract Address"
              className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
              value={colectionAddr}
            />
          </div>
          {/* NFT token id field */}
          <div className="w-full">
            <p>NFT Token ID</p>
            {!tokenID ? (
              <select
                required
                type="text"
                name="tokenId"
                placeholder="NFT Token ID"
                className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
                value={tokenId}
                defaultValue={tokenId || availableTokens[0]?.tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              >
                {availableTokens.map((item) => (
                  <option
                    key={item.tokenId}
                    value={item.tokenId}
                  >{`# ${item.tokenId}`}</option>
                ))}
              </select>
            ) : (
              <input
                required
                type="text"
                name="tokenId"
                placeholder="NFT Token ID"
                className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              />
            )}
          </div>
          {/* <input
          type="text"
          name="quantity"
          placeholder="Quantity"
          className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        /> */}
          {/* Sale Price For Listing Field */}

          {active === "directListing" && (
            <>
              <div className="w-full">
                <p>Price</p>
                <input
                  type="text"
                  name="directPrice"
                  placeholder="Sale Price"
                  className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
                  value={directPrice}
                  onChange={(e) => setDirectPrice(e.target.value)}
                />
              </div>
            </>
          )}

          {active === "auctionList" && (
            <>
              <div className="w-full">
                <p>Buyout Price</p>
                <input
                  type="text"
                  name="Buyout Price Per Token"
                  placeholder="Buyout Price Per Token (How much people would have to bid to instantly buy the asset)"
                  className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
                  value={buyoutPrice}
                  onChange={(e) => setBuyoutPrice(e.target.value)}
                />
              </div>
            </>
          )}
          {/* // the minimum bid that will be accepted for the token */}
          {active === "auctionList" && (
            <>
              <div className="w-full">
                <p>Reserve Price</p>
                <input
                  type="text"
                  name="Reserve Price Per Token"
                  placeholder="Reserve Price Per Token (The minimum bid that will be accepted for the token)"
                  className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="w-full">
            <p>Duration</p>
            <input
              required
              type="date"
              name="duration"
              placeholder="Duration"
              className="w-full p-4 rounded border border-[#696969] bg-transparent outline-none text-white"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={(e) => handleCreateListing(e)}
          className="walletConnectButton px-[36px] py-3 rounded-xl text-white"
        >
          List NFT
        </button>
      </div>
      {startLoading && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default Create;
