import { useEffect, useRef, useState } from 'react'
import { normalizeReasonForEdit, REJECT_REASON_PLACEHOLDER } from './reasonConfig.js'

/**
 * 사유 열 cellEditor - 반려 행 전용, placeholder
 * 반려 사유 필수 검증은 GridPage 저장 시에만 수행
 */
function ReasonCellEditor({ value, onValueChange, stopEditing }) {
    const inputRef = useRef(null)
    const [text, setText] = useState(() => normalizeReasonForEdit(value))

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleChange = (event) => {
        const next = event.target.value
        setText(next)
        onValueChange(next)
    }

    return (
        <input
            ref={inputRef}
            type="text"
            className="ag-input-field-input ag-text-field-input"
            value={text}
            placeholder={REJECT_REASON_PLACEHOLDER}
            onChange={handleChange}
            onBlur={() => stopEditing()}
        />
    )
}

export default ReasonCellEditor
