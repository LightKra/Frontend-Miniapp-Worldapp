import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

interface MiniKitProviderProps {
  children: ReactNode;
  appId?: string;
}

export function MiniKitProvider({ children, appId }: MiniKitProviderProps) {
  useEffect(() => {
    if (appId) {
      MiniKit.install(appId);
    } else {
      MiniKit.install();
    }
    window.MiniKit = MiniKit;
  }, [appId]);

  return <>{children}</>;
}
