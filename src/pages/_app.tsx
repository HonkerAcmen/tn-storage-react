import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { FileDataProvider } from "@/contexts/FileDataContext";
import { ConfigProvider } from "antd";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#5542f6",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          colorInfo: "#5542f6",
          borderRadius: 6,
        },
        components: {
          Button: {
            primaryColor: "#ffffff",
          },
          Menu: {
            itemSelectedBg: "#EBEBEB",
            itemSelectedColor: "#3B3B3B",
            itemActiveBg: "#DEDEDE",
            itemHeight: 50,
            itemColor: "#2e2c34",
          },
        },
      }}
    >
      <FileDataProvider>
        <Component {...pageProps} />
      </FileDataProvider>
    </ConfigProvider>
  );
}
