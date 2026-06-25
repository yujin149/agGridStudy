export function addDepartmentSubtotals(rows) {
    const result = []
    let i = 0

    while (i < rows.length) {
        const dept = rows[i].department
        const group = []

        while (i < rows.length && rows[i].department === dept) {
            group.push(rows[i])
            i++
        }

        result.push(...group)

        // 승인완료 행만 금액 합산 (reason 열에 표시)
        const approvedAmount = group
            .filter((row) => row.status === '승인완료')
            .reduce((sum, row) => sum + row.amount, 0)
        const approvedCount = group.filter((row) => row.status === '승인완료').length

        // 부서 맨 마지막에 합계 1줄
        // department를 비우면 sort: 'asc' 시 빈 값이 맨 위로 올라감 → 부서명 유지
        result.push({
            department: dept,
            name: `합계`,
            usage: null,
            amount: group.reduce((sum, row) => sum + row.amount, 0),
            status: '승인건 합계',
            reason:
                approvedCount > 0
                    ? `${approvedAmount.toLocaleString()}원`
                    : '승인완료 0건',
            isSummary: true,
        })
    }

    return result
}