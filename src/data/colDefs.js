export const colDefs = [
    {
        field: 'department',
        headerName: '부서',
        sortable: true,
        sort: 'asc',
        // sort / comparator는 BasicGrid에서 deptSort props로 덮어씀 (GridPage가 전체 정렬 담당)
        /*
        comparator: (valueA, valueB, nodeA, nodeB) => {
            const a = valueA ?? ''
            const b = valueB ?? ''
            if (a === b) {
                const summaryA = nodeA.data?.isSummary ? 1 : 0
                const summaryB = nodeB.data?.isSummary ? 1 : 0
                return summaryA - summaryB
            }
            return a.localeCompare(b, 'ko')
        },*/
        spanRows: ({ valueA, valueB }) => valueA === valueB,
    },
    // 합계 행: name 1칸에 "개발팀 합계"
    { field: 'name', headerName: '이름' },
    {
        field: 'age',
        headerName: '나이',
        colSpan: (params) => (params.data?.isSummary ? 3 : 1),
        valueGetter: (params) => {
            if (params.data?.isSummary) return params.data.amount
            return params.data?.age
        },
        valueFormatter: (params) => {
            if (params.data?.isSummary && params.value != null) {
                return params.value.toLocaleString() + '원'
            }
            return params.value
        },
        cellClass: (params) => (params.data?.isSummary ? 'summary-amount-cell' : ''),
    },
    { field: 'amount', headerName: '금액', colSpan: (params) => (params.data?.isSummary ? 0 : 1) },
    { field: 'status', headerName: '상태', colSpan: (params) => (params.data?.isSummary ? 0 : 1) },
]
