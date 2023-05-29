import React, { FC } from "react";

const Footer: FC = () => {
  return (
    <div className="px-4 lg:px-[90px]">
      <div className="block text-center lg:text-inherit lg:flex justify-between  py-11  text-[#FFFFFF80] border-t border-gray-800">
        <p className="mb-2 lg:mb-0" >@2023NITFEE. All rights reserved </p>
        <div className="text-sm flex gap-12 justify-center lg:justify-normal text-[#FFFFFF80] lg:text-base">
          <p>Terms & Agreements</p>
          <p>Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
