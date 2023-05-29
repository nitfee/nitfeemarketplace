import React, { FC, ReactNode } from "react";
import Footer from "../Footer";
import Navbar from "../Navbar";

type ILayoutProps = {
  children?: ReactNode;
};

const Layout: FC<ILayoutProps> = ({ children }: ILayoutProps) => {
  return (
    <div className="bg-dark">
      <Navbar />
      <main className={`min-h-screen`}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
