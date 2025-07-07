import React from "react";

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export const useSession = jest.fn(() => ({
  data: {
    user: { id: "user123", email: "test@example.com", image: "/" },
    expires: "2024-12-31T23:59:59.999Z",
  },
  status: "authenticated",
  update: jest.fn(),
}));

export const signIn = jest.fn();
export const signOut = jest.fn();
export const getSession = jest.fn();
