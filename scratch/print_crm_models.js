const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

function printModel(name) {
  const match = schema.match(new RegExp(`model ${name} \\{([\\s\\S]*?)\\n\\}`));
  if (match) {
    console.log(`=== ${name} ===`);
    console.log(match[1].split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).join('\n'));
  } else {
    console.log(`Model ${name} not found`);
  }
}

['Customer', 'CustomerCommunication', 'CustomerFeedback', 'LoyaltyTransaction', 'CustomerActivity', 'CRMNote', 'CRMAttachment', 'FollowUpReminder', 'Coupon', 'CustomerComplaint'].forEach(printModel);
