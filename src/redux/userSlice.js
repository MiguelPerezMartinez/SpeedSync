import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Post

// Get
export const getUser = createAsyncThunk(
  "user/getUser",
  async ({ user_id, accessToken }) => {
    console.log("user/getUser");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.status === 200) return res.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }
);

//Put

// Delete

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoading: false,
    accessToken: null,
    info: {},
  },
  reducers: {
    setExos: (state, { payload }) => {
      state.info.exos = payload;
    },
    setAccessToken: (state, { payload }) => {
      state.accessToken = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUser.fulfilled, (state, { payload }) => {
        state.info = payload;
        state.isLoading = false;
      })
      .addCase(getUser.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setExos, setAccessToken } = userSlice.actions;
export default userSlice.reducer;
