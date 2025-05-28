import { getNonce, signInWithWallet } from "../components/signInWithWallet";
import { getUserByWalletAddress, createUser } from "./userService";

export const autenticacion = async () => {
  try {
    const nonce = await getNonce();
    const data = await signInWithWallet(nonce);

    if (data.wallet_address) {
      const user = await getUserByWalletAddress(data.wallet_address);

      if (user) {
        return {
          userId: user.id,
          wallet_address: data.wallet_address,
          existingUser: true,
        };
      }

      const newUser = await createUser(data.wallet_address);
      return {
        userId: newUser.id,
        wallet_address: data.wallet_address,
        existingUser: false,
      };
    }

    return {
      userId: data.userId,
      wallet_address: data.wallet_address,
      existingUser: true,
    };
  } catch {
    throw new Error();
  }
};
