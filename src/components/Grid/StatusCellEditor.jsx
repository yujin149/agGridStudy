import { STATUS_CLASS_MAP, STATUS_OPTIONS } from './statusConfig.js'
import styles from './StatusCellEditor.module.css'

/**
 * 상태 열 cellEditor - 뱃지 스타일 드롭다운 (셀 클릭 시 팝업)
 * AG Grid v35 reactive custom component: value / onValueChange / stopEditing
 */
function StatusCellEditor({ value, onValueChange, stopEditing }) {
    // 옵션 선택 → 값 반영 후 편집 종료
    const handleSelect = (option) => {
        onValueChange(option)
        stopEditing()
    }

    return (
        <ul className={styles.list} role="listbox" aria-label="상태 선택">
            {STATUS_OPTIONS.map((option) => {
                const cls = STATUS_CLASS_MAP[option] ?? ''
                const selected = option === value
                return (
                    <li key={option} role="option" aria-selected={selected}>
                        <button
                            type="button"
                            className={styles.option}
                            onMouseDown={(event) => {
                                // blur로 편집이 닫히기 전에 선택 처리 (click 대신 mousedown)
                                event.preventDefault()
                                handleSelect(option)
                            }}
                        >
                            <span className={cls}>{option}</span>
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

export default StatusCellEditor
