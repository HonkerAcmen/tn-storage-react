import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { FileDataProvider } from "../contexts/FileDataContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FileDataProvider>
      <Component {...pageProps} />
    </FileDataProvider>
  );
}
