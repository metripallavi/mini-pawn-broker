export function calculateInterest(
  principal: number,
  monthlyRate: number,
  fromDate: Date,
  toDate: Date
) {
  const milliseconds = toDate.getTime() - fromDate.getTime();

  const days = Math.max(
    0,
    Math.floor(milliseconds / (1000 * 60 * 60 * 24))
  );

  const interest =
    principal *
    (monthlyRate / 100) *
    (days / 30);

  return {
    days,
    interest: Number(interest.toFixed(2)),
  };
}
