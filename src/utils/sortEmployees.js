/** 2차 정렬 - amount는 숫자, 그 외는 localeCompare(ko) */
function compareField(a, b, field) {    if (field === 'amount') {
        return (a.amount ?? 0) - (b.amount ?? 0)
    }
    const va = a[field] ?? ''
    const vb = b[field] ?? ''
    return String(va).localeCompare(String(vb), 'ko')
}

/** rows 복사 후 1순위 부서·2순위 선택 열 정렬 (부서 그룹 내에서만 2차 정렬) */
export function sortEmployees(
    rows,
    { deptSort = 'asc', secondaryField = null, secondarySort = null }
) {
    return [...rows].sort((a, b) => {
        const deptCmp = a.department.localeCompare(b.department, 'ko')
        const byDept = deptSort === 'asc' ? deptCmp : -deptCmp
        if (byDept !== 0) return byDept
        if (!secondaryField || !secondarySort) return 0
        const cmp = compareField(a, b, secondaryField)
        return secondarySort === 'asc' ? cmp : -cmp
    })
}