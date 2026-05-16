async function globalTeardown(): Promise<void> {
  /* no-op — prisma clients closed per test process */
}

export default globalTeardown;
