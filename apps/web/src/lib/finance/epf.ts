import { EPF } from "./india-tax-rules";

export interface EpfInput {
  /** Monthly basic + DA today. */
  monthlyBasic: number;
  currentAge: number;
  retirementAge: number;
  currentBalance: number;
  employeeRatePct: number;
  /** Employer contributes on the full basic, or only on the ₹15,000 wage ceiling. */
  employerOn: "full" | "ceiling";
  /** Whether the employee is an EPS (pension) member. */
  epsMember: boolean;
  annualIncreasePct: number;
  interestRatePct: number;
}

export interface EpfYear {
  year: number;
  age: number;
  employee: number;
  employer: number;
  eps: number;
  interest: number;
  balance: number;
}

export function monthlySplit(basic: number, employeeRatePct: number, employerOn: "full" | "ceiling", epsMember: boolean) {
  const employerWage = employerOn === "ceiling" ? Math.min(basic, EPF.wageCeiling) : basic;
  const employee = Math.round((basic * employeeRatePct) / 100);
  const employerTotal = Math.round((employerWage * EPF.employerRatePct) / 100);
  const eps = epsMember ? Math.round((Math.min(basic, EPF.wageCeiling) * EPF.epsRatePct) / 100) : 0;
  return { employee, employerEpf: Math.max(0, employerTotal - eps), eps };
}

/**
 * Projects the EPF balance. Contributions are credited monthly; interest is calculated on the
 * monthly running balance and credited at the end of each year (the EPFO method).
 * EPS contributions go to the pension fund and are not part of the EPF balance.
 */
export function projectEpf(input: EpfInput): { years: EpfYear[]; balance: number; totalEmployee: number; totalEmployer: number; totalInterest: number } {
  const years: EpfYear[] = [];
  let balance = input.currentBalance;
  let basic = input.monthlyBasic;
  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalInterest = 0;
  const n = Math.max(0, Math.round(input.retirementAge - input.currentAge));
  for (let y = 1; y <= n; y++) {
    const { employee, employerEpf, eps } = monthlySplit(basic, input.employeeRatePct, input.employerOn, input.epsMember);
    let interestBase = 0;
    for (let m = 0; m < 12; m++) {
      balance += employee + employerEpf;
      interestBase += balance;
    }
    const interest = (interestBase * input.interestRatePct) / 1200;
    balance += interest;
    totalEmployee += employee * 12;
    totalEmployer += employerEpf * 12;
    totalInterest += interest;
    years.push({ year: y, age: input.currentAge + y, employee: employee * 12, employer: employerEpf * 12, eps: eps * 12, interest, balance });
    basic *= 1 + input.annualIncreasePct / 100;
  }
  return { years, balance, totalEmployee, totalEmployer, totalInterest };
}
