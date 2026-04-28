"use client";

import Image from "next/image";

const navItems = ["How it works", "Platform", "Community"];

export default function NavMenu() {
  return (
    <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center justify-center gap-5 md:gap-10 h-[60px] md:h-[75px] px-5 md:px-8 bg-bg-nav backdrop-blur-md rounded-b-2xl">
        <div className="relative w-[40px] h-[42px] shrink-0">
          <Image
            src="/assets/cogniate-logo.png"
            alt="Cogniate"
            width={40}
            height={42}
            className="object-contain"
          />
        </div>
        {navItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sm md:text-base text-white whitespace-nowrap hover:text-white/70 transition-colors duration-200"
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
