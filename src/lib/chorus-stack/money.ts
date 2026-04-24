export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function compoundCents(principalCents: number, rate: number, years: number): number {
  let current = principalCents;
  for (let i = 0; i < years; i++) {
    current = Math.round(current * (1 + rate));
  }
  return current;
}

export function assertInvariant(principalCents: number, finalCents: number, gainCents: number) {
  if (principalCents + gainCents !== finalCents) {
    throw new Error("Financial invariant breached: P + G != F");
  }
}
