import { useAppDispatch, useAuth } from "../store/hooks";
import { loginUser, signupUser, logoutUser } from "../store/slices/authSlice";
import { useState } from "react";
import toast from "react-hot-toast";

const ReduxTestComponent = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAuth();
  const [testResults, setTestResults] = useState({});

  const testReduxLogin = async () => {
    try {
      console.log("🧪 Testing Redux login action...");
      setTestResults(prev => ({ ...prev, login: 'testing...' }));

      const result = await dispatch(loginUser({
        email: "admin@virtualtrading.com",
        password: "admin123"
      })).unwrap();

      console.log("✅ Redux login successful:", result);
      setTestResults(prev => ({ ...prev, login: '✅ Success' }));
      toast.success("Redux login test passed!");
      
    } catch (error) {
      console.error("❌ Redux login failed:", error);
      setTestResults(prev => ({ ...prev, login: `❌ Failed: ${error}` }));
      toast.error(`Redux login test failed: ${error}`);
    }
  };

  const testReduxSignup = async () => {
    try {
      console.log("🧪 Testing Redux signup action...");
      setTestResults(prev => ({ ...prev, signup: 'testing...' }));

      const testUser = {
        username: `reduxtest_${Date.now()}`,
        email: `reduxtest_${Date.now()}@example.com`,
        password: "Test123!",
        firstName: "Redux",
        lastName: "Test"
      };

      const result = await dispatch(signupUser(testUser)).unwrap();
      console.log("✅ Redux signup successful:", result);
      setTestResults(prev => ({ ...prev, signup: '✅ Success' }));
      toast.success("Redux signup test passed!");
      
    } catch (error) {
      console.error("❌ Redux signup failed:", error);
      setTestResults(prev => ({ ...prev, signup: `❌ Failed: ${error}` }));
      toast.error(`Redux signup test failed: ${error}`);
    }
  };

  const testReduxLogout = async () => {
    try {
      console.log("🧪 Testing Redux logout action...");
      setTestResults(prev => ({ ...prev, logout: 'testing...' }));

      await dispatch(logoutUser());
      console.log("✅ Redux logout successful");
      setTestResults(prev => ({ ...prev, logout: '✅ Success' }));
      toast.success("Redux logout test passed!");
      
    } catch (error) {
      console.error("❌ Redux logout failed:", error);
      setTestResults(prev => ({ ...prev, logout: `❌ Failed: ${error}` }));
      toast.error(`Redux logout test failed: ${error}`);
    }
  };

  const runAllReduxTests = async () => {
    console.log("🚀 Starting Redux integration tests...");
    setTestResults({});

    // Test sequence: login -> logout -> signup -> logout
    await testReduxLogin();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testReduxLogout();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testReduxSignup();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testReduxLogout();
    
    console.log("🎉 All Redux tests completed!");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">🧪 Redux Integration Tests</h3>
      
      {/* Current Auth State */}
      <div className="mb-6 p-4 bg-gray-700 rounded">
        <h4 className="font-semibold text-white mb-2">Current Auth State:</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Authenticated: <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? 'Yes' : 'No'}</span></div>
          <div>Loading: <span className={isLoading ? 'text-yellow-400' : 'text-gray-400'}>{isLoading ? 'Yes' : 'No'}</span></div>
          <div>User: <span className="text-blue-400">{user ? `${user.firstName} ${user.lastName} (${user.email})` : 'None'}</span></div>
          <div>Token: <span className="text-gray-400">{token ? 'Present' : 'None'}</span></div>
          {error && <div>Error: <span className="text-red-400">{error}</span></div>}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={testReduxLogin}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={testReduxSignup}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        >
          Test Signup
        </button>
        <button
          onClick={testReduxLogout}
          disabled={isLoading || !isAuthenticated}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        >
          Test Logout
        </button>
        <button
          onClick={runAllReduxTests}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
        >
          Run All Tests
        </button>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="p-4 bg-gray-700 rounded">
          <h4 className="font-semibold text-white mb-2">Test Results:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test}>
                {test}: <span className="font-mono">{result}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Open DevTools Console for detailed logs. This component will be removed in production.
      </p>
    </div>
  );
};

export default ReduxTestComponent;