import Image from "next/image";

export function Footer() {
  return (
    <footer className="flex justify-end m-2 sm:m-4 font-mono text-gray-500 text-xs sm:text-sm">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <span>a part of</span>
          <a
            href={"https://everything.dev"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image
              src="/black-dot.svg"
              alt="everything"
              width={20}
              height={20}
              className="w-[16px] h-[16px] sm:w-[24px] sm:h-[24px]"
            />
          </a>
        </div>
        <div className="w-28 sm:w-36">
          <Image
            src="/built-on-near.svg"
            alt="built on near"
            width={144}
            height={36}
            className="w-full h-auto"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <span>with ❤️ by</span>
          <a
            href={"https://nearbuilders.org"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image
              src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
              alt="builder"
              width={20}
              height={20}
              className="w-[16px] h-[16px] sm:w-[24px] sm:h-[24px]"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
