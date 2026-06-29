import icoArrow from '../../assets/images/ico-arrow.svg'
import { STATUS_CLASS_MAP } from './statusConfig.js'

/**
 * 상태 열 cellRenderer — 편집 모드 전용 (뱃지 + 우측 화살표)
 * 드롭다운을 열기 전 셀 표시. StatusCellRenderer 대신 EmployeeGrid에서 사용
 */
function StatusCellEditRenderer({ value, data }) {
    // 합계 행: 뱃지·화살표 없이 텍스트만
    if (data?.isSummary) {
        return value ? <span className="status-summary">{value}</span> : null
    }

    const cls = STATUS_CLASS_MAP[value] ?? ''

    return (
        <span className="status-cell-edit">
            <span className={cls}>{value}</span>
            {/* 드롭다운 선택 가능 표시 - BasicGrid.module.css .status-cell-arrow */}
            <img src={icoArrow} alt="" className="status-cell-arrow" aria-hidden="true" />
        </span>
    )
}

export default StatusCellEditRenderer
