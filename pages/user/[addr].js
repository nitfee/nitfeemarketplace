import { useAddress } from "@thirdweb-dev/react";
import axios from "axios";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import NftCard from "../../components/NftCard";
import { db } from "../../helpers/firebase-config";
import creatorImage from "../../public/images/creator-image.png";

const creator = () => {
  const [nftsData, setNftsData] = useState([]);
  const [nftsDataLoading, setNftsDataLoading] = useState(true);
  const router = useRouter();
  const address = useAddress();

  useEffect(() => {
    // get all collections from firebase and then make array of collectionAddress
    (async () => {
      try {
        setNftsDataLoading(true);
        const collectionRef = collection(db, "collections");
        const collectionSnapshot = await getDocs(collectionRef);
        const collectionList = collectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("collectionList", collectionList);
        let collectionAddress = [];
        collectionList.map((item) => {
          collectionAddress.push(item.collectionAddress?.toLowerCase());
        });
        console.log("collectionAddress", collectionAddress);

        let collectionAddressAndImages = {};
        for (let i = 0; i < collectionList.length; i++) {
          collectionAddressAndImages[
            collectionList[i].collectionAddress?.toLowerCase()
          ] = collectionList[i].image;
        }
        console.log("collectionAddressAndImages", collectionAddressAndImages);
        // collectionAddressAndName

        let collectionAddressAndName = {};
        for (let i = 0; i < collectionList.length; i++) {
          collectionAddressAndName[
            collectionList[i].collectionAddress?.toLowerCase()
          ] = collectionList[i].name;
        }

        // get all collections of users from confluxscan
        const res = await axios.get(
          `https://evmapi.confluxscan.net/nft/balances?owner=${address}`
        );
        console.log("before list");
        let userCollections = res.data.result?.list;
        let relevantCollections = [];
        // see if collection.contract is in collectionAddress

        for (let i = 0; i < userCollections.length; i++) {
          if (
            collectionAddress.includes(
              userCollections[i].contract?.toLowerCase()
            )
          ) {
            relevantCollections.push(userCollections[i]);
          }
        }

        console.log("relevantCollections", relevantCollections);
        // now get all nfts of relevantCollections using conflux api
        let nfts = [];
        for (let i = 0; i < relevantCollections.length; i++) {
          const res = await axios.get(
            `https://evmapi.confluxscan.net/nft/tokens?contract=${relevantCollections[i].contract}&owner=${address}&sort=DESC&sortField=latest_update_time&cursor=0&skip=0&limit=10&withBrief=false&withMetadata=false`
          );
          console.log("before list 2");
          nfts = [...nfts, ...res.data.result?.list];
        }

        console.log("nfts", nfts);

        // go over nfts and add image to them according to collectionAddressAndImages
        for (let i = 0; i < nfts.length; i++) {
          nfts[i].image =
            collectionAddressAndImages[nfts[i].contract?.toLowerCase()];
          nfts[i].name =
            collectionAddressAndName[nfts[i].contract?.toLowerCase()];
        }

        setNftsData(nfts);
        setNftsDataLoading(false);
      } catch (e) {
        setNftsDataLoading(false);
        console.log(e);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Nitfee Marketplace</title>
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
        <div className="w-full h-[300px] lg:mt-0 mt-20 bg-[#16192A] border-[2px] relative border-[#2E3150] rounded-[10px] flex justify-center items-end">
          <h1 className="text-3xl font-extrabold absolute top-12">
            Available NFT's To List
          </h1>

          <div className="relative  text-center">
            <Image
              src={creatorImage}
              alt="Nitee marketplace"
              width={240}
              height={240}
              className=""
            />
            <h1 className="text-textLight font-extrabold text-[22px]">
              {address && address.slice(0, 5) + "..." + address.slice(-4)}
            </h1>
          </div>
        </div>
        <div className="mt-[120px] md:mt-[250px] grid md:grid-cols-3 min-[1380px]:grid-cols-4 gap-4 ">
          {nftsData.map((item) => (
            <div
              className="cursor-pointer"
              onClick={() =>
                router.push({
                  pathname: "/create",
                  query: {
                    colectionAddr: item.contract,
                    tokenID: item.tokenId,
                  },
                })
              }
            >
              <NftCard
                key={item.id}
                name={`${item.name}`}
                price={`#${item.tokenId}`}
                user={
                  item.contract.slice(0, 5) + "..." + item.contract.slice(-4)
                }
                image={item.image}
                type="List NFT"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default creator;
