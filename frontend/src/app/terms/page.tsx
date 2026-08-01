export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 space-y-8">
      <h1 className="text-3xl font-extrabold text-foreground">Terms & Conditions</h1>
      <p className="text-xs text-muted-foreground">Last Updated: July 9, 2026</p>
      
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          Welcome to TrustZone Mobile Care. By dropping off your devices or booking slots, you agree to comply with and be bound by the following operational terms of service.
        </p>

        <h3 className="font-extrabold text-base text-foreground mt-6">1. Diagnostics Fee Policy</h3>
        <p>
          We charge a flat diagnostics fee of $10 to inspect device internal circuits and components. If you decide to proceed with the suggested hardware repair, this diagnostics fee is completely waived and deducted from your final bill.
        </p>

        <h3 className="font-extrabold text-base text-foreground mt-6">2. Abandoned Devices</h3>
        <p>
          If you fail to pick up your repaired device within 90 days after receiving our pick-up notifications (by phone or email), TrustZone reserves the right to recycle the device or dispose of it in accordance with local regulations.
        </p>

        <h3 className="font-extrabold text-base text-foreground mt-6">3. Warranty Limits</h3>
        <p>
          Our lifetime warranty is strictly limited to manufacturing component defects. Accidentally dropping the device, glass shattering, or liquid entry post-delivery automatically voids the warranty.
        </p>
      </div>
    </div>
  );
}
