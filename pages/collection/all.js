import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import Loading from "../../components/Loading/index";
import { CATEGORIES } from "../../constants";
import { db } from "../../helpers/firebase-config";

const All = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [allCollectionsData, setAllCollectionsData] = useState([]);
  const [allCollectionLoading, setAllCollectionLoading] = useState(false);
  useEffect(() => {
    //only get collections in which collection.nfts.length > 0
    (async () => {
      if (!selectedType) {
        setAllCollectionLoading(true);
        const collectionRef = collection(db, "collections");
        const q = query(collectionRef, orderBy("createdAt", "desc"));
        const collectionSnapshot = await getDocs(q);
        const collectionList = collectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("collectionList", collectionList);
        setAllCollectionsData(collectionList);
        setAllCollectionLoading(false);
      }
      if (selectedType) {
        setAllCollectionLoading(true);

        const collectionRef = collection(db, "collections");
        const q = query(
          collectionRef,
          where("category", "==", selectedType),
          orderBy("createdAt", "desc")
        );
        const collectionSnapshot = await getDocs(q);
        const collectionList = collectionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllCollectionsData(collectionList);
        setAllCollectionLoading(false);
        console.log("collectionList", collectionList);
      }
    })();
  }, [selectedType]);

  return (
    <div className="md:px:20 px-5 mx-auto md:pt-32 pt-28 md:pb-20 pb-12">
      <h1 className="text-[32px] lg:text-[59px] font-semibold text-white text-center mb-12">
        All Collections
      </h1>
      <div className="flex justify-start lg:justify-center items-center gap-5 md:mb-12 mb-8 overflow-x-scroll ">
        {CATEGORIES?.map((category) => (
          <Button
            key={category}
            type="rounded"
            className="md:w-auto"
            onClick={() => {
              category == "All"
                ? setSelectedType(null)
                : setSelectedType(category);
            }}
          >
            {category}
          </Button>
        ))}
      </div>
      {/* MAKE a stylish grid with collection cover animation */}
      <>
        {allCollectionLoading ? (
          <div className="flex justify-center w-full">
            <Loading isLoading={allCollectionLoading} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <>
              {allCollectionsData.map((collection) => (
                <Link
                  href={`/collection/${collection?.collectionAddress?.toLowerCase()}`}
                  key={collection.id}
                >
                  <div
                    key={collection.id}
                    className="md:flex-1 md:h-72 h-40 rounded-lg relative group "
                  >
                    <img
                      src={collection.image}
                      className="w-full h-full object-cover"
                      alt="marketplan"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black to-transparent hidden justify-center items-center group-hover:flex cursor-pointer">
                      <div className="text-center">
                        <p className="font-semibold md:text-2xl text-base ">
                          {collection.name}
                        </p>
                        <p className="text-white md:text-[18px] text-sm font-semibold">
                          {collection.nfts.length} Listings
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          </div>
        )}
      </>
    </div>
  );
};

export default All;
