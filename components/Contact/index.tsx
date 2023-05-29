import Image from "next/image";
import React from "react";
import contactImage from "../../public/images/contact-us.png";
import Button from "../Button";

const Contact = () => {
  return (
    <div className="flex md:justify-between items-center md:flex-row flex-col">
      <div className="md:w-[50%]">
        <Image
          src={contactImage}
          alt="marketplan"
          className="md:w-[580px] md:h-[663px] object-contain"
        />
      </div>
      <div className="md:w-[50%]">
        <p className="md:text-[56px] text-[40px] font-extrabold text-textLight">
          Nitfee ai chat bot
        </p>
        <p className="text-textLight md:mt-9 mt-5">
          Our AI chat bot provides quick and efficient responses to your
          inquiries 24/7. It's designed to make your experience with us seamless
          while ensuring accurate answers to your questions. Try it out for help
          with your account, questions about our services.
        </p>
        <div className="flex md:flex-row flex-col md:gap-10 gap-5 w-full md:mt-[60px] mt-8">
          <div className="md:w-[75%] bg-[#FFFFFF1A] rounded-full p-4">
            <input
              className="w-full p-4 text-textLight"
              placeholder="Start typing..."
              style={{ all: "unset" }}
            />
          </div>
          <Button className="md:max-h-unset max-h-[50px]" type="rounded">
            chat now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
