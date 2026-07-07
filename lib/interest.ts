export function calculateInterest(
  principal: number,
  monthlyRate: number,
  loanDate: Date,
  currentDate: Date
): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const days =
    Math.max(
      0,
      Math.floor(
        (currentDate.getTime() - loanDate.getTime()) / millisecondsPerDay
      )
    );

  const interest =
    principal * (monthlyRate / 100) * (days / 30);

  return Number(interest.toFixed(2));
}
