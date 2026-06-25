export function postSortSummaryLast(params) {
    const rowNodes = params.nodes

    let start = 0
    while (start < rowNodes.length) {
        const dept = rowNodes[start].data?.department
        let end = start + 1

        // 같은 department가 연속된 구간 [start, end) 찾기
        while (end < rowNodes.length && rowNodes[end].data?.department === dept) {
            end++
        }

        // 이 구간 안에서 합계 행 찾아 맨 끝(end - 1 위치)으로 이동
        for (let i = start; i < end; i++) {
            if (rowNodes[i].data?.isSummary) {
                const summaryNode = rowNodes.splice(i, 1)[0]
                rowNodes.splice(end - 1, 0, summaryNode)
                break
            }
        }

        start = end
    }
}
