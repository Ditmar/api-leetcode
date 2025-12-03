import { testAuthSignup } from './application/auth/AuthSignup.test';
import { testAuthLogin } from './application/auth/AuthLogin.test';

async function runAllTests() {
  await testAuthSignup();
  await testAuthLogin();
}

runAllTests();
