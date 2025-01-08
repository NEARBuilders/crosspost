import Image from "next/image";

export function Footer() {
  return (
    <footer className="flex justify-end m-4 font-mono text-gray-500">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2">
          <span>a part of</span>
          <a
            href={"https://everything.dev"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/black-dot.svg"
              alt="everything"
              width={24}
              height={24}
            />
          </a>
        </div>
        <div className="w-36 ">
          <Image
            src="/built-on-near.svg"
            alt="built on near"
            width={144}
            height={36}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>with ❤️ by</span>
          <a
            href={"https://github.com/nearbuilders/crosspost"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
              alt="builder"
              width={24}
              height={24}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
