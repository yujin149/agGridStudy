/**
 * 상태 열 cellRenderer
 *
 * HTML 문자열(`return '<span>...</span>'`)은 ag-grid-react에서
 * 태그가 그대로 텍스트로 나올 수 있어, React 컴포넌트로 렌더합니다.
 * (로직은 동일: 값 → class 매핑 → span으로 감싸기)
 */
const STATUS_CLASS_MAP = {
    승인완료: 'status-done',
    승인대기: 'status-pending',
    반려: 'status-rejected',
}

function StatusCellRenderer({ value, data }) {
    // 합계 행: addDepartmentSubtotals의 status 값 그대로 표시 (뱃지 X)
    if (data?.isSummary) {
        return value ? <span className="status-summary">{value}</span> : null
    }

    const cls = STATUS_CLASS_MAP[value] ?? ''
    return <span className={cls}>{value}</span>
}

export default StatusCellRenderer
