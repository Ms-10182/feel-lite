// List of adjectives and nouns for username generation
const adjectives = ['Silent', 'Quiet', 'Lonely', 'Bright', 'Blue', 'Shy', 'Mysterious', 'Wild', 'Happy', 'Dreamy'];
const nouns = ['Tiger', 'Moon', 'Star', 'Ocean', 'River', 'Forest', 'Mountain', 'Sky', 'Wolf', 'Tree'];

// Function to generate a random username
function generateUsername() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${adjective}${noun}${randomNumber}`;
}

// Example usage
export {generateUsername}
