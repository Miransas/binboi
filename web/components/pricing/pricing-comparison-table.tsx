import { pricingComparisonRows, pricingPlans } from "@/lib/pricing";

export function PricingComparisonTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,30,0.94),rgba(7,11,17,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-white/[0.03] text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            <th className="px-5 py-4">Feature</th>
            {pricingPlans.map((plan) => (
              <th key={plan.id} className="px-5 py-4">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {pricingComparisonRows.map((row) => (
            <tr key={row.label}>
              <td className="px-5 py-4 text-sm font-medium text-white">{row.label}</td>
              {pricingPlans.map((plan) => (
                <td key={`${row.label}-${plan.id}`} className="px-5 py-4 text-sm text-zinc-300">
                  {row.values[plan.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
