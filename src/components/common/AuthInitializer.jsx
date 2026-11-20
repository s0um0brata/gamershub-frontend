import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { restoreSession } from "../../features/auth/authThunks.js";

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const isInitializing = useSelector((state) => state.auth.isInitializing);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isInitializing) {
    return <div className="auth-initializing">Restoring your session...</div>;
  }

  return children;
}

export default AuthInitializer;
