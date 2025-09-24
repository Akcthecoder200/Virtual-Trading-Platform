// Authentication test utilities
const API_BASE_URL = import.meta.env.PROD 
  ? "/api" // Production: use relative path for Vercel
  : "http://localhost:5000/api"; // Development: use full localhost URL

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const testAuthConnection = async () => {
  try {
    console.log("🔍 Testing backend connection...");

    // Test a simple endpoint
    const healthUrl = import.meta.env.PROD 
      ? "/api/health" 
      : "http://localhost:5000/api/health";
    const response = await fetch(healthUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Backend connection successful:", data);
    return true;
  } catch (error) {
    console.error("❌ Backend connection failed:", error.message);
    return false;
  }
};

export const testExistingLogin = async () => {
  try {
    console.log("🔍 Testing login with existing admin user...");

    // Try login with default admin credentials
    const adminCredentials = {
      email: "admin@virtualtrading.com",
      password: "admin123",
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminCredentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Login failed");
    }

    console.log("✅ Admin login successful:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Admin login failed:",
      error.response?.data || error.message
    );

    // If admin login fails, try creating a new test user
    console.log("🔄 Trying to create new test user...");
    return await testSignup();
  }
};

export const testSignup = async () => {
  try {
    console.log("🔍 Testing signup functionality...");

    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: "Test123!",
      firstName: "Test",
      lastName: "User",
    };

    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Signup failed");
    }

    console.log("✅ Signup successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Signup failed:", error.response?.data || error.message);
    throw error;
  }
};

export const testLogin = async (credentials) => {
  try {
    console.log("🔍 Testing login functionality...");

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Login failed");
    }

    console.log("✅ Login successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const testGetProfile = async () => {
  try {
    console.log("🔍 Testing get profile...");

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to fetch profile");
    }

    console.log("✅ Profile fetch successful:", data);
    return data;
  } catch (error) {
    console.error(
      "❌ Profile fetch failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Run all tests
export const runAuthTests = async () => {
  console.log("🚀 Starting authentication tests...");
  console.log("📝 Open DevTools Console to see detailed results");

  try {
    // Test 1: Backend connection
    console.log("\n=== TEST 1: Backend Connection ===");
    const connectionOk = await testAuthConnection();
    if (!connectionOk) {
      throw new Error("Backend connection failed");
    }

    // Test 2: Login/Signup
    console.log("\n=== TEST 2: Authentication ===");
    const authResult = await testExistingLogin();
    const { user, tokens } = authResult;

    // Test 3: Profile fetch with token
    console.log("\n=== TEST 3: Profile Fetch ===");

    // Set token temporarily for profile test
    localStorage.setItem(
      "persist:auth",
      JSON.stringify({
        token: JSON.stringify(tokens.accessToken),
        refreshToken: JSON.stringify(tokens.refreshToken),
        user: JSON.stringify(user),
        isAuthenticated: "true",
      })
    );

    const profileResult = await testGetProfile();

    console.log("\n🎉 All authentication tests passed!");
    console.log("📊 Test Summary:", {
      connection: "✅ Success",
      authentication: "✅ Success",
      profile: "✅ Success",
      userDetails: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        username: user.username,
      },
    });

    // Show success in UI
    alert("✅ Authentication tests passed! Check console for details.");

    return {
      success: true,
      auth: authResult,
      profile: profileResult,
    };
  } catch (error) {
    console.error("\n💥 Authentication tests failed:", error.message);
    console.log("❌ Test Summary:", {
      connection: "❌ Failed",
      error: error.message,
    });

    // Show error in UI
    alert(`❌ Authentication tests failed: ${error.message}`);

    return {
      success: false,
      error: error.message,
    };
  }
};
