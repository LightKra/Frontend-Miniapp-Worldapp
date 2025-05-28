import api from "./apiClient";
import { User } from "../types/api";

export const createUser = async (worldId: string): Promise<User> => {
  try {
    const response = await api.post("/users", {
      wallet_address: worldId.toLowerCase(),
      name: "",
      email: "",
      phone: "",
    });
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getOrCreateUserByWalletAddress = async (
  worldId: string
): Promise<User> => {
  try {
    const normalizedWorldId = worldId.toLowerCase();
    const existingUser = await getUserByWalletAddress(normalizedWorldId);
    if (existingUser) {
      return existingUser;
    }
    return await createUser(normalizedWorldId);
  } catch {
    throw new Error();
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch {
    throw new Error();
  }
};

export const getUserByWalletAddress = async (
  walletAddress: string
): Promise<User | null> => {
  try {
    const normalizedWalletAddress = walletAddress.toLowerCase();
    const response = await api.get(
      `/users?wallet_address=${normalizedWalletAddress}`
    );

    if (response.data && Array.isArray(response.data)) {
      const user = response.data.find(
        (user) => user.wallet_address.toLowerCase() === normalizedWalletAddress
      );
      return user || null;
    }
    return null;
  } catch {
    throw new Error();
  }
};

export const updateUser = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await api.put(`/users/${userId}`, {
      ...userData,
      wallet_address: userData.wallet_address?.toLowerCase(),
    });
    return response.data;
  } catch {
    throw new Error();
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch {
    throw new Error();
  }
};
