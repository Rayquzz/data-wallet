// src/environments/environment.prod.ts
export const environment = {
  production: true,
  massa: {
    contractAddress: 'AS19xnaCi2hMjzgPQ4VTB5Nw49HQyx4TSYpXc3zdZKeanrPrDSeL',
    network: 'mainnet', // В будущем когда mainnet будет доступен
    defaultAccount: {
      address: '',
      privateKey: ''
    },
    testAccounts: [],
    faucet: {
      discordChannel: null,
      cooldownHours: 0,
      discordLink: null
    }
  }
};