"use client";

import {
  DEFAULT_PET_BASIS,
  normalizePetBasis,
  PET_BASIS_COOKIE_NAME,
  type PetBasis,
} from "@/lib/constants";
import * as React from "react";

interface BasisContextValue {
  basis: PetBasis;
  setBasis: (basis: PetBasis) => void;
}

const BasisContext = React.createContext<BasisContextValue | undefined>(
  undefined,
);

export const readCookieBasis = (): PetBasis => {
  if (typeof document === "undefined") {
    return DEFAULT_PET_BASIS;
  }

  const match = new RegExp(
    String.raw`(?:^|;\s*)${PET_BASIS_COOKIE_NAME}=([^;]+)`,
    "u",
  ).exec(document.cookie);

  const rawValue = match?.[1];

  return normalizePetBasis(rawValue ? decodeURIComponent(rawValue) : undefined);
};

export function BasisProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  const [basis, setBasis] = React.useState<PetBasis>(DEFAULT_PET_BASIS);

  React.useEffect(() => {
    setBasis(readCookieBasis());
  }, []);

  const contextValue = React.useMemo(
    () => ({ basis, setBasis }),
    [basis, setBasis],
  );

  return (
    <BasisContext.Provider value={contextValue}>
      {children}
    </BasisContext.Provider>
  );
}

export function usePetBasis(): BasisContextValue {
  const context = React.useContext(BasisContext);

  if (!context) {
    throw new Error("usePetBasis must be used within a BasisProvider");
  }

  return context;
}
