import Image from "next/image";
export function EmptyState() {
    return (
        <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white text-xl font-bold text-black shadow-lg">
        <Image
            src="/ellen.png"
            alt="Icon"
            width={56}
            height={56}
            className="h-full w-full object-cover"
        />
        </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
            What&apos;s on your mind?
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
            Talk to Ellen about anything.
            </p>
        </div>
        </div>
    );
}
