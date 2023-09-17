export function ProjSpread(i, projCount, vx, vy) {
    let totalSpread = 60/projCount + projCount * 10;
    if (totalSpread > 120) totalSpread = 120;
    const degPerProj = totalSpread / projCount;
    const fromMiddle = i-(1+projCount)/2;
    let angleInDegrees = degPerProj * fromMiddle;
    const angleInRadians = (angleInDegrees * Math.PI) / 180;

    return {
        x: vx * Math.cos(angleInRadians) - vy * Math.sin(angleInRadians),
        y: vx * Math.sin(angleInRadians) + vy * Math.cos(angleInRadians)
    }
}