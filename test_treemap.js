import fs from 'fs';

function binaryTreemap(data, x, y, w, h) {
    if (data.length === 0) return [];
    if (data.length === 1) {
        return [{ ...data[0], x, y, w, h }];
    }
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let halfSum = 0;
    let splitIndex = 1;
    for (let i = 0; i < data.length; i++) {
        halfSum += data[i].value;
        if (halfSum >= total / 2) {
            const prevDiff = Math.abs(total / 2 - (halfSum - data[i].value));
            const currDiff = Math.abs(total / 2 - halfSum);
            splitIndex = (prevDiff < currDiff && i > 0) ? i : i + 1;
            break;
        }
    }
    if (splitIndex <= 0) splitIndex = 1;
    if (splitIndex >= data.length) splitIndex = data.length - 1;

    const leftData = data.slice(0, splitIndex);
    const rightData = data.slice(splitIndex);
    const leftWeight = leftData.reduce((acc, d) => acc + d.value, 0);
    const ratio = leftWeight / total;

    if (w > h) {
        const leftW = w * ratio;
        return [
            ...binaryTreemap(leftData, x, y, leftW, h),
            ...binaryTreemap(rightData, x + leftW, y, w - leftW, h)
        ];
    } else {
        const leftH = h * ratio;
        return [
            ...binaryTreemap(leftData, x, y, w, leftH),
            ...binaryTreemap(rightData, x, y + leftH, w, h - leftH)
        ];
    }
}

const data = [
    { domain: 'A', value: 417 },
    { domain: 'B', value: 365 },
    { domain: 'C', value: 330 },
    { domain: 'D', value: 269 },
    { domain: 'E', value: 247 },
    { domain: 'F', value: 122 },
    { domain: 'G', value: 91 },
    { domain: 'H', value: 55 },
];

const res = binaryTreemap(data, 0, 0, 100, 100);
console.log(JSON.stringify(res, null, 2));
