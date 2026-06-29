import { useCallback, useEffect, useMemo, useRef } from 'react'
import BasicGrid from './BasicGrid.jsx'
import { employeeColDefs } from '../../data/employeeColDefs.js'
import { postSortSummaryLast } from '../../utils/postSortSummaryLast.js'
import StatusCellEditor from './StatusCellEditor.jsx'
import StatusCellEditRenderer from './StatusCellEditRenderer.jsx'
import ReasonCellEditor from './ReasonCellEditor.jsx'

/**
 * 경비(직원) 표 전용 그리드
 * - employeeColDefs·부서/2차 정렬·합계 행·편집(상태 드롭다운·반려 사유)
 * - GridPage draft 연동·scheduleReasonFocus
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
    const statusCellWasEditingRef = useRef(false) // 상태 셀 재클릭 닫기용 - mousedown 시점 편집 여부
    const pendingReasonEditIdRef = useRef(null) // 사유 셀 자동 focus 대기 id (반려 변경·저장 검증 실패)

    // id에 해당하는 사유 셀 편집 시작 - 성공 시 pending 해제
    const focusReasonCellById = useCallback((id) => {
        const api = gridRef.current?.api
        if (!api || id == null) return false

        const rowNode = api.getRowNode(String(id))
        if (!rowNode || rowNode.data?.status !== '반려' || rowNode.data?.isSummary) {
            return false
        }

        api.ensureIndexVisible(rowNode.rowIndex)
        api.startEditingCell({
            rowIndex: rowNode.rowIndex,
            colKey: 'reason',
        })
        pendingReasonEditIdRef.current = null
        return true
    }, [])

    // alert 닫힌 뒤 그리드 준비될 때까지 재시도 (같은 페이지·페이지 이동 모두)
    const scheduleReasonFocus = useCallback(
        (id) => {
            pendingReasonEditIdRef.current = id
            const tryFocus = () => focusReasonCellById(id)
            setTimeout(tryFocus, 0)
            setTimeout(tryFocus, 50)
            setTimeout(tryFocus, 150)
        },
        [focusReasonCellById],
    )

    // 해당 행·status 열이 현재 편집(드롭다운 열림) 중인지 확인
    const isStatusCellEditing = useCallback((api, rowIndex) => {
        return (api.getEditingCells?.() ?? []).some(
            (cell) =>
                cell.rowIndex === rowIndex && cell.column?.getColId() === 'status',
        )
    }, [])

    // 상태 셀 재클릭 시 드롭다운 닫기 - mousedown 시점에 이미 편집 중인지 기록
    const onCellMouseDown = useCallback(
        (event) => {
            if (!isEditing || event.colDef.field !== 'status' || event.data?.isSummary) {
                return
            }
            statusCellWasEditingRef.current = isStatusCellEditing(
                event.api,
                event.rowIndex,
            )
        },
        [isEditing, isStatusCellEditing],
    )

    // 상태 셀 재클릭 시 드롭다운 닫기 - click 시점에 편집 중이었으면 stopEditing
    const onCellClicked = useCallback(
        (event) => {
            if (!isEditing || event.colDef.field !== 'status' || event.data?.isSummary) {
                return
            }
            if (statusCellWasEditingRef.current) {
                event.api.stopEditing()
            }
        },
        [isEditing],
    )

    // GridPage에서 stopEditing·사유 셀 focus 호출용 API 노출
    useEffect(() => {
        if (!gridControlRef) return
        gridControlRef.current = {
            stopEditing: (cancel) => gridRef.current?.api?.stopEditing(cancel),
            scheduleReasonFocus,
        }
    }, [gridControlRef, scheduleReasonFocus])

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

    // pendingReasonEditIdRef - rowData 갱신(페이지 이동·반려 변경) 후 사유 셀 편집 시작
    useEffect(() => {
        const id = pendingReasonEditIdRef.current
        if (id == null || !isEditing) return

        focusReasonCellById(id)
        const t = setTimeout(() => focusReasonCellById(id), 0)
        return () => clearTimeout(t)
    }, [rowData, isEditing, focusReasonCellById])

    // isEditing에 따라 편집 가능 열·에디터 설정 (status: 뱃지 드롭다운, reason: 텍스트)
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
                    def.cellRenderer = StatusCellEditRenderer // 편집 모드 셀: 뱃지 + 화살표
                    def.cellClass = (params) =>
                        params.data?.isSummary ? 'summary-label-cell' : 'status-editable-cell' // pointer
                    def.editable = (params) => !params.data?.isSummary
                    def.cellEditor = StatusCellEditor // 클릭 시 뱃지 드롭다운 팝업
                    def.cellEditorPopup = true // 셀 아래 팝업 (셀 크기에 가리지 않음)
                    def.cellEditorPopupPosition = 'under'
                    def.singleClickEdit = true
                }

                if (isEditing && col.field === 'reason') {
                    def.editable = (params) =>
                        !params.data?.isSummary && params.data?.status === '반려'
                    def.cellEditor = ReasonCellEditor // placeholder (사유 필수 검증은 저장 시)
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

            // 반려 선택 시 draft 반영 후 사유 셀로 자동 focus
            if (event.colDef.field === 'status' && event.newValue === '반려') {
                scheduleReasonFocus(event.data.id)
            }
        },
        [onCellEdit, scheduleReasonFocus],
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
            onCellMouseDown={onCellMouseDown}
            onCellClicked={onCellClicked}
            stopEditingWhenCellsLoseFocus={isEditing} // 편집 모드: 목록 바깥 클릭 시 드롭다운 닫기
        />
    )
}

export default EmployeeGrid
