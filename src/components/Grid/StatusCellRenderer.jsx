import { STATUS_CLASS_MAP } from './statusConfig.js'

/**
 * 상태 열 cellRenderer — 보기 모드 전용 (뱃지만 표시)
 * employeeColDefs.js에 기본 등록. 편집 모드에서는 StatusCellEditRenderer로 교체
 */
function StatusCellRenderer({ value, data }) {
    // 합계 행: addDepartmentSubtotals의 status 값 그대로 표시 (뱃지 X)
    if (data?.isSummary) {
        return value ? <span className="status-summary">{value}</span> : null
    }

    const cls = STATUS_CLASS_MAP[value] ?? ''
    return <span className={cls}>{value}</span>
}

export default StatusCellRenderer
