// File: jest.setup.js
require('dotenv').config({ path: '.env.test' });
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;