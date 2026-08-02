const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const matches = [...schema.matchAll(/model\s+(\w+)\s*\{/g)];
console.log('Found models:', matches.map(m => m[1]).join(', '));
