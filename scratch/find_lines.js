const fs = require('fs');
const lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

lines.forEach((line, index) => {
  if (line.includes('model CRMNote') || line.includes('model FollowUpReminder') || line.includes('model CustomerComplaint')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
