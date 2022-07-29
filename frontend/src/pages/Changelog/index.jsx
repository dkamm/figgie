import React from "react";
import { useTitle } from "hooks/title";

export const Changelog = () => {
  useTitle("Changelog");
  return (
    <div className="w-1/2 mx-auto text-left my-4">
      <h1 className="text-xl font-semibold">Changelog</h1>
      <br />
      <h2 className="text-base font-semibold">07-20-2022</h2>
      <p>Initial release!</p>
    </div>
  );
};

export default Changelog;
