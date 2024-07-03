import Head from "next/head";
import { Sidebar } from "@/components/Sidebar";
import { GradientBar } from "@/components/GradientBlob";
import { Bitter } from "next/font/google";

const bitter = Bitter({ display: "swap", subsets: ["latin"] });

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Gimmick AI</title>
      </Head>
      <div
        className={
          bitter.className +
          " relative flex w-full h-full bg-black/50 overflow-hidden"
        }
      >
        <GradientBar className="from-blue-500 h-32 w-full -top-2 left-1/2 opacity-25 -translate-x-1/2 scale-150" />
        <Sidebar />
        <div className="my-2 mr-2 border border-white/20 rounded-md w-11/12">
          {children}
        </div>
      </div>
    </>
  );
}
