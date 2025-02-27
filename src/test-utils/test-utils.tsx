import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";
import Providers from "@/providers/Providers";

export function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}

export * from "@testing-library/react";
