import { configureStore } from "@reduxjs/toolkit";

// Reducers
import userReducer from "./userSlice";

export const makeStore = () =>
  configureStore({
    reducer: { user: userReducer },
  });
