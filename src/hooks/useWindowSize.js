import debounce from "lodash";

import { useEffect, useState } from "react";

const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);

  useEffect(() => {
    function updateSize() {
      debounce(setSize([window.innerWidth, window.innerHeight], 250));
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

export default useWindowSize;
