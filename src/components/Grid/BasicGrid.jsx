import { useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { colDefs as initialColDefs } from '../../data/colDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'
import { themeQuartz } from 'ag-grid-community'
import styles from './BasicGrid.module.css'

/**
 * AG Grid Quartz 테마 커스텀
 * - 색상은 variables.css의 CSS 변수 사용 → data-theme='dark' 시 자동 전환
 * - 데이터 셀 글자색 = foregroundColor (headerTextColor는 헤더만)
 */
const gridTheme = themeQuartz.withParams({
    headerBackgroundColor: 'var(--primary-color-50)',   // 헤더 행 배경색 (부서·이름·나이… 열 제목 줄)
    headerTextColor: 'var(--gray-color-700)',           // 헤더 글자색 (열 제목 텍스트만)
    backgroundColor: 'var(--card-background-color)',    // 그리드·데이터 셀 배경색
    borderColor: 'var(--border-color)',                 // 셀·헤더 테두리 색
    foregroundColor: 'var(--text-primary-color)',       // 데이터 셀 글자색 (행 안의 텍스트 — 홍길동, 120000원, 승인완료 등)
    rowBorder: true,                                    // 행과 행 사이 가로 구분선
    headerRowBorder: {                                  // 헤더 아래 구분선
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    columnBorder: true,
    // 고정 열과 스크롤 영역 사이 세로선 (테마 API)
    pinnedColumnBorder: {                               // 열과 열 사이 세로 구분선
        width: 3,
        style: 'solid',
        color: 'var(--border-color)',
    },
    fontFamily: 'var(--font-family)',                   // 데이터 셀 폰트 (헤더·본문 공통 기본)
    fontSize: 14,                                       // 데이터 셀 글자 크기 (px)
    headerFontSize: 14,                                 // 헤더 글자 크기 (px)
    headerFontWeight: 600,                              // 헤더 글자 굵기 (600 = semi-bold)
    spacing: 8,                                         // 행 높이·셀 패딩 (작을수록 촘촘)
    wrapperBorder: true,                                // 그리드 바깥 테두리
    wrapperBorderRadius: 0,                             // 그리드 바깥 모서리 둥글기 (0 = 직각)
})

function BasicGrid({ rowData, deptSort, onDeptSortChange }) {
    const colDefs = useMemo(
        () =>
            initialColDefs.map((col) => {
                if (col.field !== 'department') return col
                return {
                    ...col,
                    sort: deptSort,
                    comparator: () => 0,
                }
            }),
        [deptSort]
    )

    const onSortChanged = useCallback(
        (event) => {
            const departmentCol = event.api
                .getColumnState()
                .find((c) => c.colId === 'department')
            const nextSort = departmentCol?.sort
            if (nextSort && nextSort !== deptSort) {
                onDeptSortChange(nextSort)
            }
        },
        [deptSort, onDeptSortChange]
    )

    return (
        <div style={{ height: 400, width: '100%' }} className={styles.gridWrap}>
            <AgGridReact
                theme={gridTheme}
                rowData={rowData}
                defaultColDef={{ suppressMovable: true }} // 전체 기본값 = 모든 열 위치 수정 불가
                columnDefs={colDefs}
                enableCellSpan={true}
                getRowClass={(params) =>
                    params.data?.isSummary ? 'summary-row' : ''
                }
                postSortRows={postSortSummaryLast}
                onSortChanged={onSortChanged}
            />
        </div>
    )
}

export default BasicGrid
