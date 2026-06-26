import StatusCellRenderer from '../components/Grid/StatusCellRenderer.jsx'

export const colDefs = [
    {
        field: 'department',
        headerName: '부서',
        pinned: 'left', // 왼쪽 고정
        lockPinned: true,      // 사용자가 고정 해제 못 함
        cellClass: 'cell-dept',
        width: 120,
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
    // 합계 행: name 열에 "합계"
    {
        field: 'name',
        headerName: '이름',
        width: 120,
        sortable: true,
        cellClass: (params) => (params.data?.isSummary ? 'summary-label-cell' : ''),
    },
    {
        field: 'usage',
        headerName: '사용처',
        width: 160,
        sortable: false,
        colSpan: (params) => (params.data?.isSummary ? 2 : 1),
        valueGetter: (params) => {
            if (params.data?.isSummary) return params.data.amount
            return params.data?.usage
        },
        valueFormatter: (params) => {
            if (params.data?.isSummary && params.value != null) {
                return params.value.toLocaleString() + '원'
            }
            return params.value
        },
        cellClass: (params) => (params.data?.isSummary ? 'summary-amount-cell' : ''),
    },
    {
        field: 'amount',
        headerName: '금액',
        flex:1, minWidth:160,
        sortable: true,
        colSpan: (params) => (params.data?.isSummary ? 0 : 1),
        cellClass: 'cell-amount',
        valueFormatter: (p) =>
            p.value != null ? p.value.toLocaleString() + '원' : '-',
    },
    {
        field: 'status',
        headerName: '상태',
        width: 120,
        sortable: true,
        cellRenderer: StatusCellRenderer,
        // 합계 행 "승인건 합계" — 셀 배경은 cellClass (span이 아님)
        cellClass: (params) => (params.data?.isSummary ? 'summary-label-cell' : ''),
    },
    {
        field: 'reason',
        headerName: '사유',
        flex: 1,
        minWidth: 320,
        sortable: false,
        // 합계 행도 표시 (colSpan: 0 이면 셀이 숨겨져 reason 값이 안 보임)
        cellClass: (params) => (params.data?.isSummary ? 'summary-reason-cell' : ''),
    },
]
