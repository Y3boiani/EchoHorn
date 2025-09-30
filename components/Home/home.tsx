"use client";
import SwiperEffect from "../swiperEffect/swiperEffect";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export default function Home() {
  return (
    // The background image is now set directly as a string path
    <div
      className="w-full h-screen bg-cover bg-no-repeat flex items-center relative"
      style={{
        backgroundImage: `url("/background.png")`, // Changed to a simple URL string
        backgroundPosition: "75% 55%",
      }}
    >
    
      {/* Text + Animated Typing */}
      <h1 className="text-white text-[5rem] font-[poppins,sans-serif] ml-[50px] leading-[1.1] select-none">
        <ul className="relative -mb-10 w-max" style={{ bottom: "180px" }}>
          <li>
            <span className={poppins.className}>Engineering the quiet</span>
          </li>
          <li>
            <span className={poppins.className}> in the chaos of</span>
          </li>
          <li
            className="text-[rgb(148,150,14)] w-0 overflow-hidden whitespace-nowrap border-r-2 border-[rgb(148,150,14)]"
            style={{
              animation:
                "typingLoop 4s steps(25) infinite, blink 0.5s step-end infinite",
            }}
          >
            <span className={poppins.className}>motion.</span>
          </li>
        </ul>
      </h1>

      <div className="ml-10">
        <SwiperEffect />
      </div>

      {/* Keyframes for the typing effect */}
      <style>{`
        @keyframes typingLoop {
          0% {
            width: 0;
          }
          40% {
            width: 40%;
          }
          60% {
            width: 40%;
          }
          90% {
            width: 0;
          }
          100% {
            width: 0;
          }
        }
        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}