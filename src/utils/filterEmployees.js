export const STATUS_OPTIONS = ['승인대기', '승인완료', '반려']

/** 이름·사용처·사유 부분 일치 검색 대상 필드 */
const SEARCH_FIELDS = ['name', 'usage', 'reason']

/**
 * 직원 행 필터
 * @param {object[]} rows - 원본 행 (합계 행 제외)
 * @param {string} keyword - 검색어 (이름·사용처·사유 OR 검색)
 * @param {string[]} statuses - 선택된 상태 (전체 선택 = 필터 없음, 0개 = 결과 없음)
 */
export function filterEmployees(rows, { keyword, statuses }) {
    const q = keyword.trim().toLowerCase()
    const allStatusesSelected = statuses.length === STATUS_OPTIONS.length
    const noStatusSelected = statuses.length === 0

    return rows.filter((row) => {
        if (row.isSummary) return false

        const matchKeyword =
            !q ||
            SEARCH_FIELDS.some((field) =>
                String(row[field] ?? '')
                    .toLowerCase()
                    .includes(q),
            )

        let matchStatus = true
        if (noStatusSelected) {
            matchStatus = false
        } else if (!allStatusesSelected) {
            matchStatus = statuses.includes(row.status)
        }

        return matchKeyword && matchStatus
    })
}
