import Image from "next/image";

export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <Image src="/alaynlogo.png" alt="ALAYN" width={1280} height={297} className="h-9 w-auto mix-blend-multiply" priority />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/3 animate-[loader_1.1s_ease-in-out_infinite] rounded-full bg-navy-700" />
        </div>
        <p className="text-[13px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
