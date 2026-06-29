/** 반려 사유 입력 - placeholder·검증 메시지 */
export const REJECT_REASON_PLACEHOLDER = '반려 사유를 입력해주세요.'
export const REJECT_REASON_REQUIRED_MSG = '반려 사유를 입력해주세요.'
export const SAVE_CONFIRM_MSG = '저장하시겠습니까?'

/** 반려 상태인데 사유가 비어 있으면 true */
export function isRejectReasonMissing(row) {
    if (row?.isSummary) return false
    if (row?.status !== '반려') return false
    const reason = row.reason
    return reason == null || reason === '-' || String(reason).trim() === ''
}

/** draft 전체에서 반려 사유 누락 행이 하나라도 있으면 true */
export function hasMissingRejectReason(rows) {
    return (rows ?? []).some(isRejectReasonMissing)
}

/** 반려 사유가 비어 있는 첫 번째 행 id (저장 검증 후 focus 이동용) */
export function findFirstMissingRejectReasonId(rows) {
    const row = (rows ?? []).find(isRejectReasonMissing)
    return row?.id ?? null
}

/** 편집기·표시용 - '-' 또는 빈 값을 빈 문자열로 */
export function normalizeReasonForEdit(value) {
    if (value == null || value === '-') return ''
    return String(value)
}
