import { useCallback, useEffect, useMemo, useRef } from 'react'
import BasicGrid from './BasicGrid.jsx'
import { employeeColDefs } from '../../data/employeeColDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'

const STATUS_OPTIONS = ['승인대기', '승인완료', '반려']

/**
 * 경비(직원) 표 전용 그리드 — employeeColDefs·부서 정렬·합계 행·편집 등
 */
function EmployeeGrid({
    rowData,
    deptSort,
    secondaryField,
    secondarySort,
    onSortChange,
    isEditing = false,
    onCellEdit,
    defaultColDef,
    editExitCancelRef,
    gridControlRef,
}) {
    const gridRef = useRef(null)

    // GridPage에서 stopEditing 호출할 수 있도록 API 노출
    useEffect(() => {
        if (!gridControlRef) return
        gridControlRef.current = {
            stopEditing: (cancel) => gridRef.current?.api?.stopEditing(cancel),
        }
    })

    // 편집 모드 종료 시 활성 셀 편집 종료. cancel=true면 값 커밋 없이 닫음
    useEffect(() => {
        if (!isEditing) {
            const cancel = editExitCancelRef?.current ?? false
            gridRef.current?.api?.stopEditing(cancel)
            if (editExitCancelRef) {
                editExitCancelRef.current = false
            }
        }
    }, [isEditing, editExitCancelRef])

    // isEditing에 따라 편집 가능 열·에디터 설정 (status: 드롭다운, reason: 텍스트)
    const columnDefs = useMemo(
        () =>
            employeeColDefs.map((col) => {
                const def = {
                    ...col,
                    comparator: () => 0,
                    editable: false,
                }
                if (col.field === 'department') {
                    def.sort = deptSort
                } else if (col.field === secondaryField && secondarySort) {
                    def.sort = secondarySort
                } else {
                    def.sort = null
                }

                if (isEditing && col.field === 'status') {
                    def.cellRenderer = undefined
                    def.editable = (params) => !params.data?.isSummary
                    def.cellEditor = 'agSelectCellEditor'
                    def.cellEditorParams = { values: STATUS_OPTIONS }
                    def.singleClickEdit = true
                }

                if (isEditing && col.field === 'reason') {
                    def.editable = (params) =>
                        !params.data?.isSummary && params.data?.status === '반려'
                    def.cellEditor = 'agTextCellEditor'
                    def.singleClickEdit = true
                }

                return def
            }),
        [deptSort, secondaryField, secondarySort, isEditing],
    )

    // AG Grid 정렬 이벤트 → GridPage의 deptSort / secondaryField·Sort 로 전달
    const onSortChanged = useCallback(
        (event) => {
            const state = event.api.getColumnState()
            const deptCol = state.find((c) => c.colId === 'department')
            const secCol = state.find(
                (c) => c.colId !== 'department' && c.sort != null,
            )
            const updates = {}
            if (deptCol?.sort && deptCol.sort !== deptSort) {
                updates.deptSort = deptCol.sort
            }
            const nextField = secCol?.colId ?? null
            const nextSort = secCol?.sort ?? null
            if (
                nextField !== secondaryField ||
                nextSort !== secondarySort
            ) {
                updates.secondaryField = nextField
                updates.secondarySort = nextSort
            }
            if (Object.keys(updates).length > 0) {
                onSortChange(updates)
            }
        },
        [deptSort, secondaryField, secondarySort, onSortChange],
    )

    // 셀 값 변경 완료 → GridPage handleCellEdit 호출 (합계 행·동일 값 제외)
    const onCellValueChanged = useCallback(
        (event) => {
            if (event.data?.isSummary || event.newValue === event.oldValue) return
            if (event.data?.id == null) return

            onCellEdit?.(event.data.id, event.colDef.field, event.newValue)
        },
        [onCellEdit],
    )

    // 행 고유 ID — 합계 행은 summary-{부서}, 일반 행은 id
    const getRowId = useCallback((params) => {
        if (params.data?.isSummary) {
            return `summary-${params.data.department}`
        }
        return String(params.data.id)
    }, [])

    // 합계 행에 summary-row CSS 클래스 적용
    const getRowClass = useCallback(
        (params) => (params.data?.isSummary ? 'summary-row' : ''),
        [],
    )

    return (
        <BasicGrid
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            enableCellSpan={true}
            postSortRows={postSortSummaryLast}
            getRowClass={getRowClass}
            getRowId={getRowId}
            onSortChanged={onSortChanged}
            onCellValueChanged={onCellValueChanged}
        />
    )
}

export default EmployeeGrid
