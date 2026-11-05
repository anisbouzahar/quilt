import Image from 'next/image';

export function Brand() {
  return (
    <span className="inline-flex shrink-0">
      <Image
        src="/quilt-logo-light.svg"
        alt="Quilt"
        width={90}
        height={40}
        className="h-10 w-auto dark:hidden"
        unoptimized
      />
      <Image
        src="/quilt-logo.svg"
        alt="Quilt"
        width={90}
        height={40}
        className="hidden h-10 w-auto dark:block"
        unoptimized
      />
    </span>
  );
}
