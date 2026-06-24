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

        // 부서 맨 마지막에 합계 1줄
        // department를 비우면 sort: 'asc' 시 빈 값이 맨 위로 올라감 → 부서명 유지
        result.push({
            department: dept,
            name: `${dept} 합계`,
            age: null,
            amount: group.reduce((sum, row) => sum + row.amount, 0),
            status: '',
            isSummary: true,
        })
    }

    return result
}