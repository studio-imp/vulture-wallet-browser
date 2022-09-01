//randomNames.ts just contains methods to get "random" strings, used for UI purposes n stuff, Just for fun.


const accountNameExamples: string[] = [
    "DeFi Account",       "NFT Account",
    "Public Account",     "Private Account",
    "Charity Account",    "Savings Account",
    "Spending Account",   "Income Account",
    "DAO Account",        "Experiment Account",
    "uwu Account",        "Vulture by Psycoders",
    "Rocketry Account",   "Staking Account",
    "Revolution Savings", "Mars Account",
    "Inssurance Money",   "HODL Account",
    "Ape Money",          "Monkey Money",
    "Bird Money",         "owo Account",
]

export function getRandomAccountName(): string {
    return accountNameExamples[Math.floor(Math.random() * accountNameExamples.length)];
}