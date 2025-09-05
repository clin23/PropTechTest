export async function POST(req: Request) {
  const { currentRent = 0, cpiPercent = 0, targetPercent = 0, targetAmount = 0 } = await req.json();
  const base = parseFloat(currentRent);
  const percent = parseFloat(targetPercent) || parseFloat(cpiPercent);
  const amount = parseFloat(targetAmount);
  let newRent = base;
  if (!isNaN(percent) && percent !== 0) {
    newRent = base * (1 + percent / 100);
  } else if (!isNaN(amount) && amount !== 0) {
    newRent = base + amount;
  }
  return Response.json({ newRent });
}
