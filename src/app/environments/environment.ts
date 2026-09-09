// src/environments/environment.ts (временно с реальными данными)
export const environment = {
  production: false,
  massa: {
    contractAddress: 'AS19xnaCi2hMjzgPQ4VTB5Nw49HQyx4TSYpXc3zdZKeanrPrDSeL',
    network: 'buildnet',
    defaultAccount: {
      address: 'AU123bvNm7rhPVoHyJUyhHaQky1pgziiqPR88HtTjSKHn1yzsJGte',
      privateKey: 'S12igcEeonmwWJ6Moq48UjcCE212q6wbp285BfAwEkhgmm6FnKfN'
    },
    testAccounts: [
      {
        name: 'My Account',
        address: 'AU123bvNm7rhPVoHyJUyhHaQky1pgziiqPR88HtTjSKHn1yzsJGte',
        privateKey: 'S12igcEeonmwWJ6Moq48UjcCE212q6wbp285BfAwEkhgmm6FnKfN',
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