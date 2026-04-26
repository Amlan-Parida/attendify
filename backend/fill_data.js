const http = require('http');

const API_URL = 'http://localhost:5000/api';

const makeRequest = (path, method, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const dataString = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseBody || '{}'));
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function main() {
  try {
    console.log('Registering user...');
    let token = '';
    try {
      const user = await makeRequest('/auth/signup', 'POST', {
        name: 'Attendify User',
        email: 'user@iter.edu',
        password: 'Password123'
      });
      token = user.token;
      console.log('Signup successful.');
    } catch (e) {
      console.log('User might already exist, attempting login...');
      const user = await makeRequest('/auth/login', 'POST', {
        email: 'user@iter.edu',
        password: 'Password123'
      });
      token = user.token;
      console.log('Login successful.');
    }

    console.log('Updating settings...');
    await makeRequest('/auth/settings', 'PUT', {
      sessionEndDate: '2026-05-16T23:59:59Z'
    }, token);

    // Skip onboarding explicitly in backend or manually set user.college?
    // Wait, auth/settings doesn't update college in the current code (it only updates sessionEndDate if provided in req.body. Wait, let's look at authController again)
    // Actually authController updateSettings takes sessionEndDate, but let's check what else.

    console.log('Skipping onboarding...');
    await makeRequest('/templates/skip', 'POST', {}, token);

    console.log('Adding subjects...');
    // Days mapping: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    const subjects = [
      { name: 'CN', classesPerWeek: 5, daysOfWeek: [1, 2, 4, 6] },
      { name: 'Compilers', classesPerWeek: 3, daysOfWeek: [1, 4, 5] },
      { name: 'ITD', classesPerWeek: 5, daysOfWeek: [1, 4, 5, 6] },
      { name: 'PFCD', classesPerWeek: 4, daysOfWeek: [1, 3, 6] },
      { name: 'GPWC', classesPerWeek: 6, daysOfWeek: [2, 5, 6] },
      { name: 'MLC 2', classesPerWeek: 4, daysOfWeek: [3, 4] }
    ];

    const subjectIds = {};
    for (const sub of subjects) {
      console.log(`Creating ${sub.name}...`);
      try {
        const result = await makeRequest('/subjects', 'POST', sub, token);
        subjectIds[sub.name] = result._id;
      } catch (err) {
        console.log(`Failed to create ${sub.name}: ${err.message}`);
      }
    }

    console.log('Adding Holidays...');
    const holidays = [];
    const addHolidayRange = (start, end, note) => {
      let curr = new Date(start);
      const limit = new Date(end);
      while (curr <= limit) {
        holidays.push({ date: curr.toISOString(), note });
        curr.setDate(curr.getDate() + 1);
      }
    };
    addHolidayRange('2026-02-10T00:00:00Z', '2026-02-17T00:00:00Z', 'Even Semester Break');
    addHolidayRange('2026-05-21T00:00:00Z', '2026-05-23T00:00:00Z', 'Preparatory Break');

    for (const subName in subjectIds) {
      const subId = subjectIds[subName];
      for (const hol of holidays) {
        try {
          await makeRequest('/attendance', 'POST', {
            subjectId: subId,
            date: hol.date,
            status: 'Holiday',
            note: hol.note
          }, token);
        } catch (err) {}
      }
    }

    console.log('Data filling completed successfully!');
  } catch (error) {
    console.error('Data filling failed:', error.message);
  }
}

main();
