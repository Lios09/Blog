import { Ascii } from "ascii.rest/react";

const NotFoundPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Ascii
        piece="not-found"
        options={{
          code: "404",
          title: "page not found",
          message: "the page you asked for has moved or never existed",
        }}
      />
    </div>
  );
};

export default NotFoundPage;
