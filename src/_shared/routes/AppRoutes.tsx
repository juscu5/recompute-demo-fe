import { createHashRouter } from "react-router-dom";
import { RecomProcess } from "@/RecomProcess";
import { RootStyle } from "../components/Style/RootStyle";

export const AppRoutes = createHashRouter([
  {
    path: "/",
    element: (
      <RootStyle>
        <RecomProcess />
      </RootStyle>
    ),
  },
]);
