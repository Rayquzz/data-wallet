// src/environments/environment.local.ts
export const environment = {
  production: false,
  massa: {
    contractAddress: 'AS19xnaCi2hMjzgPQ4VTB5Nw49HQyx4TSYpXc3zdZKeanrPrDSeL',
    network: 'buildnet',
    // DATELE REALE:
    defaultAccount: {
      address: 'AU1Z7DdjXtUqQUsEWWWrqfutdDLzW6kc1ufA6YihmC3gq5SJ5mLF',  // Adresa primită de la faucet
      privateKey: 'P1h6UdCDnz2qbbJpFnWEHGRqWeE7JVMprxGNJFPujB7eF86w8oi'  // Cheia privată din wallet
    },
    testAccounts: [
      {
        name: 'My Funded Account',
        address: 'AU1Z7DdjXtUqQUsEWWWrqfutdDLzW6kc1ufA6YihmC3gq5SJ5mLF',
        privateKey: 'P1h6UdCDnz2qbbJpFnWEHGRqWeE7JVMprxGNJFPujB7eF86w8oi',
        hasTokens: true,
        source: 'local'
      }
    ],
    faucet: {
      discordChannel: '#testnet-faucet',
      cooldownHours: 24,
      discordLink: 'https://discord.gg/massa'
    }
  }
};