export default async function globalTeardown() {
  // Nothing to tear down globally; each e2e suite cleans its own data
  console.log('\n✅  E2E tests complete\n');
}
