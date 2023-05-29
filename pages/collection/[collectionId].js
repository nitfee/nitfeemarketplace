import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import NftCard from "../../components/NftCard";
import { db } from "../../helpers/firebase-config";
import Button from "../../components/Button";

const Collection = () => {
  const [collectionData, setCollectionData] = useState([]);
  const [collectionDataLoading, setCollectionDataLoading] = useState(false);
  const [nftsList, setNftsList] = useState([]);
  const router = useRouter();
  const { collectionId } = router.query;

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      setCollectionDataLoading(true);
      const collectionRef = collection(db, "collections");
      const q = query(
        collectionRef,
        where("collectionAddress", "==", collectionId?.toLowerCase())
      );
      const collectionSnapshot = await getDocs(q);
      const collectionData = collectionSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCollectionDataLoading(false);
      setCollectionData(collectionData);
    })();
  }, [collectionId]);

  useEffect(() => {
    if (!collectionId) return;

    (async () => {
      // fetch nfts of this collection from firebase
      const nftsRef = collection(db, "nfts");
      const q = query(
        nftsRef,
        where("assetContractAddress", "==", collectionId?.toLowerCase()),
        orderBy("buyoutPricePerToken", "asc")
      );
      console.log("qqqq", q);
      const nftsSnapshot = await getDocs(q);
      const nftsData = nftsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("nftsData", nftsData);
      const availableNftsData = nftsData.filter((item) => !item.soldAt);
      console.log("availableNftsData", availableNftsData);
      setNftsList(availableNftsData);
    })();
  }, [collectionId]);

  // get collection data from firbase using address

  return (
    <>
      <Head>
        <title>{collectionData[0]?.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="List Your NFTs For Sale, Accept Bids, and Buy NFTs"
        />
        <meta
          name="keywords"
          content="Thirdweb, Marketplace, NFT Marketplace Tutorial, NFT Auction Tutorial, How To Make OpenSea"
        />
      </Head>
      <div className="px-4 py-6 lg:px-[75px] lg:py-[120px]">
        <div className="flex md:px-10 md:pb-10 pb-5 px-5 flex-col items-center w-full bg-[#16192A] border-[2px] border-[#2E3150] rounded-[10px] md:pt-10 pt-5 lg:mt-0 mt-20">
          <h1 className="text-4xl font-bold text-center justify-center mb-4">
            {collectionData[0]?.name}
          </h1>
          <p>{collectionData[0]?.description}</p>

          <Button
            onClick={() => {
              router.push({
                pathname: `/create`,
                query: { colectionAddr: collectionId?.toLowerCase() },
              });
            }}
            className="mt-10 uppercase font-bold text-base text-white flex gap-2 items-center px-6 py-3 rounded-xl walletConnectButton"
          >
            List NFT
          </Button>
        </div>
        <div className="mt-[50px] md:mt-[100px] grid md:grid-cols-3 min-[1380px]:grid-cols-4 gap-4 ">
          {nftsList.map((item) => (
            <div
              key={item.listingId}
              className="cursor-pointer"
              onClick={() =>
                router.push({
                  pathname: `/listing/${item.listingId}`,
                })
              }
            >
              {console.log("item", item)}
              <NftCard
                key={item.id}
                name={`${item.name} (#${item.tokenId})`}
                price={item.buyoutPricePerToken}
                symbol={"CFX"}
                user={item.seller.slice(0, 5) + "..." + item.seller.slice(-4)}
                image={item.image}
                sold={item.soldAt > 0 ? true : false}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Collection;
