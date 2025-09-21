const fetch = require('node-fetch');

async function testPendingUsersAPI() {
  try {
    console.log('Testing pending users API...');
    
    // First, let's login to get a token
    const loginResponse = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@bank.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Now test the pending users endpoint
    const pendingResponse = await fetch('http://localhost:3000/users/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Pending users response status:', pendingResponse.status);
    
    if (!pendingResponse.ok) {
      console.error('Pending users API failed:', await pendingResponse.text());
      return;
    }
    
    const pendingData = await pendingResponse.json();
    console.log('Pending users data:', JSON.stringify(pendingData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPendingUsersAPI();
