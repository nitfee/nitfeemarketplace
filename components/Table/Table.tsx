import { useAddress } from "@thirdweb-dev/react";
import React, { FC } from "react";

interface INftTableProps {
  assetDetails: any;
}

const Table: FC<INftTableProps> = ({ assetDetails }) => {
  const address = useAddress();

  let owner = assetDetails?.sellerAddress == address;
  return (
    <div className="w-full px-5">
      <table className="w-full">
        <tr className={`tr !border-b-[2px] border-[#606770]`}>
          <th className={`text-left p-2 w-1/4`}>Sr #.</th>
          <th className={`text-left p-2 border-x-2 border-[#1f1f21] w-1/2`}>Address</th>
          <th className={`text-left p-2 w-1/4`}>Price</th>
        </tr>

        <tr className="tr">
          <td className="td text-left p-2 w-1/4">1.</td>
          <td className={`td text-left p-2 border-x-2 border-[#1f1f21] w-1/2`}>
            0x1e4B63ef90895925b9Be534a224a05fD6Bf4508e
          </td>
          <td className="td text-left p-2 w-1/4">0.1</td>
        </tr>
        <tr className="tr">
          <td className="td text-left p-2 w-1/4">2.</td>
          <td className={`td text-left p-2 border-x-2 border-[#1f1f21] w-1/2`}>
            0x1e4B63ef90895925b9Be534a224a05fD6Bf4508e
          </td>
          <td className="td text-left p-2 w-1/4">0.1</td>
        </tr>
        <tr className="tr">
          <td className="td text-left p-2 w-1/4">3.</td>
          <td className={`td text-left p-2 border-x-2 border-[#1f1f21] w-1/2`}>
            0x1e4B63ef90895925b9Be534a224a05fD6Bf4508e
          </td>
          <td className="td text-left p-2 w-1/4">0.1</td>
        </tr>
        <tr className="tr">
          <td className="td text-left p-2 w-1/4">4.</td>
          <td className={`td text-left p-2 border-x-2 border-[#1f1f21] w-1/2`}>
            0x1e4B63ef90895925b9Be534a224a05fD6Bf4508e
          </td>
          <td className="td text-left p-2 w-1/4">0.1</td>
        </tr>
      </table>
    </div>
  );
};

export default Table;
