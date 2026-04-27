const features = [
  {
    title: "Real-time authorization decisions",
    description: "Evaluate access requests via POST /api/v1/authorize with instant ALLOW/DENY responses and full decision explanations.",
  },
  {
    title: "Flexible policy runtimes",
    description: "Choose JSON DSL for simple policies stored in database, or delegate to OPA/Rego for advanced governance scenarios.",
  },
  {
    title: "Multi-mode audit storage",
    description: "Configure DB_ONLY for Postgres, BLOCKCHAIN_ONLY for Fabric anchoring, or BOTH for maximum verifiability.",
  },
  {
    title: "External event ingestion",
    description: "Ingest audit events from EHR, EMR, and SaaS systems via /audit/ingest with unique correlation IDs and metadata.",
  },
  {
    title: "Cryptographic verification",
    description: "Every decision is hashed with SHA-256. Verify integrity anytime via /audit/verify with blockchain evidence when anchored.",
  },
  {
    title: "Comprehensive SDK support",
    description: "Ready-to-use examples for JavaScript/TypeScript, Python, and cURL. Full OpenAPI spec for any language.",
  },
]

export function Features() {
  return (
    <section className="py-24 bg-background" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Left side */}
          <div className="lg:col-span-4">
            <p className="text-emerald-600 text-sm font-medium mb-3">Our features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              Enterprise-grade
              <br />
              API capabilities
            </h2>
          </div>

          {/* Right side - Features grid */}
          <div className="lg:col-span-8">
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="border-l-[3px] border-emerald-600 pl-5"
                >
                  <h3 className="font-bold text-foreground text-lg mb-2 leading-snug">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
