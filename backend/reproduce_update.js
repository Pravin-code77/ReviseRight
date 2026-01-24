const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testUpdate() {
    try {
        // 1. Register/Login Temp User
        const email = `testUpdate_${Date.now()}@example.com`;
        const password = 'password123';
        const name = 'Test User';

        console.log('1. Registering User:', email);
        let token;
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, { name, email, password });
            token = regRes.data.token;
            console.log('   Registration Success. Token acquired.');
        } catch (e) {
            console.log('   Registration failed (maybe exists), trying login...');
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email, password });
            token = loginRes.data.token;
            console.log('   Login Success. Token acquired.');
        }

        // 2. Update Profile
        console.log('2. Updating Profile...');
        const newName = 'Updated Name ' + Date.now();
        const updateRes = await axios.put(
            `${BASE_URL}/auth/update`,
            { name: newName, email },
            { headers: { 'x-auth-token': token } }
        );

        console.log('   Update Response Status:', updateRes.status);
        console.log('   Update Response Data:', updateRes.data);

        if (updateRes.data.name === newName) {
            console.log('SUCCESS: Name updated correctly.');
        } else {
            console.log('FAILURE: Name mismatch.');
        }

    } catch (error) {
        console.error('ERROR during test:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testUpdate();
