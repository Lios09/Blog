import { Ascii, Banner } from "ascii.rest/react";

export default function Page() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center bg-black">
      <div className="container mx-auto">
        <Banner text="zx's Blog" color={["#f97316", "#f778ba"]} />
        <Ascii piece="alpine-dawn" />
      </div>
    </main>
  );
}
