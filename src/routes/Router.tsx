import { createHashRouter } from "react-router-dom";
import { Wormhole } from "../components/Wormhole";
import { Tokens } from "../components/Tokens";
import App from "../App";

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "ntts",
        element: <Tokens />,
      },
      {
        path: "bridge",
        element: <Wormhole />,
      },
    ],
  },
]);
