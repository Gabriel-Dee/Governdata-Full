"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"

const plans = [
  {
    name: "Teams",
    description: "Rugged protection for growing equipment.",
    price: "$4",
    features: [
      "Protected data transfer",
      "Activity log tracking",
      "Directory synchronization",
    ],
    iconColor: "bg-emerald-400",
  },
  {
    name: "Businesses",
    description: "Specialized tools for enterprise-scale operations.",
    price: "$12",
    features: [
      "Business-grade policy controls",
      "Seamless password-free login",
      "Streamlined account recovery options",
    ],
    iconColor: "bg-emerald-500",
  },
  {
    name: "Companies",
    description: "Designed for businesses with large teams requiring advanced features.",
    price: "$26",
    features: [
      "Mitigating cybersecurity threats",
      "Boosting efficiency",
      "Effortless integration",
    ],
    iconColor: "bg-emerald-600",
  },
]

export function Pricing() {
  return (
    <section className="py-20 bg-secondary/30" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between mb-12"
        >
          <div>
            <p className="text-emerald-500 text-sm font-medium mb-2">Our plans</p>
            <h2 className="text-3xl font-bold text-foreground">Solutions for everyone</h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs mt-4 md:mt-0">
            We are here to help you, choose the plan that suits you best. Your passwords will be safe at all times.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-border hover:border-emerald-200 transition-colors"
            >
              {/* Icon */}
              <div className={`w-10 h-10 ${plan.iconColor} rounded-xl flex items-center justify-center mb-6`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Plan info */}
              <h3 className="text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              </div>

              {/* CTA */}
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full mb-6">
                Try this plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
