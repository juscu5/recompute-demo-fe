import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { RouterProvider } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/poppins";
import { AppRoutes } from "./_shared/routes/AppRoutes";
import { GlobalProvider } from "./_shared/context/GlobalContext";

const queryClient = new QueryClient();
const nonce = document.querySelector("style[nonce]")?.getAttribute("nonce");

const cache = createCache({
  key: "css",
  nonce: nonce || undefined,
});

const theme = createTheme({
  typography: {
    fontFamily: ["Poppins"].join(","),
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalProvider>
      <CacheProvider value={cache}>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider dense maxSnack={3}>
            <ThemeProvider theme={theme}>
              <RouterProvider router={AppRoutes} />
            </ThemeProvider>
          </SnackbarProvider>
        </QueryClientProvider>
      </CacheProvider>
    </GlobalProvider>
  </React.StrictMode>
);
