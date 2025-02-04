import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ModalProvider } from "@/providers/contexts/ModalContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SessionProviderWrapper from "@/providers/SessionProviderWrapper";

const queryClient = new QueryClient();

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProviderWrapper>
        <ModalProvider>{children}</ModalProvider>
      </SessionProviderWrapper>
    </QueryClientProvider>
  );
}

export function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
