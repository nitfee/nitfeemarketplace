import React, { CSSProperties, FC } from "react";
import BeatLoader from "react-spinners/BeatLoader";

interface ILoadingProps {
  isLoading: boolean;
}

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
};

const Loading: FC<ILoadingProps> = ({ isLoading }) => {
  return (
    <div className="flex justify-center w-full">
      <BeatLoader
        color={"#ffffff32"}
        loading={isLoading}
        cssOverride={override}
        size={30}
        speedMultiplier={1}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Loading;
