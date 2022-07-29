import { useEffect } from "react";

export const useTitle = (suffix) => {
  useEffect(() => {
    document.title = "Figgie - " + suffix;
  }, [suffix]);
};
