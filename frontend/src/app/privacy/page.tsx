export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 space-y-8">
      <h1 className="text-3xl font-extrabold text-foreground">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground">Last Updated: July 9, 2026</p>
      
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          At TrustZone Mobile Care, we prioritize the confidentiality of our customers’ data. This privacy policy describes what customer information we collect, how it is processed, and the measures we enforce to safeguard internal file stores.
        </p>

        <h3 className="font-extrabold text-base text-foreground mt-6">1. Data Storage on Devices</h3>
        <p>
          During hardware diagnostic testing or repairs, we do not browse, copy, or distribute files (photos, text logs, configuration settings) stored inside client devices. We strictly isolate motherboard trace connections to complete display or battery swaps.
        </p>

        <h3 className="font-extrabold text-base text-foreground mt-6">2. Information We Collect</h3>
        <p>
          We capture name, phone number, email address, and device parameters (model, brand, IMEI) during booking and invoice logging. This data is stored inside our secure PostgreSQL relational database to track warranty durations and transaction ledgers.
        </p>
        
        <h3 className="font-extrabold text-base text-foreground mt-6">3. Third Party Disclosures</h3>
        <p>
          We do not lease, trade, or distribute your email addresses or contact details to third-party marketing firms. All transactions are logged strictly within TrustZone corporate systems.
        </p>
      </div>
    </div>
  );
}
