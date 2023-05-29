import { useAddress, useSigner } from "@thirdweb-dev/react";
import axios from "axios";
import { ethers } from "ethers";
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
  const [startLoading, setStartLoading] = useState(false);
  const router = useRouter();
  const address = useAddress();
  // const address = "0xF2cbFf4D73800b3365DdB5D550E8F5AD64efcDF0";
  // const address = "0xf33ae9504E738eB253a5FE9629414c41F0b242BE";
  const signer = useSigner();
  const provider = signer?.provider;

  useEffect(() => {
    // get all collections from firebase and then make array of collectionAddress
    (async () => {
      if (!provider) return;
      try {
        setStartLoading(true);
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

        const res = await axios.get(
          `https://evmapi.confluxscan.net/nft/balances?owner=${address}`
        );
        console.log("before list");
        let userCollections = res.data.result?.list || [];
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

        let nftPromises = [];
        for (let i = 0; i < relevantCollections.length; i++) {
          nftPromises.push(
            axios.get(
              `https://evmapi.confluxscan.net/nft/tokens?contract=${relevantCollections[i].contract}&owner=${address}&sort=DESC&sortField=latest_update_time&cursor=0&skip=0&limit=10&withBrief=false&withMetadata=false`
            )
          );
        }

        let nftPromisesRes = await Promise.all(nftPromises);
        console.log("nftPromisesRes", nftPromisesRes);

        let nfts = [];
        for (let i = 0; i < nftPromisesRes.length; i++) {
          nfts = [...nfts, ...nftPromisesRes[i].data.result?.list];
        }
        // create contract instance for each nft and get name and image by calling contract uri
        let tokenUriPromises = [];
        for (let i = 0; i < nfts.length; i++) {
          const contract = new ethers.Contract(
            nfts[i].contract,
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

          tokenUriPromises.push(contract.tokenURI(nfts[i].tokenId));
          // const res = await axios.get(uri);
          // nfts[i].image = res.data.image;
        }
        let ipfsLinks = await Promise.all(tokenUriPromises);
        console.log("tokenUriLinks", ipfsLinks);

        let nftName = "";
        let nftImage = "";
        let formattedLink = "";

        for (let i = 0; i < ipfsLinks.length; i++) {
          if (ipfsLinks[i].includes("swappi")) {
            console.log("swappi calling");
            let data = await axios.get("/api/swappi", {
              params: { uri: ipfsLinks[i] },
            });
            console.log("result dawtaaa", data.data.data);
            nftName = data.data.data.name;
            nftImage = data.data.data.image;
          } else {
            formattedLink = ipfsLinks[i].replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
            const res = await axios.get(formattedLink);
            console.log("result dataaa2", res.data);

            nftName = res.data.name;
            nftImage = res.data.image.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            );
          }
          nfts[i].name = nftName;
          nfts[i].image = nftImage;
        }
        console.log("nftss", nfts);
        setNftsData(nfts);
        setNftsDataLoading(false);
        setStartLoading(false);
      } catch (e) {
        setNftsDataLoading(false);
        setStartLoading(false);
        console.log(e);
      }
    })();
  }, [provider]);

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
              key={Math.random().toString()}
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
      {startLoading && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </>
  );
};

export default creator;
