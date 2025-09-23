// Simple test to verify backend connectivity
async function testBackendConnection() {
  try {
    const response = await fetch('http://127.0.0.1:5050/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ Backend connection failed:', response.status);
      return { success: false, error: response.status };
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error);
    return { success: false, error: error.message };
  }
}

async function testHealthEndpoint() {
  try {
    const response = await fetch('http://127.0.0.1:5050/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ Health check failed:', response.status);
      return { success: false, error: response.status };
    }
  } catch (error) {
    console.log('❌ Health check error:', error);
    return { success: false, error: error.message };
  }
}

async function testUserRegistration() {
  try {
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "testpassword123"
    };

    const response = await fetch('http://127.0.0.1:5050/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User registration successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ User registration failed:', response.status, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ User registration error:', error);
    return { success: false, error: error.message };
  }
}

async function testUserLogin() {
  try {
    const testCredentials = {
      email: "test@example.com",
      password: "testpassword123"
    };

    const response = await fetch('http://127.0.0.1:5050/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ User login successful:', data);
      return { success: true, data };
    } else {
      console.log('❌ User login failed:', response.status, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log('❌ User login error:', error);
    return { success: false, error: error.message };
  }
}

// Run tests
console.log('🔄 Testing backend connectivity...');
testBackendConnection();
testHealthEndpoint();

// Test authentication (uncomment to test)
console.log('🔄 Testing authentication...');
testUserRegistration().then(() => {
  testUserLogin();
});

// Export for potential use in components
export { testBackendConnection, testHealthEndpoint, testUserRegistration, testUserLogin };