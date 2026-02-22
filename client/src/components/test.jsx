import { useAuth } from "@clerk/clerk-react";

export default function TestToken() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const showToken = async () => {
    const token = await getToken();
    console.log("TOKEN:", token);
  };

  return (
    <div>
      <p>Loaded: {String(isLoaded)}</p>
      <p>Signed In: {String(isSignedIn)}</p>
      <button onClick={showToken}>Get Token</button>
    </div>
  );
}
