import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Chat } from "@/components/Chat";
import { FaSearch } from "react-icons/fa";
import { GradientBlob } from "@/components/GradientBlob";

function SideBar() {
  return (
    <div className="relative flex flex-col w-1/4 h-screen text-white">
      <GradientBlob
        size="25vw"
        from="from-blue-500"
        classNames="-top-24 -left-1/3"
      />
      <div className="z-10 flex flex-col grow p-4 bg-black/50">
        <div className="text-white/50 font-bold tracking-wide mb-6 text-sm">
          gimmick
        </div>
        <Link href="/">
          <span className="text-white">
            <FaSearch className="mr-2 inline-flex" /> Search
          </span>
        </Link>
        <Link href="/about">
          <span className="text-white">About</span>
        </Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <React.Fragment>
      <Head>
        <title>Gimmick AI</title>
      </Head>
      <div className="flex w-full bg-black">
        <SideBar />
        <div className="flex my-2 mr-2 p-2 bg-neutral-900 rounded-md grow w-3/4">
          <Chat />
        </div>
      </div>
    </React.Fragment>
  );
}
