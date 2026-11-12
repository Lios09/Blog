import { NotFoundArt } from "@/components/not-found-art";

export const metadata = { title: "404" };

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="sr-only">404 - page not found</h1>
      <NotFoundArt />
    </div>
  );
}
