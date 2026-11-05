"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <ToastContainer position="top-right" newestOnTop limit={4} theme="light" />
    </Provider>
  );
}
