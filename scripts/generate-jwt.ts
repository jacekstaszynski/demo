import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

interface JwtPayload {
  sub: string; // email will be used as sub
  iat?: number;
  exp?: number;
}

function generateJWT(email: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET not found in environment variables');
  }

  const payload: JwtPayload = {
    sub: email,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: '1d',
    issuer: 'demo',
    audience: 'demo',
  });

  return token;
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('Usage: yarn generate-jwt <email>');
  console.log('Example: yarn generate-jwt john.doe@example.com');
  process.exit(1);
}

try {
  const token = generateJWT(email);

  console.log('🎉 JWT Token generated successfully!');
  console.log('');
  console.log('📧 Email:', email);
  console.log('🔑 Token:', token);
  console.log('');
  console.log('📋 Usage in API requests:');
  console.log('Authorization: Bearer', token);
  console.log('');
  console.log('🧪 Test with curl:');
  console.log(
    `curl -H "Authorization: Bearer ${token}" http://localhost:3000/users`,
  );
} catch (error) {
  console.error('❌ Error generating JWT:', error.message);
  process.exit(1);
}
