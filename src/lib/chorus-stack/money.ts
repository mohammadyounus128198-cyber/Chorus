export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function compoundCents(principalCents: number, rate: number, years: number): number {
  return Math.round(principalCents * Math.pow(1 + rate, years));
}

export function assertInvariant(principalCents: number, finalCents: number, gainCents: number) {
  if (principalCents + gainCents !== finalCents) {
    throw new Error("Financial invariant breached: P + G != F");
  }
}
